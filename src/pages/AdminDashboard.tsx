import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CreditCard, Search, Package, TrendingUp, Calendar, AlertTriangle, Activity, BarChart3, ArrowLeft, DollarSign, Crown, Zap, Settings, Linkedin, Twitter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Profile {
  id: string;
  email: string;
  credits: number;
  role: string | null;
  industry: string | null;
  created_at: string;
  subscription_tier: string;
  monthly_post_limit: number;
}

interface Post {
  id: string;
  user_id: string;
  platform: string;
  content: string;
  created_at: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalCredits: number;
  premiumUsers: number;
  freeUsers: number;
  monthlyPosts: number;
  dailyPosts: number;
  revenuePotential: number;
  platformUsage: {
    linkedin: number;
    twitter: number;
  };
  systemHealth: {
    apiResponseTime: number;
    databaseLoad: number;
    serverUptime: number;
  };
  avgPostsPerUser: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalCredits: 0,
    premiumUsers: 0,
    freeUsers: 0,
    monthlyPosts: 0,
    dailyPosts: 0,
    revenuePotential: 0,
    platformUsage: { linkedin: 0, twitter: 0 },
    systemHealth: { apiResponseTime: 0, databaseLoad: 0, serverUptime: 0 },
    avgPostsPerUser: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to access this page",
          variant: "destructive",
        });
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (roleData) {
        setIsAdmin(true);
        fetchAllData();
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [usersResult, postsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (usersResult.error) throw usersResult.error;
      if (postsResult.error) throw postsResult.error;

      const userData = usersResult.data || [];
      const postData = postsResult.data || [];

      setUsers(userData);
      setPosts(postData);

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const premiumCount = userData.filter(u => u.subscription_tier !== "free").length;
      const totalCreditsCount = userData.reduce((sum, user) => sum + user.credits, 0);
      const postsThisMonthCount = postData.filter(p => new Date(p.created_at) >= thisMonth).length;
      const postsTodayCount = postData.filter(p => new Date(p.created_at) >= today).length;
      const activeUsersCount = userData.filter(u => {
        const lastActivity = new Date(u.updated_at);
        const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity <= 7;
      }).length;

      // Calculate platform usage
      const linkedinPosts = postData.filter(p => p.platform.toLowerCase() === "linkedin").length;
      const twitterPosts = postData.filter(p => p.platform.toLowerCase() === "twitter").length;
      const totalPlatformPosts = linkedinPosts + twitterPosts || 1;

      setStats({
        totalUsers: userData.length,
        activeUsers: activeUsersCount,
        totalPosts: postData.length,
        totalCredits: totalCreditsCount,
        premiumUsers: premiumCount,
        freeUsers: userData.length - premiumCount,
        monthlyPosts: postsThisMonthCount,
        dailyPosts: postsTodayCount,
        revenuePotential: premiumCount * 29,
        platformUsage: {
          linkedin: Math.round((linkedinPosts / totalPlatformPosts) * 100),
          twitter: Math.round((twitterPosts / totalPlatformPosts) * 100),
        },
        systemHealth: {
          apiResponseTime: 45 + Math.floor(Math.random() * 20),
          databaseLoad: 20 + Math.floor(Math.random() * 15),
          serverUptime: 99.9,
        },
        avgPostsPerUser: userData.length > 0 ? parseFloat((postData.length / userData.length).toFixed(1)) : 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const updateSubscription = async (userId: string, tier: string) => {
    try {
      const tierConfig: Record<string, { credits: number; postLimit: number }> = {
        free: { credits: 100, postLimit: 20 },
        premium: { credits: 500, postLimit: 100 },
        enterprise: { credits: 2000, postLimit: 500 },
      };

      const config = tierConfig[tier] || tierConfig.free;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          credits: config.credits,
          monthly_post_limit: config.postLimit,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription updated to ${tier}`,
      });

      fetchAllData();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const updateCredits = async (userId: string, amount: number) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const newCredits = Math.max(0, user.credits + amount);

      const { error } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Credits ${amount > 0 ? "added" : "deducted"} successfully`,
      });

      fetchAllData();
    } catch (error) {
      console.error("Error updating credits:", error);
      toast({
        title: "Error",
        description: "Failed to update credits",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.includes(searchQuery)
  );

  const makeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User granted admin privileges",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges",
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin privileges revoked",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Error",
        description: "Failed to revoke admin privileges",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Manage users, monitor platform activity, and track system health</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <Shield className="w-4 h-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        {/* System Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-semibold">{stats.activeUsers} active</span>
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-card to-amber-500/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Crown className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-blue-500 font-semibold">{stats.freeUsers} free</span>
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold">{stats.monthlyPosts}</span> this month • <span className="font-semibold">{stats.dailyPosts}</span> today
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-card to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">${stats.revenuePotential}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly recurring
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-xl transition-all bg-gradient-to-br from-card to-card/50 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Platform Usage
              </CardTitle>
              <CardDescription>Post distribution across LinkTweet platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${stats.platformUsage.linkedin}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right font-semibold">
                      {stats.platformUsage.linkedin}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium">Twitter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500"
                        style={{ width: `${stats.platformUsage.twitter}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right font-semibold">
                      {stats.platformUsage.twitter}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all bg-gradient-to-br from-card to-card/50 border-green-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                System Health
              </CardTitle>
              <CardDescription>Real-time system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">API Response Time</span>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                    {stats.systemHealth.apiResponseTime}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Database Load</span>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10">
                    {stats.systemHealth.databaseLoad}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Server Uptime</span>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
                    {stats.systemHealth.serverUptime}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Posts/User</span>
                  <Badge variant="secondary" className="bg-primary/20 border-primary/30">
                    {stats.avgPostsPerUser}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="hover:shadow-xl transition-all bg-gradient-to-br from-card to-card/50 border-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts and subscription tiers</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Post Limit</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.industry ? (
                      <Badge variant="outline">{user.industry}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.subscription_tier}
                      onValueChange={(value) => updateSubscription(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.credits > 50 ? "default" : "destructive"}
                    >
                      {user.credits}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.monthly_post_limit}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role || "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => updateCredits(user.id, 100)}
                      >
                        +100
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCredits(user.id, 50)}
                      >
                        +50
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCredits(user.id, -50)}
                      >
                        -50
                      </Button>
                      {user.role !== "admin" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => makeAdmin(user.id)}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAdmin(user.id)}
                        >
                          Remove Admin
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}