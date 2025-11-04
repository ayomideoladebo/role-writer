import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CreditCard, Search, Package, TrendingUp, Calendar, AlertTriangle, Activity, BarChart3 } from "lucide-react";
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
  postsThisMonth: number;
  postsToday: number;
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
    postsThisMonth: 0,
    postsToday: 0,
  });
  const { toast } = useToast();

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

      setStats({
        totalUsers: userData.length,
        activeUsers: activeUsersCount,
        totalPosts: postData.length,
        totalCredits: totalCreditsCount,
        premiumUsers: premiumCount,
        freeUsers: userData.length - premiumCount,
        postsThisMonth: postsThisMonthCount,
        postsToday: postsTodayCount,
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
    <div className="min-h-screen p-6 space-y-6 bg-[#0a0c1a]">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage users, subscriptions, and monitor platform activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.premiumUsers} premium · {stats.freeUsers} free
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Posts
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.postsThisMonth} this month · {stats.postsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credits
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCredits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats.totalUsers > 0
                ? Math.round(stats.totalCredits / stats.totalUsers)
                : 0} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Potential
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.premiumUsers * 29).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Usage</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>LinkedIn:</span>
                <span className="font-medium">{posts.filter(p => p.platform === "linkedin").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Twitter:</span>
                <span className="font-medium">{posts.filter(p => p.platform === "twitter").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Instagram:</span>
                <span className="font-medium">{posts.filter(p => p.platform === "instagram").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Posts/User</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total posts per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
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
  );
}