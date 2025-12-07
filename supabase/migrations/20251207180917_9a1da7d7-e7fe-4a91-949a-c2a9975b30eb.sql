-- Add trial-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_used boolean DEFAULT false;

-- Create index for efficient trial expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON public.profiles(trial_end_date) WHERE trial_end_date IS NOT NULL;