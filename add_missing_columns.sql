-- Add missing columns to video_projects table
ALTER TABLE video_projects 
ADD COLUMN IF NOT EXISTS script_data JSONB,
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS i_urls TEXT[], -- Legacy/Alias check
ADD COLUMN IF NOT EXISTS voice_url TEXT,
ADD COLUMN IF NOT EXISTS captions JSONB;
