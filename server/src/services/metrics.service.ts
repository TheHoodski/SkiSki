import { VisionService } from './vision.service';
import { logger } from '../utils/logger';
import { pool } from '../utils/database';

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface CrowdMetric {
    resortId: string;
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

    public async processFrame(resortId: string, imagePath: string): Promise<CrowdMetric> {
        try {
            const detection = await this.visionService.detectPeople(imagePath);
            const metric = {
                resortId,
                timestamp: new Date(),
                crowdLevel: this.determineCrowdLevel(detection.count),
                confidence: detection.confidence,
                peopleCount: detection.count
            };
    
            await pool.query(
                'INSERT INTO crowding_metrics (resort_id, timestamp, people_count, crowd_level, confidence) VALUES ($1, $2, $3, $4, $5)',
                [metric.resortId, metric.timestamp, metric.peopleCount, metric.crowdLevel, metric.confidence]
            );
    
            return metric;
        } catch (error) {
            logger.error('Error processing frame:', error);
            throw error;
        }
    }

    public async getLatestMetric(resortId: string): Promise<CrowdMetric | null> {
        try {
            const result = await pool.query(
                'SELECT * FROM crowding_metrics WHERE resort_id = $1 ORDER BY timestamp DESC LIMIT 1',
                [resortId]
            );

            if (result.rows.length === 0) return null;

            return {
                resortId: result.rows[0].resort_id,
                timestamp: result.rows[0].timestamp,
                crowdLevel: result.rows[0].crowd_level,
                confidence: result.rows[0].confidence,
                peopleCount: result.rows[0].people_count
            };
        } catch (error) {
            logger.error('Error fetching latest metric:', error);
            throw error;
        }
    }
}