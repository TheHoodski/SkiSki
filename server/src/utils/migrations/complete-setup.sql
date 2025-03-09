-- Create resorts table with all needed columns from the start
CREATE TABLE resorts (
    resort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(9,6),
    location_long DECIMAL(9,6),
    base_elevation INTEGER,
    peak_elevation INTEGER,
    website_url VARCHAR(255),
    base_cam_url VARCHAR(255) NOT NULL,
    webcam_type VARCHAR(20) NOT NULL DEFAULT 'direct_stream',
    youtube_video_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all resorts with their complete data
INSERT INTO resorts (name, base_cam_url, webcam_type, location_lat, location_long, website_url)
VALUES 
('Park City Mountain Resort', 'https://streamer6.brownrice.com/parkcitymtnvillage/parkcitymtnvillage.stream/main_playlist.m3u8', 'direct_stream', 40.6514, -111.5088, 'https://www.parkcitymountain.com'),
('Alta Ski Area', 'https://www.alta.com/resources/images/webcams/collins-base.jpg', 'direct_stream', 40.5884, -111.6386, 'https://www.alta.com'),
('Brighton Resort', 'https://www.brightonresort.com/webcams/base', 'youtube', 40.5977, -111.5842, 'https://www.brightonresort.com'),
('Deer Valley', 'https://www.deervalley.com/web-cams/snow-park', 'youtube', 40.6374, -111.4783, 'https://www.deervalley.com'),
('Solitude Mountain Resort', 'https://www.solitudemountain.com/mountain-and-village/mountain-cams', 'youtube', 40.6199, -111.5913, 'https://www.solitudemountain.com'),
('Snowbird', 'https://www.snowbird.com/webcams/entry-3-mid-gad', 'other', 40.5830, -111.6556, 'https://www.snowbird.com');

-- Set the YouTube video IDs
UPDATE resorts SET youtube_video_id = 'uE_ent5rC3Y' WHERE name = 'Deer Valley';
UPDATE resorts SET youtube_video_id = 'XLzKPufaAts' WHERE name = 'Brighton Resort';
UPDATE resorts SET youtube_video_id = 'VROkNL-a5AQ' WHERE name = 'Solitude Mountain Resort';

-- Create any other needed tables (metrics, etc.)
CREATE TABLE IF NOT EXISTS crowding_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resort_id UUID REFERENCES resorts(resort_id),
    timestamp TIMESTAMP NOT NULL,
    people_count INTEGER NOT NULL,
    crowd_level VARCHAR(20) NOT NULL, 
    confidence DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);