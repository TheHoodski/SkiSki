// server/src/routes/camera.routes.ts

import { Router } from 'express';
import { logger } from '../utils/logger';
import { createHandler } from '../utils/route-handler';
import { CameraService } from '../services/camera.service';

const router = Router();

interface CameraParams {
    id: string;
}

interface IntervalQuery {
    interval?: string;
}

// Inject the camera service
let cameraService: CameraService;

export const setCameraService = (service: CameraService) => {
    cameraService = service;
};

// Get all camera statuses
router.get('/status', createHandler(async (req, res) => {
    try {
        const status = cameraService.getStatusForAllResorts();
        res.json(status);
    } catch (error) {
        logger.error('Error getting camera status:', error);
        res.status(500).json({ error: 'Failed to get camera status' });
    }
}));

// Start processing for a specific resort
router.post('/:id/start', createHandler<CameraParams, any, any, IntervalQuery>(async (req, res) => {
    try {
        const { id } = req.params;
        // Get the interval from query params or use default
        const interval = req.query.interval 
            ? parseInt(req.query.interval) 
            : 300000; // 5 minute default
        
        cameraService.startResortProcessing(id, interval);
        res.json({ success: true, message: 'Processing started' });
    } catch (error) {
        logger.error('Error starting camera processing:', error);
        res.status(500).json({ error: 'Failed to start camera processing' });
    }
}));

// Stop processing for a specific resort
router.post('/:id/stop', createHandler<CameraParams>(async (req, res) => {
    try {
        const { id } = req.params;
        cameraService.stopResortProcessing(id);
        res.json({ success: true, message: 'Processing stopped' });
    } catch (error) {
        logger.error('Error stopping camera processing:', error);
        res.status(500).json({ error: 'Failed to stop camera processing' });
    }
}));

// Start all camera processing
router.post('/start-all', createHandler<{}, any, any, IntervalQuery>(async (req, res) => {
    try {
        const interval = req.query.interval 
            ? parseInt(req.query.interval) 
            : 300000; // 5 minute default
        
        cameraService.startAllProcessing(interval);
        res.json({ success: true, message: 'All processing started' });
    } catch (error) {
        logger.error('Error starting all camera processing:', error);
        res.status(500).json({ error: 'Failed to start all camera processing' });
    }
}));

// Stop all camera processing
router.post('/stop-all', createHandler(async (req, res) => {
    try {
        cameraService.stopAllProcessing();
        res.json({ success: true, message: 'All processing stopped' });
    } catch (error) {
        logger.error('Error stopping all camera processing:', error);
        res.status(500).json({ error: 'Failed to stop all camera processing' });
    }
}));

export default router;