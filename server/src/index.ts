// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { CameraService } from './services/camera.service';
import { logger } from './utils/logger';
import { pool, initDb, resetPool } from './utils/database';
import resortRoutes from './routes/resort.routes';
import metricsRoutes from './routes/metrics.routes';
import cameraRoutes, { setCameraService } from './routes/camera.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';


const app = express();
const port = process.env.PORT || 3000;
const CAMERA_PROCESSING_INTERVAL = parseInt(process.env.CAMERA_PROCESSING_INTERVAL || '300000'); // Default 5 minutes

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/resorts', resortRoutes);
app.use('/api/camera-control', cameraRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handler - must be last
app.use(errorHandler);

const cameraService = new CameraService();

// Initialize the camera service dependency in the routes
setCameraService(cameraService);

// Start the app
const startApp = async () => {
    try {
        //Reset the pool first
        await resetPool();
        logger.info('Database pool has been reset');

        // Initialize database
        await initDb();
        
        // Load resorts and initialize cameras
        await cameraService.loadResortsFromDatabase();
        
        // Start camera processing
        cameraService.startAllProcessing(CAMERA_PROCESSING_INTERVAL);
        
        // Start server
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
            logger.info(`Camera processing interval: ${CAMERA_PROCESSING_INTERVAL}ms`);
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
    cameraService.stopAllProcessing();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    cameraService.stopAllProcessing();
    process.exit(0);
});