-- Add additional Utah ski resorts to the database

-- First, ensure the table exists with all required columns
CREATE TABLE IF NOT EXISTS resorts (
    resort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(9,6),
    location_long DECIMAL(9,6),
    base_elevation INTEGER,
    peak_elevation INTEGER,
    website_url VARCHAR(255),
    base_cam_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert new resorts if they don't already exist
INSERT INTO resorts (name, location_lat, location_long, base_cam_url, website_url)
SELECT 'Alta Ski Area', 40.5884, -111.6386, 'https://www.alta.com/resources/images/webcams/collins-base.jpg', 'https://www.alta.com'
WHERE NOT EXISTS (SELECT 1 FROM resorts WHERE name = 'Alta Ski Area');

INSERT INTO resorts (name, location_lat, location_long, base_cam_url, website_url)
SELECT 'Snowbird', 40.5830, -111.6556, 'https://www.snowbird.com/webcams/entry-3-mid-gad', 'https://www.snowbird.com'
WHERE NOT EXISTS (SELECT 1 FROM resorts WHERE name = 'Snowbird');

INSERT INTO resorts (name, location_lat, location_long, base_cam_url, website_url)
SELECT 'Brighton Resort', 40.5977, -111.5842, 'https://www.brightonresort.com/webcams/base', 'https://www.brightonresort.com'
WHERE NOT EXISTS (SELECT 1 FROM resorts WHERE name = 'Brighton Resort');

INSERT INTO resorts (name, location_lat, location_long, base_cam_url, website_url)
SELECT 'Deer Valley', 40.6374, -111.4783, 'https://www.deervalley.com/web-cams/snow-park', 'https://www.deervalley.com'
WHERE NOT EXISTS (SELECT 1 FROM resorts WHERE name = 'Deer Valley');

INSERT INTO resorts (name, location_lat, location_long, base_cam_url, website_url)
SELECT 'Solitude Mountain Resort', 40.6199, -111.5913, 'https://www.solitudemountain.com/mountain-and-village/mountain-cams', 'https://www.solitudemountain.com'
WHERE NOT EXISTS (SELECT 1 FROM resorts WHERE name = 'Solitude Mountain Resort');

-- Update the Park City Mountain Resort record with additional information if it exists
UPDATE resorts 
SET 
    location_lat = 40.6514,
    location_long = -111.5088,
    website_url = 'https://www.parkcitymountain.com',
    base_elevation = 6900,
    peak_elevation = 10026
WHERE name = 'Park City Mountain Resort';