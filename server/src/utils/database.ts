import { Pool } from 'pg';
import { logger } from './logger';

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'skicrowd',
    password: process.env.POSTGRES_PASSWORD,
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

        // Initialize tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS crowding_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                timestamp TIMESTAMP NOT NULL,
                people_count INTEGER NOT NULL,
                confidence DECIMAL(5,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        logger.info('Database tables initialized');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

export { pool };