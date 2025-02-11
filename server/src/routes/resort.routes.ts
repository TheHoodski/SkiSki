import { Router, Request, Response } from 'express';
import { pool } from '../utils/database';
import { logger } from '../utils/logger';

const router = Router();

interface ResortParams {
    id: string;
}

interface Resort {
    name: string;
    location_lat: number;
    location_long: number;
    base_elevation?: number;
    peak_elevation?: number;
    website_url?: string;
}

// Get all resorts
router.get('/', async (_req: Request<{}>, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM resorts ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching resorts:', error);
        res.status(500).json({ error: 'Failed to fetch resorts' });
    }
});

// Get single resort
// @ts-ignore - Express type inference issue
router.get('/:id', async (req: Request<ResortParams>, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM resorts WHERE resort_id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resort not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching resort:', error);
        res.status(500).json({ error: 'Failed to fetch resort' });
    }
});

// Add new resort
router.post('/', async (req: Request<{}, {}, Resort>, res: Response) => {
    const { 
        name, 
        location_lat, 
        location_long, 
        base_elevation, 
        peak_elevation, 
        website_url 
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
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *`,
            [name, location_lat, location_long, base_elevation, peak_elevation, website_url]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error creating resort:', error);
        res.status(500).json({ error: 'Failed to create resort' });
    }
});

export default router;