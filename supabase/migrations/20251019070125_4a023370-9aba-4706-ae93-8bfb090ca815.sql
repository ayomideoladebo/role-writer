-- Add new profile fields for better content generation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS content_goals TEXT,
ADD COLUMN IF NOT EXISTS posting_frequency TEXT;