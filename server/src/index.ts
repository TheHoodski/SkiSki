// server/src/index.ts
import resortRoutes from './routes/resort.routes';
import express from 'express';
import { CameraService } from './services/camera.service';
import { logger } from './utils/logger';
import { initDb } from './utils/database';
import metricsRoutes from './routes/metrics.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

const app = express();
const port = process.env.PORT || 3000;

// Middleware first
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);
app.use(errorHandler);

// Then routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/resorts', resortRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const cameraService = new CameraService();

// Start the app
const startApp = async () => {
    try {
        await initDb();
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
            cameraService.startProcessing(30000);
        });
    } catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    } 
};

startApp();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    cameraService.stopProcessing();
    process.exit(0);
});

