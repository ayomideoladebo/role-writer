import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface Profile {
  subscription_tier: string;
}

interface Post {
  id: string;
  platform: string;
  created_at: string;
}

export default function Analytics() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch both profile and posts in parallel for faster loading
      const [profileResult, postsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single(),
        supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      setProfile(profileResult.data);
      setPosts(postsResult.data || []);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const isPremium = profile?.subscription_tier !== "free";

  const getWeekPosts = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return posts.filter((p) => new Date(p.created_at) >= weekAgo).length;
  };

  const getMonthPosts = () => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return posts.filter((p) => new Date(p.created_at) >= monthAgo).length;
  };

  const getPlatformBreakdown = () => {
    const breakdown: Record<string, number> = {};
    posts.forEach((post) => {
      breakdown[post.platform] = (breakdown[post.platform] || 0) + 1;
    });
    return breakdown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#0a0c1a]">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="p-2 bg-primary rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                    Advanced Analytics
                  </h1>
                </div>
              </div>
            </header>
            <main className="flex-1 p-8">
              <div className="max-w-7xl mx-auto">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6 pb-6 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      Unlock detailed metrics, engagement tracking, and performance insights
                    </p>
                    <Button onClick={() => navigate("/pricing")}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const platformBreakdown = getPlatformBreakdown();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0c1a]">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="p-2 bg-primary rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-primary bg-clip-text text-transparent flex items-center gap-2">
                    Advanced Analytics
                    <Badge variant="secondary">Premium</Badge>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Deep insights into your content performance
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getWeekPosts()}</div>
                    <p className="text-xs text-muted-foreground">Posts created</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getMonthPosts()}</div>
                    <p className="text-xs text-muted-foreground">Posts created</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12.5%</div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{posts.length}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(platformBreakdown).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              platform === "linkedin"
                                ? "bg-blue-500"
                                : platform === "twitter"
                                ? "bg-sky-500"
                                : platform === "instagram"
                                ? "bg-pink-500"
                                : "bg-indigo-500"
                            }`}
                          />
                          <span className="capitalize font-medium">{platform}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{count} posts</span>
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                platform === "linkedin"
                                  ? "bg-blue-500"
                                  : platform === "twitter"
                                  ? "bg-sky-500"
                                  : platform === "instagram"
                                  ? "bg-pink-500"
                                  : "bg-indigo-500"
                              }`}
                              style={{ width: `${(count / posts.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
