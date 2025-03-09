// server/src/services/camera.service.ts

import { MetricsService } from './metrics.service';
import ffmpeg from 'fluent-ffmpeg';
import { logger } from '../utils/logger';
import { pool } from '../utils/database';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export type WebcamType = 'direct_stream' | 'static_image' | 'youtube' | 'other';

export interface ResortCamera {
  resortId: string;
  name: string;
  streamUrl: string;
  webcamType: WebcamType;
  youtubeVideoId?: string;
  processingActive: boolean;
  lastProcessed?: Date;
}

export class CameraService {
    private readonly framesDir: string;
    private resortCameras: Map<string, ResortCamera> = new Map();
    private processingIntervals: Map<string, NodeJS.Timeout> = new Map();
    private readonly metricsService: MetricsService;

    constructor() {
        this.framesDir = path.join(__dirname, '../../frames');
        this.metricsService = new MetricsService();
        this.validateFFmpeg();
        this.ensureFramesDirectory();
    }

    private validateFFmpeg(): void {
        ffmpeg.getAvailableFormats((err, formats) => {
            if (err) {
                logger.error('FFmpeg validation failed:', err);
                throw new Error('FFmpeg is not properly installed');
            }
            logger.info('FFmpeg is properly configured');
        });
    }

    private ensureFramesDirectory(): void {
        if (!fs.existsSync(this.framesDir)) {
            fs.mkdirSync(this.framesDir, { recursive: true });
            logger.info(`Created frames directory: ${this.framesDir}`);
        }
    }

    /**
     * Load all resorts from the database and initialize their camera services
     */
    public async loadResortsFromDatabase(): Promise<void> {
        try {
            // Use a custom SQL query that doesn't rely on the column names being recognized in the schema
            const result = await pool.query(`
                SELECT 
                    resort_id as "resortId", 
                    name as "name", 
                    base_cam_url as "baseCamUrl",
                    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resorts' AND column_name='webcam_type')
                        THEN webcam_type 
                        ELSE 'direct_stream' END) as "webcamType",
                    (CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resorts' AND column_name='youtube_video_id')
                        THEN youtube_video_id 
                        ELSE NULL END) as "youtubeVideoId"
                FROM resorts 
                WHERE base_cam_url IS NOT NULL AND base_cam_url != ''
            `);
    
            for (const resort of result.rows) {
                this.addResortCamera(
                    resort.resortId,
                    resort.name,
                    resort.baseCamUrl,
                    resort.webcamType || 'direct_stream',
                    resort.youtubeVideoId
                );
            }
    
            logger.info(`Loaded ${this.resortCameras.size} resort cameras from database`);
        } catch (error) {
            logger.error('Failed to load resort cameras from database:', error);
            throw error;
        }
    }

    /**
     * Add a new resort camera to the service
     */
    public addResortCamera(
        resortId: string, 
        name: string, 
        streamUrl: string, 
        webcamType: WebcamType = 'direct_stream',
        youtubeVideoId?: string
    ): void {
        this.resortCameras.set(resortId, {
            resortId,
            name,
            streamUrl,
            webcamType,
            youtubeVideoId,
            processingActive: false
        });
        logger.info(`Added camera for resort: ${name} (${webcamType})`);
    }

    /**
     * Capture a frame from a specific resort's webcam
     */
    public async captureFrame(resortId: string): Promise<string> {
        const camera = this.resortCameras.get(resortId);
        if (!camera) {
            throw new Error(`Resort camera not found for ID: ${resortId}`);
        }

        const resortDirName = resortId.replace(/-/g, '').substring(0, 8);
        const resortFramesDir = path.join(this.framesDir, resortDirName);
        
        // Ensure resort-specific directory exists
        if (!fs.existsSync(resortFramesDir)) {
            fs.mkdirSync(resortFramesDir, { recursive: true });
        }

        const filename = `frame-${Date.now()}.jpg`;
        const outputPath = path.join(resortFramesDir, filename);
        
        // Handle different webcam types
        switch (camera.webcamType) {
            case 'direct_stream':
                return this.captureFromDirectStream(camera, outputPath);
            case 'static_image':
                return this.captureFromStaticImage(camera, outputPath);
            case 'youtube':
                return this.captureFromYouTube(camera, outputPath);
            case 'other':
                logger.warn(`Webcam type 'other' requires manual handling for ${camera.name}`);
                throw new Error(`Webcam type 'other' not supported for ${camera.name}`);
            default:
                throw new Error(`Unknown webcam type: ${camera.webcamType}`);
        }
    }

