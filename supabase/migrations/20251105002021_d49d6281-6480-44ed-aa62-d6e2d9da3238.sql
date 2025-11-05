-- Update pricing tiers with enhanced enterprise features and better differentiation
UPDATE pricing_tiers 
SET features = '{
  "AI Model": "Basic AI (Gemini Flash)",
  "Posts per Month": "20",
  "Credits": "100",
  "Platforms": "LinkedIn & Twitter",
  "Templates": "Basic templates",
  "Brand Voice": "Standard tone options",
  "Analytics": "Basic post stats"
}'::jsonb
WHERE tier_name = 'free';

UPDATE pricing_tiers 
SET features = '{
  "AI Model": "Advanced AI (Gemini Pro, GPT-5 Mini)",
  "Posts per Month": "100",
  "Credits": "500",
  "Platforms": "LinkedIn & Twitter",
  "Templates": "Premium templates library",
  "Brand Voice": "Custom brand voice training",
  "Batch Generation": "Up to 5 posts at once",
  "Content Calendar": "Visual scheduling & planning",
  "Analytics": "Engagement metrics & insights",
  "Scheduling": "Schedule posts in advance",
  "Content Ideas": "AI-powered topic suggestions"
}'::jsonb
WHERE tier_name = 'premium';

UPDATE pricing_tiers 
SET features = '{
  "AI Model": "Elite AI (GPT-5 Full Access)",
  "Posts per Month": "1000 (Unlimited for practical use)",
  "Credits": "2000 monthly",
  "Platforms": "LinkedIn & Twitter with priority",
  "Templates": "Unlimited custom templates",
  "Brand Voice": "Advanced AI trained on your content",
  "Batch Generation": "Up to 20 posts simultaneously",
  "Team Collaboration": "Unlimited team members with roles",
  "Content Approval": "Multi-step approval workflows",
  "API Access": "Full REST API with webhooks",
  "Bulk Operations": "CSV import for mass generation",
  "White-Label": "Remove branding, custom domain",
  "Advanced Analytics": "Competitor tracking & predictions",
  "A/B Testing": "Test multiple post variations",
  "Optimal Timing": "AI-suggested best posting times",
  "Priority Support": "24/7 dedicated account manager",
  "Custom Integrations": "Zapier, Slack, CRM connections",
  "Content Library": "Unlimited saved drafts & archive",
  "Performance Reports": "Weekly executive summaries",
  "SLA Guarantee": "99.9% uptime commitment"
}'::jsonb
WHERE tier_name = 'enterprise';