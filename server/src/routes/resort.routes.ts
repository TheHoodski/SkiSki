// server/src/routes/resort.routes.ts

import { Router } from 'express';
import { pool } from '../utils/database';
import { logger } from '../utils/logger';
import { createHandler } from '../utils/route-handler';

const router = Router();

// Define interfaces for parameters and bodies
interface ResortParams {
    id: string;
}

interface ResortBody {
    name: string;
    location_lat: number;
    location_long: number;
    base_elevation?: number;
    peak_elevation?: number;
    website_url?: string;
    base_cam_url: string;
}

// Get all resorts with current crowding
router.get('/', createHandler(async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   cm.crowd_level as current_crowding,
                   cm.confidence as current_confidence
            FROM resorts r
            LEFT JOIN LATERAL (
                SELECT crowd_level, confidence 
                FROM crowding_metrics 
                WHERE resort_id = r.resort_id 
                ORDER BY timestamp DESC 
                LIMIT 1
            ) cm ON true
            ORDER BY r.name
        `);
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching resorts:', error);
        res.status(500).json({ error: 'Failed to fetch resorts' });
    }
}));

// Get single resort with 24h history
router.get('/:id', createHandler<ResortParams>(async (req, res) => {
    try {
        const resortResult = await pool.query(`
            SELECT r.*, 
                   cm.crowd_level as current_crowding,
                   cm.confidence as current_confidence
            FROM resorts r
            LEFT JOIN LATERAL (
                SELECT crowd_level, confidence
                FROM crowding_metrics
                WHERE resort_id = r.resort_id
                ORDER BY timestamp DESC
                LIMIT 1
            ) cm ON true
            WHERE r.resort_id = $1
        `, [req.params.id]);
        
        if (resortResult.rows.length === 0) {
            res.status(404).json({ error: 'Resort not found' });
            return;
        }

        // Get 24h crowding history
        const historyResult = await pool.query(`
            SELECT timestamp, crowd_level, confidence
            FROM crowding_metrics
            WHERE resort_id = $1
            AND timestamp > NOW() - INTERVAL '24 hours'
            ORDER BY timestamp DESC
        `, [req.params.id]);
        
        const resort = {
            ...resortResult.rows[0],
            crowding_history: historyResult.rows
        };
        
        res.json(resort);
    } catch (error) {
        logger.error('Error fetching resort:', error);
        res.status(500).json({ error: 'Failed to fetch resort' });
    }
}));

// Add new resort
router.post('/', createHandler<{}, any, ResortBody>(async (req, res) => {
    const { 
        name, 
        location_lat, 
        location_long, 
        base_elevation, 
        peak_elevation, 
        website_url,
        base_cam_url 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO resorts (
                name, 
                location_lat, 
                location_long, 
                base_elevation, 
                peak_elevation, 
                website_url,
                base_cam_url, 
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *`,
            [name, location_lat, location_long, base_elevation, peak_elevation, website_url, base_cam_url]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error creating resort:', error);
        res.status(500).json({ error: 'Failed to create resort' });
    }
}));

export default router;