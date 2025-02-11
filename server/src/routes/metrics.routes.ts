// server/src/routes/metrics.routes.ts
import express from 'express';
import { pool } from '../utils/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Get latest metrics
router.get('/current', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM crowding_metrics 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        res.json(result.rows[0] || null);
    } catch (error) {
        logger.error('Error fetching current metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// Get historical metrics for last 24 hours
router.get('/history', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM crowding_metrics 
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            ORDER BY timestamp DESC
        `);
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching metrics history:', error);
        res.status(500).json({ error: 'Failed to fetch metrics history' });
    }
});

// Store new metrics
router.post('/', async (req, res) => {
    const { people_count, confidence } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO crowding_metrics (timestamp, people_count, confidence)
            VALUES (NOW(), $1, $2)
            RETURNING *
        `, [people_count, confidence]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error storing metrics:', error);
        res.status(500).json({ error: 'Failed to store metrics' });
    }
});

export default router;