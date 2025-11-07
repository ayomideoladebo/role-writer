# LinkTweet - Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
LinkTweet is a SaaS platform that leverages AI to help professionals and businesses create, manage, and optimize their LinkedIn content. The platform uses AI-powered content generation, personalized brand voice, and analytics to streamline the content creation process for LinkedIn professionals.

### 1.2 Product Vision
To become the leading AI-powered LinkedIn content creation platform that empowers professionals to build their personal brand and drive meaningful engagement through data-driven, personalized content.

### 1.3 Target Audience
- **Primary**: LinkedIn professionals, content creators, marketers, and thought leaders
- **Secondary**: Small business owners, coaches, consultants, and entrepreneurs
- **Tertiary**: Marketing agencies and enterprise teams

### 1.4 Core Value Proposition
- **AI-Powered Content Generation**: Generate high-quality LinkedIn posts tailored to user's industry, role, and tone preferences
- **Brand Voice Consistency**: Maintain consistent brand voice across all content
- **Time Savings**: Reduce content creation time from hours to minutes
- **Data-Driven Insights**: Analytics to optimize content performance
- **Multi-Post Planning**: Content calendar and batch creation capabilities

---

## 2. Product Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6.30.1
- **State Management**: React Query (TanStack Query v5.83.0)
- **Notifications**: Sonner (toast notifications)

#### Backend (Lovable Cloud/Supabase)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (avatars bucket)
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime (optional for future features)

#### AI Integration
- **Provider**: Lovable AI Gateway
- **Models**: 
  - `google/gemini-2.5-flash` (default)
  - `google/gemini-2.5-pro` (premium features)
  - `google/gemini-2.5-flash-lite` (basic tasks)
  - `google/gemini-2.5-flash-image` (image generation)

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │Dashboard │  │ Generate │  │Analytics │   │
│  │  Pages   │  │  Layout  │  │   Post   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Calendar │  │  Brand   │  │ Past     │  │ Settings │   │
│  │          │  │  Voice   │  │ Posts    │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend (Lovable Cloud)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Edge Functions (Deno)                  │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • generate-posts    (AI post generation)          │     │
│  │  • generate-ideas    (AI content suggestions)      │     │
│  │  • generate-post-image (AI image generation)       │     │
│  └────────────────────────────────────────────────────┘     │
│                            ↕                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │              PostgreSQL Database                    │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  Tables:                                            │     │
│  │  • profiles (user data & preferences)              │     │
│  │  • posts (generated content)                       │     │
│  │  • pricing_tiers (subscription plans)              │     │
│  │  • user_roles (admin/user roles)                   │     │
│  │  • feature_usage (analytics tracking)              │     │
│  └────────────────────────────────────────────────────┘     │
│                            ↕                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Storage Buckets                           │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • avatars (user profile pictures)                 │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Lovable AI Gateway                         │
├─────────────────────────────────────────────────────────────┤
│  • Google Gemini Models                                      │
│  • Image Generation (Nano Banana)                            │
│  • Streaming Support                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Tables Overview

#### 3.1.1 `profiles` Table
**Purpose**: Store user profile information, preferences, and subscription data

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT,
  industry TEXT,
  tone_preference TEXT,
  interests TEXT,
  target_audience TEXT,
  content_goals TEXT,
  posting_frequency TEXT,
  avatar_url TEXT,
  brand_voice TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  monthly_post_limit INTEGER DEFAULT 20,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  content_templates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can view/update their own profile
- Admins can view/update any profile
- Users can insert their own profile on signup

**Key Fields**:
- `credits`: Available AI generation credits
- `subscription_tier`: free/pro/business/enterprise
- `brand_voice`: Custom brand voice description
- `monthly_post_limit`: Posts per month based on tier
- `content_templates`: Saved custom templates (JSONB)

#### 3.1.2 `posts` Table
**Purpose**: Store all generated posts and their metadata

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can only access their own posts (CRUD)
- No cross-user data access

**Key Fields**:
- `platform`: Target platform (currently "LinkedIn")
- `content`: Generated post text (markdown supported)
- `image_url`: Optional AI-generated or uploaded image
- `is_saved`: User bookmark flag

#### 3.1.3 `pricing_tiers` Table
**Purpose**: Define subscription tiers and features

```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  credits_included INTEGER NOT NULL,
  post_limit INTEGER NOT NULL,
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Public read access (anyone can view pricing)
- Admin-only write access

**Key Fields**:
- `features`: JSON array of feature names/descriptions
- `credits_included`: Monthly AI credits
- `post_limit`: Monthly post generation limit

**Default Tiers**:
1. **Free**: $0/month, 100 credits, 20 posts
2. **Pro**: $29/month, 500 credits, 100 posts
3. **Business**: $79/month, 2000 credits, unlimited posts
4. **Enterprise**: Custom pricing, unlimited

#### 3.1.4 `user_roles` Table
**Purpose**: Manage admin and special user roles

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Custom Type**: `app_role` ENUM ('admin', 'user')

**RLS Policies**:
- Users can view their own roles
- Admins can manage all roles

#### 3.1.5 `feature_usage` Table
**Purpose**: Track feature usage for analytics and limits

```sql
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can view/update their own usage
- Used for tracking monthly limits

