import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger';

interface DetectionResult {
    count: number;
    confidence: number;
}

export class VisionService {
    private pythonScript: string;

    constructor() {
        this.pythonScript = path.join(__dirname, '../python/detect_crowd.py');
    }

    public async detectPeople(imagePath: string): Promise<DetectionResult> {
        logger.info(`Executing Python script: ${this.pythonScript}`);
        logger.info(`Processing image: ${imagePath}`);
        
        return new Promise((resolve, reject) => {
            const process = spawn('python', [this.pythonScript, imagePath]);
            
            let output = '';
            let errorOutput = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
                logger.info(`Python stdout: ${data}`);
            });
    
            process.stderr.on('data', (data) => {
                errorOutput += data.toString();
                logger.error(`Python stderr: ${data}`);
            });
    
            process.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`Python exit code: ${code}`);
                    logger.error(`Error output: ${errorOutput}`);
                    reject(new Error(`Python process failed: ${errorOutput}`));
                    return;
                }
                
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (error) {
                    logger.error(`Failed to parse: ${output}`);
                    reject(error);
                }
            });
        });
    }
}