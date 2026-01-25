import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Bookmark, Linkedin, Twitter, TrendingUp, Zap, Crown, Calendar } from "lucide-react";
import { lazy, Suspense } from "react";
const ContentCalendar = lazy(() => import("@/components/ContentCalendar"));
const BrandVoiceSettings = lazy(() => import("@/components/BrandVoiceSettings"));

interface Post {
  id: string;
  platform: string;
  content: string;
  is_saved: boolean;
  created_at: string;
  image_url?: string | null;
}

interface Profile {
  role: string;
  industry: string;
  tone_preference: string;
  onboarding_completed: boolean;
  interests?: string;
  target_audience?: string;
  content_goals?: string;
  posting_frequency?: string;
  avatar_url?: string | null;
  credits: number;
  subscription_tier: string;
  brand_voice?: string | null;
}

interface ContentInsightsProps {
  posts: Post[];
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export default function ContentInsights({ posts, profile, onProfileUpdate }: ContentInsightsProps) {
  // Basic insights - available for all users
  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "enterprise";
  
  const stats = {
    total: posts.length,
    saved: posts.filter((p) => p.is_saved).length,
    linkedin: posts.filter((p) => p.platform.toLowerCase() === "linkedin").length,
    twitter: posts.filter((p) => p.platform.toLowerCase() === "twitter").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-3">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Quick overview of your content and account
        </p>
      </div>

      {/* Basic Stats Cards - Available for all users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saved</p>
                <p className="text-3xl font-bold">{stats.saved}</p>
              </div>
              <Bookmark className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
                <p className="text-3xl font-bold">{stats.linkedin}</p>
              </div>
              <Linkedin className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Twitter</p>
                <p className="text-3xl font-bold">{stats.twitter}</p>
              </div>
              <Twitter className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Your Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-primary">{profile?.credits || 0}</p>
              <p className="text-muted-foreground">credits remaining</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground pt-3 border-t">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-primary">10 credits</span> per platform post generation
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-primary">5 credits</span> per image generation
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Platform Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0A66C2] transition-all"
                      style={{
                        width: `${stats.total > 0 ? (stats.linkedin / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{stats.linkedin}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                  <span className="text-sm font-medium">Twitter</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1DA1F2] transition-all"
                      style={{
                        width: `${stats.total > 0 ? (stats.twitter / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{stats.twitter}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Calendar - Only show for premium users */}
      {isPremium && (
        <Suspense fallback={<div className="flex items-center justify-center py-8"><Calendar className="w-6 h-6 animate-spin text-primary" /></div>}>
          <ContentCalendar posts={posts} isPremium={isPremium} />
        </Suspense>
      )}

      {/* Brand Voice Settings - Only show for premium users */}
      {isPremium && (
        <Suspense fallback={<div className="flex items-center justify-center py-8"><Crown className="w-6 h-6 animate-spin text-primary" /></div>}>
          <BrandVoiceSettings 
            brandVoice={profile?.brand_voice || null} 
            isPremium={isPremium}
            onUpdate={onProfileUpdate}
          />
        </Suspense>
      )}
    </div>
  );
}
