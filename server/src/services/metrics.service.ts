import { VisionService } from './vision.service';
import { logger } from '../utils/logger';
import { pool } from '../utils/database';

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface CrowdMetric {
    timestamp: Date;
    crowdLevel: CrowdLevel;
    confidence: number;
    peopleCount: number;
}

export class MetricsService {
    private visionService: VisionService;

    constructor() {
        this.visionService = new VisionService();
    }

    private determineCrowdLevel(peopleCount: number): CrowdLevel {
        if (peopleCount < 20) return 'low';
        if (peopleCount < 50) return 'medium';
        return 'high';
    }

    public async processFrame(imagePath: string): Promise<CrowdMetric> {
        try {
            const detection = await this.visionService.detectPeople(imagePath);
            const metric = {
                timestamp: new Date(),
                crowdLevel: this.determineCrowdLevel(detection.count),
                confidence: detection.confidence,
                peopleCount: detection.count
            };
    
            // Add this part to save to database
            await pool.query(
                'INSERT INTO crowding_metrics (timestamp, people_count, confidence, created_at) VALUES ($1, $2, $3, NOW())',
                [metric.timestamp, metric.peopleCount, metric.confidence]
            );
    
            return metric;
        } catch (error) {
            logger.error('Error processing frame:', error);
            throw error;
        }
    }
}