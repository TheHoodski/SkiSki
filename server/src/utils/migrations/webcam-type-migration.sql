-- Add webcam_type field to resorts table

-- First, create an enum type for webcam types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'webcam_type') THEN
        CREATE TYPE webcam_type AS ENUM ('direct_stream', 'static_image', 'youtube', 'other');
    END IF;
END$$;

-- Add the webcam_type column to the resorts table if it doesn't exist
ALTER TABLE resorts 
ADD COLUMN IF NOT EXISTS webcam_type webcam_type NOT NULL DEFAULT 'direct_stream';

-- Update existing resorts with their webcam types
UPDATE resorts SET webcam_type = 'direct_stream' WHERE name = 'Park City Mountain Resort';
UPDATE resorts SET webcam_type = 'youtube' WHERE name = 'Brighton Resort';
UPDATE resorts SET webcam_type = 'youtube' WHERE name = 'Deer Valley';
UPDATE resorts SET webcam_type = 'youtube' WHERE name = 'Solitude Mountain Resort';
UPDATE resorts SET webcam_type = 'other' WHERE name = 'Snowbird';
UPDATE resorts SET webcam_type = 'direct_stream' WHERE name = 'Alta Ski Area';

-- Add an additional field for YouTube video IDs
ALTER TABLE resorts
ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(20) NULL;

-- Update YouTube video IDs for resorts using YouTube
UPDATE resorts SET youtube_video_id = 'uE_ent5rC3Y' WHERE name = 'Deer Valley';
-- Add other YouTube IDs as you discover them
-- UPDATE resorts SET youtube_video_id = '...' WHERE name = 'Brighton Resort';
-- UPDATE resorts SET youtube_video_id = '...' WHERE name = 'Solitude Mountain Resort';