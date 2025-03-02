// server/src/index.ts

import express from 'express';
import cors from 'cors';
import { CameraService } from './services/camera.service';
import { logger } from './utils/logger';
import { initDb } from './utils/database';
import resortRoutes from './routes/resort.routes';
import metricsRoutes from './routes/metrics.routes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resorts', resortRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize database and start services
async function startServer() {
    try {
        // Initialize database
        await initDb();
        
        // Start the server
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
            
            // Start camera processing service
            const cameraService = new CameraService();
            cameraService.startProcessing(300000); // 5 minutes
            
            logger.info('All services started successfully');
        });
        
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received: closing HTTP server');
            process.exit(0);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();