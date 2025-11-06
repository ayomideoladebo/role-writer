import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Crown, Sparkles, Activity, Target, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Progress } from "@/components/ui/progress";

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
  const [growthRate, setGrowthRate] = useState(0);
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
      
      // Calculate growth rate
      if (postsResult.data) {
        const thisMonth = postsResult.data.filter(p => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(p.created_at) >= monthAgo;
        }).length;
        
        const lastMonth = postsResult.data.filter(p => {
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return new Date(p.created_at) >= twoMonthsAgo && new Date(p.created_at) < oneMonthAgo;
        }).length;
        
        const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
        setGrowthRate(Math.round(growth * 10) / 10);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const isPremium = profile?.subscription_tier !== "free";
  const isEnterprise = profile?.subscription_tier === "enterprise";

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

  const getTodayPosts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return posts.filter((p) => new Date(p.created_at) >= today).length;
  };

  const getAveragePostsPerWeek = () => {
    if (posts.length === 0) return 0;
    const oldestPost = new Date(posts[posts.length - 1].created_at);
    const weeksSinceStart = Math.max(1, Math.ceil((Date.now() - oldestPost.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return Math.round((posts.length / weeksSinceStart) * 10) / 10;
  };

  const getBestPostingDay = () => {
    const dayCount: Record<string, number> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    posts.forEach((post) => {
      const day = days[new Date(post.created_at).getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    return Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  };

  const getPlatformBreakdown = () => {
    const breakdown: Record<string, number> = {};
    posts.forEach((post) => {
      breakdown[post.platform] = (breakdown[post.platform] || 0) + 1;
    });
    return breakdown;
  };

  const getEngagementScore = () => {
    // Simple engagement calculation based on post frequency and consistency
    const weekPosts = getWeekPosts();
    const avgPosts = getAveragePostsPerWeek();
    return Math.min(100, Math.round((weekPosts / Math.max(avgPosts, 1)) * 50 + (posts.length > 0 ? 50 : 0)));
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
                <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    Advanced Analytics
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {isEnterprise ? 'Enterprise' : 'Premium'}
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Deep insights & performance tracking for your content
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Posts Today</CardTitle>
                    <Clock className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getTodayPosts()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Created today</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getWeekPosts()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getMonthPosts()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={growthRate >= 0 ? "text-green-500" : "text-red-500"}>
                        {growthRate > 0 ? '+' : ''}{growthRate}%
                      </span> vs last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{posts.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Posting Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Engagement Score</span>
                        <span className="text-sm font-bold text-primary">{getEngagementScore()}%</span>
                      </div>
                      <Progress value={getEngagementScore()} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Based on posting consistency and frequency
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Avg. Posts/Week</p>
                        <p className="text-2xl font-bold">{getAveragePostsPerWeek()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Best Day</p>
                        <p className="text-2xl font-bold">{getBestPostingDay()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Platform Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(platformBreakdown).map(([platform, count]) => (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  platform === "linkedin"
                                    ? "bg-[#0A66C2]"
                                    : platform === "twitter"
                                    ? "bg-[#1DA1F2]"
                                    : "bg-primary"
                                }`}
                              />
                              <span className="capitalize font-medium text-sm">{platform}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{count} posts</span>
                              <span className="text-sm font-bold">{Math.round((count / posts.length) * 100)}%</span>
                            </div>
                          </div>
                          <Progress 
                            value={(count / posts.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enterprise-Only Advanced Features */}
              {isEnterprise && (
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      Enterprise Insights
                      <Badge variant="secondary" className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Coming Soon
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-card/50 rounded-lg">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <h4 className="font-semibold mb-1">Peak Times</h4>
                        <p className="text-xs text-muted-foreground">AI-powered optimal posting schedule</p>
                      </div>
                      <div className="text-center p-4 bg-card/50 rounded-lg">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <h4 className="font-semibold mb-1">Predictive Analytics</h4>
                        <p className="text-xs text-muted-foreground">Forecast engagement & reach</p>
                      </div>
                      <div className="text-center p-4 bg-card/50 rounded-lg">
                        <Target className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <h4 className="font-semibold mb-1">Competitor Insights</h4>
                        <p className="text-xs text-muted-foreground">Industry benchmarking & trends</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