**Tracked Features**:
- `post_generation`
- `image_generation`
- `idea_generation`
- `analytics_view`

### 3.2 Database Functions

#### 3.2.1 `has_role(_user_id uuid, _role app_role)`
**Purpose**: Check if user has specific role (used in RLS policies)

```sql
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;
```

#### 3.2.2 `handle_new_user()`
**Purpose**: Auto-create profile on user signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;
```

**Trigger**: Executes on `auth.users` INSERT

#### 3.2.3 `handle_updated_at()`
**Purpose**: Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
```

**Trigger**: Applied to tables with `updated_at` column

---

## 4. Authentication & Authorization

### 4.1 Authentication Flow

```
User Registration Flow:
1. User visits /auth
2. Enters email/password in signup form
3. Supabase Auth creates user in auth.users
4. Trigger executes: handle_new_user() creates profile
5. Redirect to /onboarding
6. User completes onboarding form:
   - Role (e.g., "Marketing Manager")
   - Industry (e.g., "Technology")
   - Tone Preference (e.g., "Professional")
   - Interests, Target Audience, Content Goals
7. Profile.onboarding_completed = true
8. Redirect to /dashboard/inspiration
```

### 4.2 Authorization Levels

#### Public Routes
- `/` - Landing page
- `/auth` - Login/Signup
- `/pricing` - Pricing tiers (public)
- `*` - 404 page

#### Authenticated Routes
- `/onboarding` - First-time setup (pre-dashboard)
- `/dashboard/*` - Main application (requires completed onboarding)

#### Admin Routes
- `/admin` - Admin dashboard (requires admin role)

### 4.3 Row Level Security (RLS)

**Key Principles**:
1. Users can only access their own data
2. Admins have full access to all data
3. Pricing tiers are publicly readable
4. All tables have RLS enabled

**Example RLS Policy** (profiles table):
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

---

## 5. Core Features

### 5.1 Onboarding System

**File**: `src/pages/Onboarding.tsx`

**Purpose**: Collect user preferences for personalized AI content generation

**Flow**:
1. **Step 1: Basic Information**
   - Role (e.g., "Founder", "Marketing Manager")
   - Industry (e.g., "Technology", "Healthcare")
   - Tone Preference (e.g., "Professional", "Casual", "Inspirational")

2. **Step 2: Content Preferences**
   - Interests (comma-separated topics)
   - Target Audience description
   - Content Goals (e.g., "Build thought leadership")
   - Posting Frequency (e.g., "3-4 times per week")

3. **Completion**
   - Updates `profiles.onboarding_completed = true`
   - Redirects to `/dashboard/inspiration`

**Implementation**:
```typescript
const handleSubmit = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from("profiles")
    .update({
      role: formData.role,
      industry: formData.industry,
      tone_preference: formData.tonePreference,
      interests: formData.interests,
      target_audience: formData.targetAudience,
      content_goals: formData.contentGoals,
      posting_frequency: formData.postingFrequency,
      onboarding_completed: true,
    })
    .eq("id", user.id);
};
```

### 5.2 Content Generation

#### 5.2.1 Generate Post Page

**File**: `src/pages/GeneratePost.tsx`

**Purpose**: AI-powered LinkedIn post generation with customization options

**Features**:
- **Topic/Prompt Input**: User describes desired post topic
- **Tone Selection**: Professional, Casual, Inspirational, Educational
- **Word Count**: Short (100-150), Medium (150-250), Long (250-400)
- **Credits System**: Deducts 5 credits per generation
- **Batch Generation**: Creates 3-5 post variations
- **Real-time Preview**: Markdown rendering with formatting
- **Save to Library**: Option to save posts for later

**Edge Function**: `supabase/functions/generate-posts/index.ts`

**API Flow**:
```typescript
// Frontend Request
const { data, error } = await supabase.functions.invoke("generate-posts", {
  body: {
    topic: "AI in healthcare",
    tone: "professional",
    wordCount: "medium",
    userProfile: {
      role: "Healthcare Tech Consultant",
      industry: "Healthcare",
      interests: "AI, Digital Health",
      targetAudience: "Healthcare executives"
    }
  }
});

// Backend Processing (Edge Function)
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'system',
        content: `You are an expert LinkedIn content creator...`
      },
      {
        role: 'user',
        content: `Create ${count} LinkedIn posts about: ${topic}
                  Tone: ${tone}
                  Word Count: ${wordCount}
                  User Context: ${JSON.stringify(userProfile)}`
      }
    ],
  }),
});
```

