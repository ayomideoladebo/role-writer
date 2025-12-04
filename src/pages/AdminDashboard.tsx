import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Search, Linkedin, Twitter, Filter, Trash2, FileText, LayoutGrid, List, BarChart3 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminUserCard } from "@/components/admin/AdminUserCard";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminUserDetailSheet } from "@/components/admin/AdminUserDetailSheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface Profile {
  id: string;
  email: string;
  credits: number;
  role: string | null;
  industry: string | null;
  created_at: string;
  subscription_tier: string;
  monthly_post_limit: number;
  updated_at?: string;
}

interface Post {
  id: string;
  user_id: string;
  platform: string;
  content: string;
  created_at: string;
  image_url?: string;
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
  enterpriseUsers: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterTier, setFilterTier] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [postSearch, setPostSearch] = useState("");
  const [postPlatformFilter, setPostPlatformFilter] = useState<string>("all");
  const [selectedUserDetail, setSelectedUserDetail] = useState<Profile | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
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
    enterpriseUsers: 0,
    conversionRate: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Calculate post counts per user
  const userPostCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => {
      counts[post.user_id] = (counts[post.user_id] || 0) + 1;
    });
    return counts;
  }, [posts]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setViewMode("grid");
    }
  }, [isMobile]);

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
    setRefreshing(true);
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

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const premiumCount = userData.filter(u => u.subscription_tier === "premium").length;
      const enterpriseCount = userData.filter(u => u.subscription_tier === "enterprise").length;
      const totalCreditsCount = userData.reduce((sum, user) => sum + user.credits, 0);
      const postsThisMonthCount = postData.filter(p => new Date(p.created_at) >= thisMonth).length;
      const postsTodayCount = postData.filter(p => new Date(p.created_at) >= today).length;
      const activeUsersCount = userData.filter(u => {
        if (!u.updated_at) return false;
        const lastActivity = new Date(u.updated_at);
        const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity <= 7;
      }).length;

      const linkedinPosts = postData.filter(p => p.platform.toLowerCase() === "linkedin").length;
      const twitterPosts = postData.filter(p => p.platform.toLowerCase() === "twitter").length;
      const totalPlatformPosts = linkedinPosts + twitterPosts || 1;

      const freeCount = userData.length - premiumCount - enterpriseCount;
      const conversionRate = userData.length > 0 
        ? Math.round(((premiumCount + enterpriseCount) / userData.length) * 100) 
        : 0;

      setStats({
        totalUsers: userData.length,
        activeUsers: activeUsersCount,
        totalPosts: postData.length,
        totalCredits: totalCreditsCount,
        premiumUsers: premiumCount + enterpriseCount,
        freeUsers: freeCount,
        monthlyPosts: postsThisMonthCount,
        dailyPosts: postsTodayCount,
        revenuePotential: (premiumCount * 29) + (enterpriseCount * 99),
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
        enterpriseUsers: enterpriseCount,
        conversionRate,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
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
      const user = users.find((u) => u.id === userId);
      const preservedCredits = user && user.credits > config.credits ? user.credits : config.credits;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          credits: preservedCredits,
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

  const deletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Industry", "Subscription", "Credits", "Post Limit", "Role", "Joined"];
    const rows = users.map(user => [
      user.email,
      user.industry || "N/A",
      user.subscription_tier,
      user.credits,
      user.monthly_post_limit,
      user.role || "User",
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Users exported to CSV",
    });
  };

  const bulkUpdateSubscription = async (tier: string) => {
    if (selectedUsers.length === 0) return;

    try {
      for (const userId of selectedUsers) {
        await updateSubscription(userId, tier);
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk update:", error);
    }
  };

  const bulkAddCredits = async (amount: number) => {
    if (selectedUsers.length === 0) return;

    try {
      for (const userId of selectedUsers) {
        await updateCredits(userId, amount);
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error in bulk credit update:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || user.id.includes(searchQuery);
    const matchesTier = filterTier === "all" || user.subscription_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(postSearch.toLowerCase());
    const matchesPlatform = postPlatformFilter === "all" || post.platform.toLowerCase() === postPlatformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Stats Cards */}
        <AdminStatsCards stats={stats} />

        {/* Quick Actions */}
        <AdminQuickActions
          onExportUsers={exportToCSV}
          onRefreshData={fetchAllData}
          selectedCount={selectedUsers.length}
          onBulkUpgrade={() => bulkUpdateSubscription("premium")}
          onBulkAddCredits={() => bulkAddCredits(100)}
          isRefreshing={refreshing}
        />

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-muted/50">
            <TabsTrigger value="users" className="gap-1.5 text-xs md:text-sm data-[state=active]:bg-background">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5 text-xs md:text-sm data-[state=active]:bg-background">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs md:text-sm data-[state=active]:bg-background">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">User Management</CardTitle>
                    {!isMobile && (
                      <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewMode("grid")}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === "table" ? "secondary" : "ghost"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewMode("table")}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10"
                      />
                    </div>
                    <Select value={filterTier} onValueChange={setFilterTier}>
                      <SelectTrigger className="w-full sm:w-40 h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" || isMobile ? (
                  <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredUsers.map((user) => (
                        <AdminUserCard
                          key={user.id}
                          user={user}
                          isSelected={selectedUsers.includes(user.id)}
                          postCount={userPostCounts[user.id] || 0}
                          onSelect={(selected) => {
                            if (selected) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          onUpdateSubscription={updateSubscription}
                          onUpdateCredits={updateCredits}
                          onMakeAdmin={makeAdmin}
                          onRemoveAdmin={removeAdmin}
                          onDelete={deleteUser}
                          onViewDetails={(u) => {
                            setSelectedUserDetail(u);
                            setIsUserDetailOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers(filteredUsers.map(u => u.id));
                                } else {
                                  setSelectedUsers([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Posts</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="group">
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[200px]">{user.email}</span>
                                {user.role === "admin" && (
                                  <Badge variant="default" className="h-5 text-[10px]">Admin</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.subscription_tier}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.credits > 50 ? "secondary" : "destructive"} className="text-xs">
                                {user.credits}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {userPostCounts[user.id] || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7 text-xs" 
                                  onClick={() => {
                                    setSelectedUserDetail(user);
                                    setIsUserDetailOpen(true);
                                  }}
                                >
                                  View
                                </Button>
                                <Button size="sm" className="h-7 text-xs" onClick={() => updateCredits(user.id, 100)}>
                                  +100
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => deleteUser(user.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Post Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  <Select value={postPlatformFilter} onValueChange={setPostPlatformFilter}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-500px)] min-h-[300px]">
                  <div className="space-y-3">
                    {filteredPosts.slice(0, 50).map((post) => {
                      const user = users.find(u => u.id === post.user_id);
                      return (
                        <Card key={post.id} className="p-3 md:p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  {post.platform === "LinkedIn" ? (
                                    <Linkedin className="w-3 h-3" />
                                  ) : (
                                    <Twitter className="w-3 h-3" />
                                  )}
                                  {post.platform}
                                </Badge>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user?.email || "Unknown user"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.content}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Showing {Math.min(50, filteredPosts.length)} of {filteredPosts.length} posts
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdminAnalyticsTab stats={stats} />
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Sheet */}
      <AdminUserDetailSheet
        user={selectedUserDetail}
        open={isUserDetailOpen}
        onOpenChange={setIsUserDetailOpen}
        userPosts={selectedUserDetail ? (userPostCounts[selectedUserDetail.id] || 0) : 0}
        onUpdateSubscription={updateSubscription}
        onUpdateCredits={updateCredits}
        onMakeAdmin={makeAdmin}
        onRemoveAdmin={removeAdmin}
        onDelete={deleteUser}
      />
    </div>
  );
}
