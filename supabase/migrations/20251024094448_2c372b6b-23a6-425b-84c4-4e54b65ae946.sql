-- Add credits column to profiles table with default 100
ALTER TABLE public.profiles
ADD COLUMN credits INTEGER DEFAULT 100 NOT NULL;

-- Update existing users to have 100 credits
UPDATE public.profiles
SET credits = 100
WHERE credits IS NULL;