**Post Format**:
```javascript
{
  platform: "LinkedIn",
  content: "# Post Title\n\nPost body with **formatting**...",
  image_url: null,
  is_saved: false,
  user_id: userId
}
```

#### 5.2.2 AI Image Generation

**File**: `src/components/ImagePromptDialog.tsx`

**Purpose**: Generate custom images for posts using AI

**Edge Function**: `supabase/functions/generate-post-image/index.ts`

**Flow**:
1. User clicks "Add Image" on post card
2. Dialog opens with prompt input
3. User describes desired image (e.g., "Modern tech office")
4. Edge function calls Lovable AI with `google/gemini-2.5-flash-image` model
5. Base64 image returned and stored in Supabase Storage
6. Post updated with `image_url`

**Implementation**:
```typescript
// Edge Function (generate-post-image)
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash-image',
    messages: [{
      role: 'user',
      content: `${customPrompt}\nContext: ${userInterests}`
    }],
    modalities: ['image', 'text']
  }),
});

const imageUrl = data.choices[0].message.images[0].image_url.url;
// Store in Supabase Storage and return public URL
```

**Credits Cost**: 10 credits per image generation

### 5.3 Inspiration & Ideas

**File**: `src/pages/Inspiration.tsx`

**Purpose**: Generate content ideas and suggestions based on user profile

**Features**:
- **Topic Suggestions**: AI-generated relevant topics
- **Trending Topics**: Industry-specific trends (premium feature)
- **Content Pillars**: Strategic topic categories
- **Quick Generate**: One-click generation from idea

**Edge Function**: `supabase/functions/generate-ideas/index.ts`

**Credits Cost**: 3 credits per idea generation

### 5.4 Past Posts Library

**File**: `src/pages/PastPosts.tsx`

**Purpose**: Manage all generated posts

**Features**:
- **List View**: All generated posts with preview
- **Search**: Filter by content keywords
- **Edit**: Modify post content inline
- **Delete**: Remove posts from library
- **Add Images**: Attach AI-generated images to posts
- **Copy**: Copy to clipboard for posting
- **Saved Filter**: View only bookmarked posts

**Implementation**:
```typescript
const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
};
```

### 5.5 Content Calendar

**File**: `src/pages/ContentCalendar.tsx`

**Purpose**: Schedule and plan content posting

**Features** (Tier-Dependent):
- **Free**: Basic calendar view (current month)
- **Pro**: 3-month view, drag-and-drop scheduling
- **Business**: 12-month view, team collaboration
- **Enterprise**: Unlimited, approval workflows

**Implementation Status**: Basic UI implemented, full scheduling logic pending

### 5.6 Brand Voice Settings

**File**: `src/pages/BrandVoice.tsx`

**Purpose**: Define and maintain consistent brand voice

**Features**:
- **Voice Description**: Free-text brand voice definition
- **Example Posts**: Upload sample posts for AI training
- **Tone Analysis**: AI analyzes and summarizes brand voice (premium)
- **Voice Presets**: Save multiple brand voices (business+)

**Storage**: `profiles.brand_voice` (TEXT field)

### 5.7 Analytics

#### 5.7.1 Basic Insights (Free)

**File**: `src/pages/ContentInsights.tsx`

**Features**:
- Total posts generated
- Credits remaining
- Current subscription tier
- Basic usage stats

#### 5.7.2 Advanced Analytics (Premium)

**File**: `src/pages/Analytics.tsx`

**Features**:
- **Posts Today**: Daily generation count
- **Average Posts Per Week**: 7-day rolling average
- **Best Posting Day**: Recommended day based on generation patterns
- **Engagement Score**: Estimated engagement (0-100)
- **Post Quality Metrics**: AI-analyzed content quality
- **Trend Analysis**: Topic and keyword trends (business+)
- **Predictive Analytics**: ML-based suggestions (enterprise)

**Data Source**: `feature_usage` table + AI analysis

**Premium Gating**:
```typescript
if (profile?.subscription_tier === 'free') {
  return <PremiumBanner 
    feature="Advanced Analytics" 
    requiredTier="Pro" 
  />;
}
```

### 5.8 Profile Settings

**File**: `src/pages/ProfileSettings.tsx`

**Purpose**: Manage user profile and preferences

**Sections**:
1. **Profile Information**
   - Avatar upload (Supabase Storage)
   - Email (read-only)
   - Role, Industry

2. **Content Preferences**
   - Tone preference
   - Interests
   - Target audience
   - Content goals
   - Posting frequency

3. **Account Settings**
   - Subscription tier (read-only)
   - Credits balance (read-only)
   - Monthly post limit (read-only)

