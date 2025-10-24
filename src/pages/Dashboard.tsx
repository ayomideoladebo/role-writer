import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, LogOut, RefreshCw, Lightbulb, Search, FileText, Bookmark, Linkedin, Twitter, Settings, ArrowUpDown, Download, Zap, TrendingUp, Upload, User } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [idea, setIdea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterSaved, setFilterSaved] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    role: "",
    industry: "",
    tone_preference: "",
    interests: "",
    target_audience: "",
    content_goals: "",
    posting_frequency: "",
    avatar_url: null as string | null,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [suggestedIdeas, setSuggestedIdeas] = useState<Array<{ topic: string; ideas: string }>>([]);
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideaMode, setIdeaMode] = useState<string>("normal");
  const [generatingImageForPost, setGeneratingImageForPost] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData && !profileData.onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    setProfile(profileData);
    setProfileForm({
      role: profileData?.role || "",
      industry: profileData?.industry || "",
      tone_preference: profileData?.tone_preference || "",
      interests: profileData?.interests || "",
      target_audience: profileData?.target_audience || "",
      content_goals: profileData?.content_goals || "",
      posting_frequency: profileData?.posting_frequency || "",
      avatar_url: profileData?.avatar_url || null,
    });

    // Fetch posts
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const generatePosts = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: { 
          profile,
          topic: topic.trim(),
          idea: idea.trim() || undefined,
        },
      });

      if (error) throw error;

      toast.success("New posts generated! 20 credits deducted.");
      
      // Clear inputs
      setTopic("");
      setIdea("");
      
      // Refresh posts and profile to update credits
      const { data: { user } } = await supabase.auth.getUser();
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      const { data: profileData } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user!.id)
        .single();

      if (profileData && profile) {
        setProfile({ ...profile, credits: profileData.credits });
      }

      setPosts(postsData || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate posts");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const { error } = await supabase
        .from("posts")
        .update({ is_saved: !post?.is_saved })
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p)));
      toast.success(post?.is_saved ? "Removed from saved" : "Saved to vault");
    } catch (error: any) {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (error: any) {
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = async (postId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: newContent })
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.map((p) => (p.id === postId ? { ...p, content: newContent } : p)));
      toast.success("Post updated");
    } catch (error: any) {
      toast.error("Failed to update post");
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setProfileForm({ ...profileForm, avatar_url: publicUrl });
      setProfile({ ...profile!, avatar_url: publicUrl });
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({
          role: profileForm.role,
          industry: profileForm.industry,
          tone_preference: profileForm.tone_preference,
          interests: profileForm.interests,
          target_audience: profileForm.target_audience,
          content_goals: profileForm.content_goals,
          posting_frequency: profileForm.posting_frequency,
        })
        .eq("id", user!.id);

      if (error) throw error;

      setProfile({
        ...profile!,
        role: profileForm.role,
        industry: profileForm.industry,
        tone_preference: profileForm.tone_preference,
        interests: profileForm.interests,
        target_audience: profileForm.target_audience,
        content_goals: profileForm.content_goals,
        posting_frequency: profileForm.posting_frequency,
      });
      setSettingsOpen(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for batch generation");
      return;
    }
    
    setGenerating(true);
    try {
      // Generate 3 batches
      for (let i = 0; i < 3; i++) {
        const { error } = await supabase.functions.invoke("generate-posts", {
          body: { 
            profile,
            topic: topic.trim(),
            idea: idea.trim() || undefined,
          },
        });
        if (error) throw error;
      }

      toast.success("Batch generation complete! 6 new posts created. 60 credits deducted.");
      
      setTopic("");
      setIdea("");
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      const { data: profileData } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user!.id)
        .single();

      if (profileData && profile) {
        setProfile({ ...profile, credits: profileData.credits });
      }

      setPosts(postsData || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate batch posts");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPosts = (format: 'csv' | 'json') => {
    if (filteredPosts.length === 0) {
      toast.error("No posts to export");
      return;
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(filteredPosts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `posts-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Posts exported as JSON");
    } else {
      const headers = ['Platform', 'Content', 'Saved', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...filteredPosts.map(post => [
          post.platform,
          `"${post.content.replace(/"/g, '""')}"`,
          post.is_saved ? 'Yes' : 'No',
          new Date(post.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `posts-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Posts exported as CSV");
    }
  };

  const generateIdeasHandler = async () => {
    setGeneratingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: { profile, mode: ideaMode },
      });

      if (error) throw error;

      setSuggestedIdeas(data.ideas);
      setShowIdeas(true);
      toast.success("Ideas generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate ideas");
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const selectIdea = (selectedIdea: { topic: string; ideas: string }) => {
    setTopic(selectedIdea.topic);
    setIdea(selectedIdea.ideas);
    setShowIdeas(false);
    toast.success("Idea selected! Ready to generate posts.");
  };

  const handleGenerateImage = async (postId: string) => {
    try {
      if (!profile || profile.credits < 5) {
        toast.error("Insufficient credits. You need 5 credits to generate an image. Please top up!");
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      setGeneratingImageForPost(postId);

      // Determine post type from content
      let postType = 'story';
      const contentLower = post.content.toLowerCase();
      if (contentLower.includes('tip') || contentLower.includes('tips') || 
          contentLower.includes('how to') || contentLower.includes('guide')) {
        postType = 'tips';
      }

      const { data, error } = await supabase.functions.invoke("generate-post-image", {
        body: {
          postContent: post.content,
          postType: postType,
          avatarUrl: profile?.avatar_url || null
        },
      });

      if (error) throw error;

      // Update post with image URL
      const { error: updateError } = await supabase
        .from("posts")
        .update({ image_url: data.imageUrl })
        .eq("id", postId);

      if (updateError) throw updateError;

      // Deduct 5 credits
      const { data: { user } } = await supabase.auth.getUser();
      const newCredits = profile.credits - 5;
      const { error: creditsError } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", user?.id);

      if (creditsError) throw creditsError;

      setProfile({ ...profile, credits: newCredits });
      setPosts(posts.map(p => p.id === postId ? { ...p, image_url: data.imageUrl } : p));
      toast.success("Image generated successfully! 5 credits deducted.");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGeneratingImageForPost(null);
    }
  };

  // Filter, search, and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = filterPlatform === "all" || post.platform.toLowerCase() === filterPlatform;
      const matchesSaved = filterSaved === "all" || (filterSaved === "saved" ? post.is_saved : !post.is_saved);
      return matchesSearch && matchesPlatform && matchesSaved;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const stats = {
    total: posts.length,
    saved: posts.filter((p) => p.is_saved).length,
    linkedin: posts.filter((p) => p.platform.toLowerCase() === "linkedin").length,
    twitter: posts.filter((p) => p.platform.toLowerCase() === "twitter").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                 <h1 className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                   LinkTweet
                 </h1>
                {profile && (
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate">
                    {profile.role} · {profile.industry}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0 items-center">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{profile?.credits || 0}</span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex h-8 sm:h-9 text-xs bg-gradient-primary"
                onClick={() => toast.info("Top-up feature coming soon! Contact support to add credits.")}
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Top Up
              </Button>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile preferences to generate better content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4 pr-2">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profileForm.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="bg-primary/10">
                          <User className="w-8 h-8 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                        <Label htmlFor="avatar-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer w-full"
                            disabled={uploadingAvatar}
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            {uploadingAvatar ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Picture
                              </>
                            )}
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Used for generating personalized post images
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-role">Role</Label>
                    <Input
                      id="settings-role"
                      placeholder="e.g., Marketing Manager"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-industry">Industry</Label>
                    <Input
                      id="settings-industry"
                      placeholder="e.g., Technology"
                      value={profileForm.industry}
                      onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-tone">Tone Preference</Label>
                    <Select
                      value={profileForm.tone_preference}
                      onValueChange={(value) => setProfileForm({ ...profileForm, tone_preference: value })}
                    >
                      <SelectTrigger id="settings-tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-interests">Interests & Expertise</Label>
                    <Textarea
                      id="settings-interests"
                      placeholder="e.g., AI, Leadership, Innovation..."
                      value={profileForm.interests}
                      onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-audience">Target Audience</Label>
                    <Input
                      id="settings-audience"
                      placeholder="e.g., B2B executives, entrepreneurs"
                      value={profileForm.target_audience}
                      onChange={(e) => setProfileForm({ ...profileForm, target_audience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-goals">Content Goals</Label>
                    <Textarea
                      id="settings-goals"
                      placeholder="e.g., Build thought leadership, drive engagement..."
                      value={profileForm.content_goals}
                      onChange={(e) => setProfileForm({ ...profileForm, content_goals: e.target.value })}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-frequency">Posting Frequency</Label>
                    <Select
                      value={profileForm.posting_frequency}
                      onValueChange={(value) => setProfileForm({ ...profileForm, posting_frequency: value })}
                    >
                      <SelectTrigger id="settings-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">2-3 times per week</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updatingProfile}
                      className="w-full"
                    >
                      {updatingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout} className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4">
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Your Content Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            AI-generated posts tailored to your preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-8">
          <Card className="bg-gradient-card">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Saved</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.saved}</p>
                </div>
                <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">LinkedIn</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.linkedin}</p>
                </div>
                <Linkedin className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Twitter</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.twitter}</p>
                </div>
                <Twitter className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Credits</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{profile?.credits || 0}</p>
                </div>
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits Info Banner */}
        <Card className="mb-4 sm:mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Credit Pricing</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Generate posts: <span className="font-semibold text-primary">10 credits</span> per platform · 
                  Generate images: <span className="font-semibold text-primary">5 credits</span> each
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => toast.info("Top-up feature coming soon! Contact support to add credits.")}
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Top Up Credits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Find Inspiration Section */}
        <Card className="mb-4 sm:mb-6 shadow-card border-2 bg-gradient-card">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Find Inspiration</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Get AI-powered topic ideas tailored to your profile
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-shrink-0">
                <Select value={ideaMode} onValueChange={setIdeaMode}>
                  <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Mode</SelectItem>
                    <SelectItem value="story">Story Mode</SelectItem>
                    <SelectItem value="tips">Tips Mode</SelectItem>
                    <SelectItem value="fun">Fun Mode</SelectItem>
                    <SelectItem value="question">Question Mode</SelectItem>
                    <SelectItem value="list">List Mode</SelectItem>
                    <SelectItem value="howto">How-to Mode</SelectItem>
                    <SelectItem value="mythbust">Myth-busting Mode</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={generateIdeasHandler}
                  disabled={generatingIdeas}
                  variant="outline"
                  className="text-xs sm:text-sm h-9 px-3 sm:px-4 whitespace-nowrap"
                >
                  {generatingIdeas ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Generate Ideas</span>
                      <span className="sm:hidden">Generate</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showIdeas && suggestedIdeas.length > 0 && (
            <CardContent>
              <div className="grid gap-3">
                {suggestedIdeas.map((suggestedIdea, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:border-primary transition-all"
                    onClick={() => selectIdea(suggestedIdea)}
                  >
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        {suggestedIdea.topic}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestedIdea.ideas}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="mb-4 sm:mb-8 shadow-card border-2 bg-gradient-card">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl flex-shrink-0">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">What do you want to write about?</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tell us your topic and ideas to generate tailored content
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="topic" className="text-xs sm:text-sm">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., AI in healthcare, Remote work productivity"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={generating}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="idea" className="text-xs sm:text-sm">Your Ideas (optional)</Label>
              <Textarea
                id="idea"
                placeholder="e.g., Share 3 key benefits, Include a personal experience..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={generating}
                rows={3}
                className="text-sm"
              />
            </div>
            <Button
              onClick={generatePosts}
              disabled={generating || !topic.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 h-9 sm:h-10 text-sm"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Generating posts...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Generate Posts
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleBatchGenerate}
                disabled={generating || !topic.trim()}
                variant="outline"
                className="w-full h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Batch...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Batch Generate (6x)</span>
                    <span className="sm:hidden">Batch (6x)</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleExportPosts('json')}
                disabled={filteredPosts.length === 0}
                variant="outline"
                className="w-full h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export JSON</span>
                <span className="sm:hidden">JSON</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        {posts.length > 0 && (
          <>
            <Card className="mb-4 sm:mb-6">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 sm:pl-10 text-sm h-9 sm:h-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Tabs value={filterPlatform} onValueChange={setFilterPlatform} className="w-full sm:w-auto">
                      <TabsList className="w-full sm:w-auto h-9">
                        <TabsTrigger value="all" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">All</TabsTrigger>
                        <TabsTrigger value="linkedin" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">LinkedIn</TabsTrigger>
                        <TabsTrigger value="twitter" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">Twitter</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Tabs value={filterSaved} onValueChange={setFilterSaved} className="w-full sm:w-auto">
                      <TabsList className="w-full sm:w-auto h-9">
                        <TabsTrigger value="all" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">All</TabsTrigger>
                        <TabsTrigger value="saved" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">Saved</TabsTrigger>
                        <TabsTrigger value="unsaved" className="text-xs sm:text-sm h-8 px-2.5 sm:px-3">Unsaved</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs sm:text-sm">
                        <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => handleExportPosts('csv')}
                      disabled={filteredPosts.length === 0}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto h-9 text-xs sm:text-sm"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="mb-4 sm:mb-6 bg-gradient-card">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Content Insights</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your content performance at a glance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">{stats.saved}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Saved Posts</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {Math.round((stats.saved / stats.total) * 100)}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Save Rate</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {Math.round((stats.linkedin / stats.total) * 100)}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">LinkedIn</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {Math.round((stats.twitter / stats.total) * 100)}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Twitter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="p-3 sm:p-4 bg-gradient-primary rounded-full inline-block mb-3 sm:mb-4">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">No posts yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
              Click the button above to generate your first AI-powered posts
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">No posts found</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSave={() => handleSave(post.id)}
                onDelete={() => handleDelete(post.id)}
                onEdit={(newContent) => handleEdit(post.id, newContent)}
                onCopy={() => handleCopy(post.content)}
                onGenerateImage={() => handleGenerateImage(post.id)}
                generatingImage={generatingImageForPost === post.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;