import { VisionService } from './vision.service';
import { logger } from '../utils/logger';

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
            
            return {
                timestamp: new Date(),
                crowdLevel: this.determineCrowdLevel(detection.count),
                confidence: detection.confidence,
                peopleCount: detection.count
            };
        } catch (error) {
            logger.error('Error processing frame for metrics:', error);
            throw error;
        }
    }
}