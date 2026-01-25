import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Bookmark, Linkedin, Twitter, TrendingUp, Zap, Crown, Calendar, ArrowUpRight, Sparkles } from "lucide-react";
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
  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "enterprise";
  
  const stats = {
    total: posts.length,
    saved: posts.filter((p) => p.is_saved).length,
    linkedin: posts.filter((p) => p.platform.toLowerCase() === "linkedin").length,
    twitter: posts.filter((p) => p.platform.toLowerCase() === "twitter").length,
  };

  const statCards = [
    { 
      label: "Total Posts", 
      value: stats.total, 
      icon: FileText, 
      gradient: "from-primary to-accent",
      change: "+12%"
    },
    { 
      label: "Saved", 
      value: stats.saved, 
      icon: Bookmark, 
      gradient: "from-amber-500 to-orange-500",
      change: "+8%"
    },
    { 
      label: "LinkedIn", 
      value: stats.linkedin, 
      icon: Linkedin, 
      gradient: "from-[#0077B5] to-[#00A0DC]",
      change: "+15%"
    },
    { 
      label: "Twitter", 
      value: stats.twitter, 
      icon: Twitter, 
      gradient: "from-[#1DA1F2] to-[#14171A]",
      change: "+5%"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Dashboard
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track your content performance and insights
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="group bg-card border border-border/50 hover:border-primary/30 shadow-card hover-lift overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credits Card */}
        <Card className="bg-card border border-border/50 shadow-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Your Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-bold gradient-text">{profile?.credits || 0}</p>
              <p className="text-muted-foreground">credits remaining</p>
            </div>
            <div className="h-px bg-border/30" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Post generation</span>
                <span className="font-semibold text-primary">10 credits</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Image generation</span>
                <span className="font-semibold text-primary">5 credits</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="bg-card border border-border/50 shadow-card hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Platform Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0077B5]/10">
                    <Linkedin className="w-4 h-4 text-[#0077B5]" />
                  </div>
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
                <span className="text-lg font-bold">{stats.linkedin}</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0077B5] to-[#00A0DC] rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total > 0 ? (stats.linkedin / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            
            {/* Twitter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#1DA1F2]/10">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  </div>
                  <span className="text-sm font-medium">Twitter</span>
                </div>
                <span className="text-lg font-bold">{stats.twitter}</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1DA1F2] to-[#657786] rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.total > 0 ? (stats.twitter / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Features */}
      {isPremium && (
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Calendar className="w-6 h-6 animate-spin text-primary" />
          </div>
        }>
          <ContentCalendar posts={posts} isPremium={isPremium} />
        </Suspense>
      )}

      {isPremium && (
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Crown className="w-6 h-6 animate-spin text-primary" />
          </div>
        }>
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
