import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, LogOut, RefreshCw } from "lucide-react";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  platform: string;
  content: string;
  is_saved: boolean;
  created_at: string;
}

interface Profile {
  role: string;
  industry: string;
  tone_preference: string;
  onboarding_completed: boolean;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: { profile },
      });

      if (error) throw error;

      toast.success("New posts generated!");
      
      // Refresh posts
      const { data: { user } } = await supabase.auth.getUser();
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

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

  const handleRegenerate = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: { profile, regenerate: true, platform: post?.platform },
      });

      if (error) throw error;

      // Refresh posts
      const { data: { user } } = await supabase.auth.getUser();
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
      toast.success("Post regenerated!");
    } catch (error: any) {
      toast.error("Failed to regenerate post");
    }
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Content Writer
              </h1>
              {profile && (
                <p className="text-sm text-muted-foreground">
                  {profile.role} · {profile.industry}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Content Dashboard</h2>
            <p className="text-muted-foreground">
              AI-generated posts tailored to your preferences
            </p>
          </div>
          <Button
            onClick={generatePosts}
            disabled={generating}
            className="bg-gradient-primary hover:opacity-90"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Posts
              </>
            )}
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-primary rounded-full inline-block mb-4">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Click the button above to generate your first AI-powered posts
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSave={() => handleSave(post.id)}
                onRegenerate={() => handleRegenerate(post.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;