**Implementation**:
```typescript
const handleUpdateProfile = async () => {
  const { error } = await supabase
    .from("profiles")
    .update({
      role: formData.role,
      industry: formData.industry,
      tone_preference: formData.tonePreference,
      interests: formData.interests,
      target_audience: formData.targetAudience,
      content_goals: formData.contentGoals,
      posting_frequency: formData.postingFrequency,
    })
    .eq("id", user.id);
};
```

---

## 6. Monetization & Subscription Tiers

### 6.1 Tier Comparison

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| **Price** | $0/month | $29/month ($290/year) | $79/month ($790/year) | Custom |
| **Credits** | 100/month | 500/month | 2,000/month | Unlimited |
| **Posts** | 20/month | 100/month | Unlimited | Unlimited |
| **Image Generation** | 10/month | 50/month | 200/month | Unlimited |
| **Basic Insights** | ✅ | ✅ | ✅ | ✅ |
| **Advanced Analytics** | ❌ | ✅ | ✅ | ✅ |
| **Content Calendar** | Basic | 3 months | 12 months | Unlimited |
| **Brand Voice** | 1 voice | 3 voices | 10 voices | Unlimited |
| **Priority Support** | ❌ | ✅ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ | ✅ |
| **Team Collaboration** | ❌ | ❌ | ✅ | ✅ |
| **Custom AI Training** | ❌ | ❌ | ❌ | ✅ |
| **Dedicated Account Manager** | ❌ | ❌ | ❌ | ✅ |

### 6.2 Feature Gating Implementation

**Component**: `src/components/PremiumBanner.tsx`

```typescript
<PremiumBanner 
  feature="Advanced Analytics" 
  requiredTier="Pro"
  description="Unlock detailed engagement metrics and predictions"
/>
```

**Logic Pattern**:
```typescript
const hasAccess = (requiredTier: string, userTier: string) => {
  const tierHierarchy = ['free', 'pro', 'business', 'enterprise'];
  return tierHierarchy.indexOf(userTier) >= 
         tierHierarchy.indexOf(requiredTier);
};
```

### 6.3 Credits System

**Credit Costs**:
- Generate Post: 5 credits (per batch of 3-5 posts)
- Generate Ideas: 3 credits (per batch)
- Generate Image: 10 credits (per image)
- AI Analysis: 2 credits (per analysis)

**Refill Logic**:
- Monthly on subscription anniversary
- Can purchase additional credit packs (future feature)
- Enterprise gets unlimited (tracked but not limited)

**Implementation**:
```typescript
const deductCredits = async (amount: number) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profile.credits < amount) {
    throw new Error("Insufficient credits");
  }

  await supabase
    .from("profiles")
    .update({ credits: profile.credits - amount })
    .eq("id", user.id);
};
```

### 6.4 Usage Tracking

**Table**: `feature_usage`

**Purpose**: Track monthly limits and analytics

```typescript
const trackUsage = async (feature: string) => {
  await supabase
    .from("feature_usage")
    .insert({
      user_id: user.id,
      feature_name: feature,
      usage_count: 1,
      last_used_at: new Date().toISOString()
    });
};
```

---

## 7. User Flows

### 7.1 New User Journey

```
1. Landing Page (/) 
   ↓ Click "Get Started"
   
2. Auth Page (/auth)
   - Sign up with email/password
   - Auto-create profile via trigger
   ↓
   
3. Onboarding (/onboarding)
   - Step 1: Role, Industry, Tone
   - Step 2: Interests, Audience, Goals
   ↓ Complete onboarding
   
4. Dashboard - Inspiration (/dashboard/inspiration)
   - See suggested topics
   - Generate first ideas
   ↓ Generate Ideas (costs 3 credits)
   
5. Generate Post (/dashboard/generate)
   - Enter topic/prompt
   - Customize tone & length
   - Generate posts (costs 5 credits)
   ↓ Save posts
   
6. Past Posts (/dashboard/posts)
   - View generated posts
   - Add images (costs 10 credits)
   - Edit & copy posts
   ↓ Optional
   
7. Premium Features
   - Hit free tier limits
   - See premium banners
   ↓ Upgrade via /pricing
   
8. Profile Settings (/dashboard/settings)
   - Update preferences
   - Upload avatar
   - View subscription
```

### 7.2 Content Creation Flow

```
Inspiration Page
  ↓ Browse Ideas
  ↓ Click "Generate Ideas"
  ↓ Review AI-generated topics
  ↓ Click "Generate Post" on topic
  
Generate Post Page
  ↓ Topic auto-filled (or enter custom)
  ↓ Select Tone (Professional/Casual/etc.)
  ↓ Select Length (Short/Medium/Long)
  ↓ Click "Generate Posts"
  ↓ AI creates 3-5 variations
  ↓ Review posts (markdown preview)
  ↓ Click "Save" on preferred posts
  
Past Posts Library
  ↓ View saved posts
  ↓ Click "Add Image" (optional)
  ↓ Enter image prompt in dialog
  ↓ AI generates custom image
  ↓ Image attached to post
  ↓ Click "Copy" to copy to clipboard
  ↓ Post on LinkedIn manually
  
[Future: Direct LinkedIn posting via API]
```

