// server/src/utils/database.ts
import { Pool } from 'pg';
import { logger } from './logger';

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'skicrowd',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test the connection
pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export async function initDb() {
    try {
        // Test connection
        const client = await pool.connect();
        logger.info('Successfully connected to PostgreSQL');
        client.release();

        // Attempt to drop existing tables if they exist and we need a fresh start
        try {
            // Comment out these lines if you want to preserve existing data
            await pool.query('DROP TABLE IF EXISTS crowding_metrics');
            await pool.query('DROP TABLE IF EXISTS resorts');
            logger.info('Dropped existing tables for clean initialization');
        } catch (dropError) {
            logger.warn('Could not drop tables:', dropError);
        }

        // Initialize resorts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resorts (
                resort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                location_lat DECIMAL(10, 6),
                location_long DECIMAL(10, 6),
                base_elevation INTEGER,
                peak_elevation INTEGER,
                website_url VARCHAR(255),
                base_cam_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Initialize crowding_metrics table with exact column names matching your queries
        await pool.query(`
            CREATE TABLE IF NOT EXISTS crowding_metrics (
                metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                resort_id UUID REFERENCES resorts(resort_id),
                timestamp TIMESTAMP NOT NULL,
                people_count INTEGER NOT NULL,
                crowd_level VARCHAR(20) NOT NULL,
                confidence DECIMAL(5,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Add a sample resort to ensure the app has data to display
        const resortCount = await pool.query('SELECT COUNT(*) FROM resorts');
        if (parseInt(resortCount.rows[0].count) === 0) {
            const resortResult = await pool.query(`
                INSERT INTO resorts (
                    name, 
                    location_lat, 
                    location_long,
                    base_cam_url
                ) VALUES (
                    'Park City Mountain',
                    40.6514,
                    -111.5088,
                    'https://streamer6.brownrice.com/parkcitymtnvillage/parkcitymtnvillage.stream/playlist.m3u8'
                ) RETURNING resort_id
            `);
            
            const resortId = resortResult.rows[0].resort_id;
            
            // Add some sample metrics data
            await pool.query(`
                INSERT INTO crowding_metrics (
                    resort_id,
                    timestamp,
                    people_count,
                    crowd_level,
                    confidence
                ) VALUES (
                    $1,
                    NOW(),
                    25,
                    'medium',
                    0.85
                )
            `, [resortId]);
            
            logger.info('Added sample resort and metrics data');
        }
        
        logger.info('Database tables initialized successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

export { pool };