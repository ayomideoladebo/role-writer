-- Add scheduled_for column to posts table for post scheduling
ALTER TABLE public.posts 
ADD COLUMN scheduled_for timestamp with time zone DEFAULT NULL,
ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published'));

-- Create index for efficient querying of scheduled posts
CREATE INDEX idx_posts_scheduled_for ON public.posts (scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_posts_status ON public.posts (status);