    /**
     * Capture from a direct video stream using FFmpeg
     */
    private captureFromDirectStream(camera: ResortCamera, outputPath: string): Promise<string> {
        logger.info(`Attempting to capture frame from direct stream: ${camera.streamUrl}`);
        
        return new Promise((resolve, reject) => {
            ffmpeg(camera.streamUrl)
                .inputOptions([
                    '-y',           // Overwrite output files
                    '-ss 0.5'      // Start at 0.5 seconds
                ])
                .outputOptions([
                    '-vframes 1',   // Capture exactly one frame
                    '-q:v 2'       // High quality output
                ])
                .output(outputPath)
                .on('start', (command) => {
                    logger.info(`FFmpeg command: ${command}`);
                })
                .on('end', () => {
                    logger.info(`Frame captured for ${camera.name}: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    logger.error(`Error capturing frame for ${camera.name}:`, err);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Capture from a static image URL
     */
    private async captureFromStaticImage(camera: ResortCamera, outputPath: string): Promise<string> {
        logger.info(`Attempting to download static image from: ${camera.streamUrl}`);
        
        try {
            const response = await axios({
                method: 'get',
                url: camera.streamUrl,
                responseType: 'arraybuffer',
                timeout: 10000
            });
            
            // Use explicit type assertion to tell TypeScript what the data is
            const buffer = Buffer.from(response.data as ArrayBuffer);
            fs.writeFileSync(outputPath, buffer);
            
            logger.info(`Image downloaded for ${camera.name}: ${outputPath}`);
            return outputPath;
        } catch (error) {
            logger.error(`Error downloading image for ${camera.name}:`, error);
            throw error;
        }
    }

    /**
     * Capture a frame from a YouTube video using Puppeteer
     */
    private async captureFromYouTube(camera: ResortCamera, outputPath: string): Promise<string> {
        if (!camera.youtubeVideoId) {
            throw new Error(`No YouTube video ID specified for resort: ${camera.name}`);
        }
        
        logger.info(`Attempting to capture YouTube frame for video ID: ${camera.youtubeVideoId}`);
        
        let browser;
        try {
            // Import puppeteer dynamically to avoid requiring it for non-YouTube resorts
            const puppeteer = await import('puppeteer');
            
            // Launch browser with minimal settings
            browser = await puppeteer.default.launch({
                headless: true, // Use headless mode
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1280,720'
                ]
            });
            
            const page = await browser.newPage();
            
            // Set viewport to 720p (typical webcam resolution)
            await page.setViewport({ width: 1280, height: 720 });
            
            // Navigate to YouTube embed with autoplay and mute enabled
            const embedUrl = `https://www.youtube.com/embed/${camera.youtubeVideoId}?autoplay=1&mute=1&controls=0`;
            logger.info(`Loading YouTube embed: ${embedUrl}`);
            
            await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for video player to be available and playing
            await page.waitForSelector('.html5-video-container video', { timeout: 10000 });
            
            // Wait a moment for the video to actually start playing
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Take screenshot
            logger.info(`Taking screenshot for ${camera.name}`);
            await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
            
            logger.info(`YouTube frame captured for ${camera.name}: ${outputPath}`);
            return outputPath;
        } catch (error) {
            logger.error(`Error capturing YouTube frame for ${camera.name}:`, error);
            throw error;
        } finally {
            // Make sure to close the browser
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Start processing for a specific resort camera
     */
    public startResortProcessing(resortId: string, intervalMs: number = 300000): void {
        const camera = this.resortCameras.get(resortId);
        if (!camera) {
            logger.error(`Cannot start processing: Resort camera not found for ID: ${resortId}`);
            return;
        }

        // Check if webcam type is supported
        if (camera.webcamType === 'other') {
            logger.warn(`Cannot start processing for ${camera.name}: Webcam type ${camera.webcamType} not directly supported`);
            return;
        }

        if (this.processingIntervals.has(resortId)) {
            logger.warn(`Processing already running for ${camera.name}, restarting...`);
            this.stopResortProcessing(resortId);
        }

        logger.info(`Starting camera processing for resort: ${camera.name}`);
        
        // Update camera status
        camera.processingActive = true;
        
        const intervalId = setInterval(async () => {
            try {
                const framePath = await this.captureFrame(resortId);
                const metrics = await this.metricsService.processFrame(resortId, framePath);
                logger.info(`Processing results for ${camera.name}:`, metrics);
                
                // Update last processed timestamp
                camera.lastProcessed = new Date();
            } catch (error) {
                logger.error(`Error in processing interval for ${camera.name}:`, error);
            }
        }, intervalMs);

        this.processingIntervals.set(resortId, intervalId);
    }

    /**
     * Stop processing for a specific resort camera
     */
    public stopResortProcessing(resortId: string): void {
        const intervalId = this.processingIntervals.get(resortId);
        if (intervalId) {
            clearInterval(intervalId);
            this.processingIntervals.delete(resortId);
            
            const camera = this.resortCameras.get(resortId);
            if (camera) {
                camera.processingActive = false;
                logger.info(`Camera processing stopped for resort: ${camera.name}`);
            }
        }
    }

    /**
     * Start processing for all supported resort cameras
     */
    public startAllProcessing(intervalMs: number = 300000): void {
        logger.info('Starting camera processing for all supported resorts...');
        
        for (const [resortId, camera] of this.resortCameras.entries()) {
            // Skip unsupported webcam types
            if (camera.webcamType === 'other') {
                logger.warn(`Skipping ${camera.name}: Webcam type ${camera.webcamType} not directly supported`);
                continue;
            }
            
            this.startResortProcessing(resortId, intervalMs);
        }
    }

    /**
     * Stop processing for all resort cameras
     */
    public stopAllProcessing(): void {
        logger.info('Stopping all camera processing');
        
        for (const resortId of this.processingIntervals.keys()) {
            this.stopResortProcessing(resortId);
        }
    }

    /**
     * Get status information for all resort cameras
     */
    public getStatusForAllResorts(): ResortCamera[] {
        return Array.from(this.resortCameras.values());
    }
}