### 7.3 Subscription Upgrade Flow

```
User hits limit (credits or posts)
  ↓ Banner appears in UI
  ↓ Click "Upgrade" button
  
Pricing Page (/pricing)
  ↓ Compare tiers
  ↓ Select plan (Pro/Business/Enterprise)
  ↓ Click "Get Started"
  
[Future: Stripe Payment Integration]
  ↓ Enter payment details
  ↓ Confirm subscription
  
Backend Updates
  ↓ Update profiles.subscription_tier
  ↓ Add credits (500 for Pro)
  ↓ Set subscription dates
  ↓ Update monthly_post_limit
  
Dashboard
  ↓ Premium features unlocked
  ↓ Advanced analytics visible
  ↓ Higher limits active
```

---

## 8. Edge Functions

### 8.1 generate-posts

**File**: `supabase/functions/generate-posts/index.ts`

**Purpose**: Generate LinkedIn posts using AI

**Request Body**:
```typescript
{
  topic: string;
  tone: "professional" | "casual" | "inspirational" | "educational";
  wordCount: "short" | "medium" | "long";
  userProfile: {
    role: string;
    industry: string;
    interests: string;
    targetAudience: string;
  }
}
```

**Response**:
```typescript
{
  posts: Array<{
    platform: "LinkedIn";
    content: string; // Markdown formatted
    image_url: null;
  }>
}
```

**AI Prompt Structure**:
```
System: You are an expert LinkedIn content creator specializing in ${industry}.
        Create engaging posts for ${role} targeting ${targetAudience}.
        
User: Create ${count} LinkedIn posts about: ${topic}
      Tone: ${tone}
      Word Count: ${wordCount}
      Include hooks, clear structure, and calls-to-action.
      Format with markdown (headers, bold, lists).
```

**Error Handling**:
- Insufficient credits → 402 Payment Required
- Rate limit → 429 Too Many Requests
- Invalid prompt → 400 Bad Request

### 8.2 generate-ideas

**File**: `supabase/functions/generate-ideas/index.ts`

**Purpose**: Generate content topic suggestions

**Request Body**:
```typescript
{
  userProfile: {
    role: string;
    industry: string;
    interests: string;
    contentGoals: string;
  }
}
```

**Response**:
```typescript
{
  ideas: string[]; // Array of 5-7 topic suggestions
}
```

**AI Prompt Structure**:
```
System: You are a LinkedIn content strategist.

User: Generate 5-7 content topic ideas for:
      Role: ${role}
      Industry: ${industry}
      Interests: ${interests}
      Goals: ${contentGoals}
      
      Make topics specific, timely, and relevant.
```

### 8.3 generate-post-image

**File**: `supabase/functions/generate-post-image/index.ts`

**Purpose**: Generate custom images for posts using AI

**Request Body**:
```typescript
{
  postId: string;
  customPrompt: string;
  userInterests: string;
}
```

**Response**:
```typescript
{
  imageUrl: string; // Public Supabase Storage URL
}
```

**Process**:
1. Call Lovable AI with `google/gemini-2.5-flash-image` model
2. Receive base64-encoded image
3. Upload to Supabase Storage (`avatars` bucket)
4. Update `posts` table with public URL
5. Return URL to client

**AI Prompt**:
```
Generate a professional LinkedIn post image:
${customPrompt}

Context: ${userInterests}
Style: Modern, clean, professional
Aspect Ratio: 16:9 (optimal for LinkedIn)
```

---

## 9. UI/UX Design System

### 9.1 Design Tokens

**File**: `src/index.css`

**Color System** (HSL):
```css
:root {
  /* Primary Brand Colors */
  --primary: 220 90% 56%;        /* Blue primary */
  --primary-foreground: 0 0% 100%; /* White text on primary */
  
  /* Background Colors */
  --background: 222 47% 11%;      /* Dark background #0a0c1a */
  --foreground: 210 40% 98%;      /* Light text */
  
  /* Card & Surfaces */
  --card: 222 47% 15%;            /* Slightly lighter than bg */
  --card-foreground: 210 40% 98%;
  
  /* Accent Colors */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Muted Colors */
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  
  /* Border & Dividers */
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 220 90% 56%;
  
  /* Status Colors */
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
}
```

### 9.2 Typography

**Font Family**: System fonts (SF Pro, Inter, Roboto fallbacks)

**Type Scale**:
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)

**Font Weights**:
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 9.3 Spacing System

