-- Update pricing tiers to better differentiate premium vs enterprise
-- Remove Facebook/Instagram, focus on LinkedIn & Twitter

-- Update free tier
UPDATE pricing_tiers 
SET features = jsonb_build_object(
  'features', jsonb_build_array(
    'LinkedIn & Twitter posts',
    'Basic AI (Gemini Flash)',
    '20 posts per month',
    '100 credits included',
    'Basic templates',
    'Standard support'
  )
)
WHERE tier_name = 'free';

-- Update premium tier  
UPDATE pricing_tiers
SET 
  post_limit = 100,
  credits_included = 500,
  features = jsonb_build_object(
    'features', jsonb_build_array(
      'LinkedIn & Twitter posts',
      'Advanced AI (Gemini Pro, GPT-5 Mini)',
      '100 posts per month',
      '500 credits included',
      'Custom brand voice',
      'Batch generation (up to 5)',
      'Premium templates',
      'Content calendar',
      'Basic analytics',
      'Priority support'
    )
  )
WHERE tier_name = 'premium';

-- Update enterprise tier with exclusive features
UPDATE pricing_tiers
SET 
  post_limit = 1000,
  credits_included = 2000,
  features = jsonb_build_object(
    'features', jsonb_build_array(
      'LinkedIn & Twitter posts',
      'Elite AI (GPT-5, Gemini Pro)',
      '1000 posts per month',
      '2000 credits included',
      'Custom brand voice',
      'Batch generation (up to 10)',
      'Unlimited templates',
      'Content calendar',
      'Advanced analytics & insights',
      'Team collaboration',
      'API access',
      'Bulk operations',
      'White-label options',
      'Dedicated account manager',
      '24/7 priority support'
    )
  )
WHERE tier_name = 'enterprise';