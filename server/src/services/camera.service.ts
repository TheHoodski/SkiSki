import { MetricsService } from './metrics.service';
import ffmpeg from 'fluent-ffmpeg';
import { logger } from '../utils/logger';
import path from 'path';

export class CameraService {
    private readonly streamUrl: string;
    private readonly framesDir: string;
    private processingInterval: NodeJS.Timeout | null = null;  // Only declare once here
    private readonly metricsService: MetricsService;

    constructor() {
        this.streamUrl = 'https://streamer6.brownrice.com/parkcitymtnvillage/parkcitymtnvillage.stream/main_playlist.m3u8';
        this.framesDir = path.join(__dirname, '../../frames');
        this.metricsService = new MetricsService();
        this.validateFFmpeg();
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

    public async captureFrame(): Promise<string> {
        const filename = `frame-${Date.now()}.jpg`;
        const outputPath = path.join(this.framesDir, filename);
        
        logger.info(`Attempting to capture frame from: ${this.streamUrl}`);
        logger.info(`Saving to: ${outputPath}`);
        
        return new Promise((resolve, reject) => {
            ffmpeg(this.streamUrl)
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
                    logger.info(`Frame captured: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    logger.error('Error capturing frame:', err);
                    reject(err);
                })
                .run();
        });
    }

    public startProcessing(intervalMs: number = 300000) { // 5 minutes default
        logger.info('Starting camera processing service...');
        
        if (this.processingInterval) {
            logger.warn('Processing already running, restarting...');
            this.stopProcessing();
        }

        this.processingInterval = setInterval(async () => {
            try {
                const framePath = await this.captureFrame();
                const metrics = await this.metricsService.processFrame(framePath);
                logger.info('Processing results:', metrics);
            } catch (error) {
                logger.error('Error in processing interval:', error);
            }
        }, intervalMs);
    }

    public stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            logger.info('Camera processing stopped');
        }
    }
}