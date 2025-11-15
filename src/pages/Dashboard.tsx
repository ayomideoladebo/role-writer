import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LogOut, Settings, RefreshCw, Upload, User, Zap, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
const Inspiration = lazy(() => import("./Inspiration"));
const GeneratePost = lazy(() => import("./GeneratePost"));
const ContentInsights = lazy(() => import("./ContentInsights"));
const PastPosts = lazy(() => import("./PastPosts"));

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
  monthly_post_limit: number;
  brand_voice?: string | null;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
  const navigate = useNavigate();
  const location = useLocation();

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
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      toast.error("Failed to load profile");
      setLoading(false);
      return;
    }

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

    // Start fetching posts in the background and render immediately
    fetchPosts();
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: postsData } = await supabase
      .from("posts")
      .select("id, platform, content, is_saved, created_at, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setUploadingAvatar(true);
      const fileExt = file.name.split(".").pop();
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setProfileForm({ ...profileForm, avatar_url: publicUrl });
      setProfile({ ...profile!, avatar_url: publicUrl });
      toast.success("Profile picture updated");
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

  const handleCreditsUpdate = (newCredits: number) => {
    if (profile) {
      setProfile({ ...profile, credits: newCredits });
    }
  };

  // Render child route component based on current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path.includes("/inspiration")) {
      return <Inspiration profile={profile} />;
    } else if (path.includes("/generate")) {
      return <GeneratePost profile={profile} onPostsGenerated={fetchPosts} onCreditsUpdate={handleCreditsUpdate} />;
    } else if (path.includes("/insights")) {
      return <ContentInsights posts={posts} profile={profile} onProfileUpdate={checkAuth} />;
    } else if (path.includes("/posts")) {
      return <PastPosts posts={posts} profile={profile} onPostsUpdate={fetchPosts} onCreditsUpdate={handleCreditsUpdate} />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0c1a]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="p-2 bg-primary rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                      LinkTweet
                    </h1>
                    {profile && (
                      <p className="text-xs text-muted-foreground">
                        {profile.role} · {profile.industry}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{profile?.credits || 0}</span>
                  </div>
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="hidden sm:flex" onClick={() => navigate("/dashboard/settings")}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" onClick={handleLogout} size="sm" className="hidden sm:flex">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                  <Button variant="outline" onClick={handleLogout} size="icon" className="sm:hidden">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={<div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}>
                {renderContent()}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