**Tailwind Scale** (used throughout):
- `p-1`: 0.25rem (4px)
- `p-2`: 0.5rem (8px)
- `p-3`: 0.75rem (12px)
- `p-4`: 1rem (16px)
- `p-6`: 1.5rem (24px)
- `p-8`: 2rem (32px)

**Component Spacing**:
- Cards: `p-6` (24px padding)
- Page margins: `px-6 py-8`
- Button padding: `px-4 py-2`
- Gap between elements: `gap-4` (16px)

### 9.4 Component Variants

#### Button Variants (shadcn)
```typescript
const buttonVariants = cva("base-styles", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input hover:bg-accent",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    }
  }
});
```

### 9.5 Responsive Design

**Breakpoints**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Mobile-First Approach**:
```tsx
// Mobile: Stack vertically
<div className="flex flex-col gap-4">
  
// Desktop: Side-by-side with sidebar
<div className="lg:flex lg:gap-6">
  <Sidebar className="hidden lg:block" />
  <Main className="flex-1" />
</div>
```

**Sidebar Behavior**:
- Mobile: Collapsible drawer (triggered by hamburger)
- Desktop: Always visible, fixed width

---

## 10. Implementation Steps (Build Guide)

### Phase 1: Foundation (Week 1-2)

#### Step 1: Project Setup
```bash
# 1. Create Lovable project
# 2. Enable Lovable Cloud
# 3. Install dependencies (auto-done by Lovable)
```

#### Step 2: Database Schema
```sql
-- Create all tables via Supabase migration tool
-- 1. profiles table
-- 2. posts table
-- 3. pricing_tiers table
-- 4. user_roles table
-- 5. feature_usage table
-- 6. Create functions: has_role, handle_new_user, handle_updated_at
-- 7. Set up RLS policies on all tables
-- 8. Create storage bucket: avatars (public)
```

#### Step 3: Authentication Setup
```typescript
// 1. Configure Supabase Auth
//    - Enable email/password
//    - Auto-confirm emails (dev mode)
//    - Create auth trigger for profile creation

// 2. Create Auth page (src/pages/Auth.tsx)
//    - Login form
//    - Signup form
//    - Password reset

// 3. Create protected route logic
//    - Check auth.getUser()
//    - Redirect to /auth if not authenticated
```

#### Step 4: Onboarding Flow
```typescript
// 1. Create Onboarding page (src/pages/Onboarding.tsx)
//    - Multi-step form
//    - Profile data collection
//    - Update profiles.onboarding_completed

// 2. Add onboarding check in Dashboard
//    - Redirect to /onboarding if not completed
```

### Phase 2: Core Features (Week 3-5)

#### Step 5: Dashboard Layout
```typescript
// 1. Create Dashboard page (src/pages/Dashboard.tsx)
//    - AppSidebar integration (shadcn sidebar)
//    - Header with user info & credits
//    - Outlet for nested routes

// 2. Create AppSidebar (src/components/AppSidebar.tsx)
//    - Navigation menu
//    - User profile section
//    - Credits display

// 3. Set up routing (src/App.tsx)
//    - Nested dashboard routes
//    - 404 handling
```

#### Step 6: AI Integration (Lovable AI)
```typescript
// 1. Enable Lovable AI in project
//    - LOVABLE_API_KEY auto-provided

// 2. Create generate-posts edge function
//    - Accept topic, tone, wordCount
//    - Call Lovable AI Gateway
//    - Return generated posts

// 3. Create generate-ideas edge function
//    - Accept user profile
//    - Generate topic suggestions

// 4. Create generate-post-image edge function
//    - Accept image prompt
//    - Use google/gemini-2.5-flash-image
//    - Upload to Supabase Storage
```

#### Step 7: Content Generation Pages
```typescript
// 1. Inspiration Page (src/pages/Inspiration.tsx)
//    - "Generate Ideas" button
//    - Display idea cards
//    - Quick generate from idea

// 2. Generate Post Page (src/pages/GeneratePost.tsx)
//    - Topic input
//    - Tone selector (radio group)
//    - Word count selector
//    - Generate button (with credit check)
//    - Post preview cards (markdown rendering)
//    - Save to library action

// 3. Past Posts Page (src/pages/PastPosts.tsx)
//    - Fetch posts from database
//    - PostCard component for each post
//    - Edit, delete, copy actions
//    - Add image functionality
```

#### Step 8: Post Management Components
```typescript
// 1. PostCard (src/components/PostCard.tsx)
//    - Display post content (markdown)
//    - Image preview (if exists)
//    - Action buttons (edit, delete, copy, add image)

// 2. ImagePromptDialog (src/components/ImagePromptDialog.tsx)
//    - Prompt input
//    - Generate button
//    - Loading state
//    - Preview generated image
```

### Phase 3: Premium Features (Week 6-7)

