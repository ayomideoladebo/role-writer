import { Card, CardContent } from "@/components/ui/card";
import { FileText, Bookmark, Linkedin, Twitter, TrendingUp, Zap } from "lucide-react";

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
}

interface ContentInsightsProps {
  posts: Post[];
  profile: Profile | null;
}

export default function ContentInsights({ posts, profile }: ContentInsightsProps) {
  const stats = {
    total: posts.length,
    saved: posts.filter((p) => p.is_saved).length,
    linkedin: posts.filter((p) => p.platform.toLowerCase() === "linkedin").length,
    twitter: posts.filter((p) => p.platform.toLowerCase() === "twitter").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Insights</h1>
        <p className="text-muted-foreground">
          Track your content performance and credit usage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saved</p>
                <p className="text-3xl font-bold">{stats.saved}</p>
              </div>
              <Bookmark className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LinkedIn</p>
                <p className="text-3xl font-bold">{stats.linkedin}</p>
              </div>
              <Linkedin className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Twitter</p>
                <p className="text-3xl font-bold">{stats.twitter}</p>
              </div>
              <Twitter className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-primary/20">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="text-3xl font-bold text-primary">{profile?.credits || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credits Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Credit Pricing</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-primary">10 credits</span> per platform when generating posts
                </p>
                <p>
                  <span className="font-semibold text-primary">5 credits</span> per image generation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card className="bg-gradient-card">
        <CardContent className="pt-6 pb-6">
          <h3 className="font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-primary" />
                <span className="text-sm">LinkedIn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${stats.total > 0 ? (stats.linkedin / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.linkedin}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-primary" />
                <span className="text-sm">Twitter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${stats.total > 0 ? (stats.twitter / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.twitter}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
