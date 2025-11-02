-- Add subscription tier and premium features to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS monthly_post_limit integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS brand_voice text,
ADD COLUMN IF NOT EXISTS content_templates jsonb DEFAULT '[]'::jsonb;

-- Create a table for tracking feature usage
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  usage_count integer DEFAULT 1,
  last_used_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_usage
CREATE POLICY "Users can view own feature usage"
ON public.feature_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage"
ON public.feature_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature usage"
ON public.feature_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Create pricing tiers table
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text UNIQUE NOT NULL,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  credits_included integer NOT NULL,
  post_limit integer NOT NULL,
  features jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can view pricing tiers
CREATE POLICY "Anyone can view pricing tiers"
ON public.pricing_tiers FOR SELECT
USING (true);

-- Only admins can modify pricing tiers
CREATE POLICY "Admins can insert pricing tiers"
ON public.pricing_tiers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pricing tiers"
ON public.pricing_tiers FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (tier_name, price_monthly, price_yearly, credits_included, post_limit, features)
VALUES 
  ('free', 0, 0, 100, 20, 
   '{"features": ["20 posts/month", "Basic AI models", "LinkedIn & Twitter", "Basic templates", "Standard support"]}'::jsonb),
  ('premium', 29, 290, 500, 200, 
   '{"features": ["200 posts/month", "Advanced AI models", "All platforms", "Premium templates", "Brand voice customization", "Content calendar", "Advanced analytics", "Batch generation (10x)", "Image generation", "Priority support", "Export to CSV/JSON"]}'::jsonb),
  ('enterprise', 99, 990, 2000, 1000, 
   '{"features": ["1000 posts/month", "Custom AI models", "All platforms", "Unlimited templates", "Custom brand voice", "Team collaboration", "Advanced analytics & insights", "API access", "Bulk operations", "White-label options", "Dedicated account manager", "24/7 priority support"]}'::jsonb)
ON CONFLICT (tier_name) DO NOTHING;