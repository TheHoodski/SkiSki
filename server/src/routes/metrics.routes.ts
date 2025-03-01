// server/src/routes/metrics.routes.ts

import { Router } from 'express';
import { pool } from '../utils/database';
import { logger } from '../utils/logger';
import { createHandler } from '../utils/route-handler';

const router = Router();

// Define interfaces for route parameters
interface ResortIdParam {
    id: string;
}

interface HistoryQuery {
    hours?: string;
}

// Get latest metrics for all resorts
router.get('/', createHandler(async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT ON (resort_id)
                resort_id,
                timestamp,
                people_count,
                crowd_level,
                confidence
            FROM crowding_metrics
            ORDER BY resort_id, timestamp DESC
        `);
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
}));

// Get latest metric for a specific resort
router.get('/resort/:id', createHandler<ResortIdParam>(async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM crowding_metrics
            WHERE resort_id = $1
            ORDER BY timestamp DESC
            LIMIT 1
        `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'No metrics found for this resort' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching metrics for resort:', error);
        res.status(500).json({ error: 'Failed to fetch metrics for resort' });
    }
}));

// Get historical metrics for a specific resort
router.get('/resort/:id/history', createHandler<ResortIdParam, any, any, HistoryQuery>(async (req, res) => {
    try {
        const { id } = req.params;
        const { hours } = req.query;
        
        // Default to 24 hours if not specified
        const timeWindow = hours ? parseInt(hours) : 24;
        
        const result = await pool.query(`
            SELECT * FROM crowding_metrics
            WHERE resort_id = $1
            AND timestamp > NOW() - INTERVAL '${timeWindow} hours'
            ORDER BY timestamp DESC
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching historical metrics:', error);
        res.status(500).json({ error: 'Failed to fetch historical metrics' });
    }
}));

export default router;