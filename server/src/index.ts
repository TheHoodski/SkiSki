// server/src/index.ts

import express from 'express';
import { CameraService } from './services/camera.service';
import { logger } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

const cameraService = new CameraService();

// Start the server and camera processing
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    cameraService.startProcessing(30000);
});

// Add a basic endpoint to check server status
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    cameraService.stopProcessing();
    process.exit(0);
});