#### Step 9: Subscription System
```typescript
// 1. Create Pricing page (src/pages/Pricing.tsx)
//    - Fetch pricing_tiers from DB
//    - Display tier cards
//    - "Get Started" buttons
//    - Feature comparison table

// 2. Seed pricing tiers in database
INSERT INTO pricing_tiers (tier_name, price_monthly, price_yearly, ...) 
VALUES ('free', 0, 0, 100, 20, ...);

// 3. Create PremiumBanner (src/components/PremiumBanner.tsx)
//    - Show on gated features
//    - Display required tier
//    - "Upgrade" CTA button
```

#### Step 10: Analytics & Insights
```typescript
// 1. Basic Insights (src/pages/ContentInsights.tsx)
//    - Total posts
//    - Credits remaining
//    - Current tier

// 2. Advanced Analytics (src/pages/Analytics.tsx)
//    - Check subscription tier (gate for free users)
//    - Posts today counter
//    - Engagement score (AI-calculated)
//    - Best posting day recommendation
//    - Average posts per week
//    - Premium charts (recharts library)

// 3. Track usage in feature_usage table
//    - Log every generation
//    - Calculate analytics from logs
```

#### Step 11: Content Calendar
```typescript
// 1. Create ContentCalendar page (src/pages/ContentCalendar.tsx)
//    - Calendar component (react-day-picker)
//    - Tier-based restrictions
//    - Drag-and-drop (future)
//    - Schedule posts (future)
```

#### Step 12: Brand Voice
```typescript
// 1. Create BrandVoice page (src/pages/BrandVoice.tsx)
//    - Brand voice description textarea
//    - Save to profiles.brand_voice
//    - Example posts upload (future)
//    - AI voice analysis (premium feature)
```

### Phase 4: User Management (Week 8)

#### Step 13: Profile Settings
```typescript
// 1. Create ProfileSettings page (src/pages/ProfileSettings.tsx)
//    - Avatar upload (Supabase Storage)
//    - Profile form (role, industry, etc.)
//    - Update profile action
//    - Display subscription info

// 2. Implement avatar upload
//    - File input
//    - Upload to 'avatars' bucket
//    - Update profiles.avatar_url
//    - Display avatar in header/sidebar
```

#### Step 14: Admin Dashboard
```typescript
// 1. Create AdminDashboard page (src/pages/AdminDashboard.tsx)
//    - Check user_roles for 'admin' role
//    - Display user list (all profiles)
//    - User stats (total users, active subscriptions)
//    - Manage pricing tiers (CRUD)
//    - Feature usage analytics

// 2. Protect route
//    - Redirect non-admins to dashboard
```

### Phase 5: Polish & Optimization (Week 9-10)

#### Step 15: Error Handling
```typescript
// 1. Global error boundaries
// 2. Toast notifications (sonner)
// 3. Loading states (skeleton components)
// 4. Network error handling
// 5. Credit/limit error messages
```

#### Step 16: Performance Optimization
```typescript
// 1. React Query caching
//    - Cache posts, profile data
//    - Invalidate on mutations

// 2. Lazy loading
//    - Code-split routes
//    - Lazy load images

// 3. Debounce search inputs
// 4. Optimize Supabase queries (select only needed fields)
```

#### Step 17: SEO & Metadata
```html
<!-- 1. Update index.html -->
<title>LinkTweet - AI-Powered LinkedIn Content Creator</title>
<meta name="description" content="...">

<!-- 2. Add robots.txt (public/robots.txt) -->
<!-- 3. Add favicon -->
```

#### Step 18: Testing & QA
```typescript
// 1. Test all user flows
//    - Registration → Onboarding → Generation
//    - Upgrade flow
//    - Admin features

// 2. Test edge cases
//    - Insufficient credits
//    - Expired subscription
//    - Network failures

// 3. Test on devices
//    - Mobile responsive
//    - Tablet layout
//    - Desktop experience
```

### Phase 6: Deployment (Week 11)

#### Step 19: Production Preparation
```typescript
// 1. Environment variables (auto-configured by Lovable)
// 2. Supabase production settings
//    - RLS policies verified
//    - Auth settings (disable auto-confirm in prod)
//    - Rate limits configured

// 3. Seed production data
//    - Pricing tiers
//    - Admin user role
```

#### Step 20: Launch
```bash
# 1. Deploy via Lovable (click "Publish")
# 2. Test production app
# 3. Monitor Supabase logs
# 4. Set up analytics (future: Google Analytics)
```

---

## 11. Future Enhancements

### 11.1 Q1 Roadmap

#### Payment Integration (Stripe)
- Implement Stripe Checkout
- Subscription management
- Credit top-ups
- Invoice generation

#### Direct LinkedIn Posting
- LinkedIn API integration
- OAuth authentication
- Schedule posts via API
- Auto-post from calendar

#### Advanced AI Features
- Custom AI model fine-tuning (enterprise)
- Multi-language support
- Video script generation
- Carousel post creator

### 11.2 Q2 Roadmap

#### Team Collaboration
- Workspace invites
- Role-based permissions
- Shared content library
- Approval workflows (enterprise)

#### Enhanced Analytics
- LinkedIn native analytics integration
- A/B testing for post variations
- Competitor analysis
- Content performance predictions

#### Mobile App
- React Native mobile app
- Push notifications
- Offline mode
- Mobile-first generation

### 11.3 Q3 Roadmap

#### Content Marketplace
- Buy/sell post templates
- Creator revenue sharing
- Premium templates by niche

#### Integrations
- Twitter/X posting
- Instagram (carousel/captions)
- Medium cross-posting
- CRM integrations (HubSpot, Salesforce)

#### AI Enhancements
- Voice-to-post (speech input)
- Image-to-post (generate posts from images)
- Video-to-post (summarize videos into posts)

---

## 12. Technical Debt & Known Issues

### 12.1 Current Limitations

1. **No Payment System**: Subscription upgrades are manual (admin must update DB)
2. **No LinkedIn Integration**: Users must copy/paste posts manually
3. **Basic Calendar**: No drag-and-drop scheduling yet
4. **Limited Analytics**: Relies on generation data, not actual LinkedIn metrics
5. **Single Brand Voice**: Users can only have one brand voice (need multi-voice support)

### 12.2 Refactoring Needs

1. **Dashboard.tsx**: 302 lines, should split into:
   - `DashboardLayout.tsx`
   - `DashboardHeader.tsx`
   - `ProfileSettingsDialog.tsx` (deprecated, use page instead)

2. **PostCard.tsx**: Consider extracting image dialog logic

3. **Edge Functions**: Add better error logging and monitoring

### 12.3 Security Considerations

1. **RLS Policies**: All verified, but need regular audits
2. **API Rate Limiting**: Currently relying on Lovable AI Gateway limits
3. **Input Validation**: Add Zod schemas for all form inputs
4. **XSS Protection**: Markdown rendering needs sanitization check

---

## 13. Monitoring & Maintenance

### 13.1 Key Metrics to Track

**User Metrics**:
- Daily/Monthly Active Users (DAU/MAU)
- Conversion rate (free → paid)
- Churn rate
- Average posts per user

**Technical Metrics**:
- Edge function response times
- Database query performance
- Error rates (by function)
- Storage usage

**Business Metrics**:
- Revenue (MRR/ARR)
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- Credit usage per tier

### 13.2 Logging Strategy

**Edge Functions**:
```typescript
console.log('[generate-posts] Started', { userId, topic });
console.log('[generate-posts] AI response time:', duration);
console.error('[generate-posts] Error:', error);
```

**Frontend**:
```typescript
// Use Sentry or LogRocket for production
// Track user actions, errors, performance
```

**Database**:
- Enable Supabase logs
- Monitor slow queries
- Track RLS policy performance

### 13.3 Backup & Recovery

**Database Backups**:
- Daily automated backups (Supabase)
- Point-in-time recovery (PITR) enabled
- Test restore process quarterly

**Storage Backups**:
- Avatars bucket replication
- Post images archived to S3 (future)

---

## 14. Support & Documentation

### 14.1 User Documentation

**In-App Help**:
- Tooltips on key features
- Onboarding tutorial (future)
- Help center link in sidebar

**External Docs**:
- Knowledge base (future: docs.linktweet.com)
- Video tutorials (YouTube)
- Blog with best practices

### 14.2 Developer Documentation

**README.md**:
- Project setup instructions
- Environment variables
- Development workflow

**API Documentation**:
- Edge function endpoints
- Request/response schemas
- Error codes

**Contributing Guide** (if open-source):
- Code style guide
- PR process
- Testing requirements

---

## 15. Appendix

### 15.1 Glossary

- **RLS**: Row Level Security (Postgres security feature)
- **Edge Function**: Serverless function (Deno-based)
- **Lovable AI**: AI Gateway for accessing Google Gemini models
- **Credits**: Usage tokens for AI generation
- **Brand Voice**: Consistent writing style/tone
- **Markdown**: Lightweight formatting syntax

### 15.2 Resources

**Lovable Documentation**:
- https://docs.lovable.dev/

**Supabase Documentation**:
- https://supabase.com/docs

**Shadcn/ui**:
- https://ui.shadcn.com/

**Tailwind CSS**:
- https://tailwindcss.com/docs

### 15.3 Contact

**Support Email**: support@linktweet.com  
**Feature Requests**: https://linktweet.canny.io  
**Bug Reports**: GitHub Issues (if open-source)

---

## Document Version

**Version**: 1.0  
**Last Updated**: 2025  
**Author**: LinkTweet Product Team  
**Status**: Living Document (update as features evolve)

---

**End of PRD**
