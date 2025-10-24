import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, ArrowUpDown, Download } from "lucide-react";
import PostCard from "@/components/PostCard";

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

interface PastPostsProps {
  posts: Post[];
  profile: Profile | null;
  onPostsUpdate: () => void;
  onCreditsUpdate: (credits: number) => void;
}

export default function PastPosts({ posts, profile, onPostsUpdate, onCreditsUpdate }: PastPostsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterSaved, setFilterSaved] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [generatingImageForPost, setGeneratingImageForPost] = useState<string | null>(null);

  const handleSave = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const { error } = await supabase
        .from("posts")
        .update({ is_saved: !post?.is_saved })
        .eq("id", postId);

      if (error) throw error;

      onPostsUpdate();
      toast.success(post?.is_saved ? "Removed from saved" : "Saved to vault");
    } catch (error: any) {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      onPostsUpdate();
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

      onPostsUpdate();
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

  const handleGenerateImage = async (postId: string) => {
    try {
      if (!profile || profile.credits < 5) {
        toast.error("Insufficient credits. You need 5 credits to generate an image. Please top up!");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      setGeneratingImageForPost(postId);

      // Determine post type from content
      let postType = "story";
      const contentLower = post.content.toLowerCase();
      if (
        contentLower.includes("tip") ||
        contentLower.includes("tips") ||
        contentLower.includes("how to") ||
        contentLower.includes("guide")
      ) {
        postType = "tips";
      }

      const { data, error } = await supabase.functions.invoke("generate-post-image", {
        body: {
          postContent: post.content,
          postType: postType,
          avatarUrl: profile?.avatar_url || null,
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

      onCreditsUpdate(newCredits);
      onPostsUpdate();
      toast.success("Image generated successfully! 5 credits deducted.");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGeneratingImageForPost(null);
    }
  };

  const handleExportPosts = (format: "csv" | "json") => {
    if (filteredPosts.length === 0) {
      toast.error("No posts to export");
      return;
    }

    if (format === "json") {
      const dataStr = JSON.stringify(filteredPosts, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `posts-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Posts exported as JSON");
    } else {
      const headers = ["Platform", "Content", "Saved", "Created At"];
      const csvContent = [
        headers.join(","),
        ...filteredPosts.map((post) =>
          [
            post.platform,
            `"${post.content.replace(/"/g, '""')}"`,
            post.is_saved ? "Yes" : "No",
            new Date(post.created_at).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `posts-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Posts exported as CSV");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Past Posts</h1>
        <p className="text-muted-foreground">Browse, edit, and manage your generated posts</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
        <Tabs value={filterSaved} onValueChange={setFilterSaved} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="unsaved">Unsaved</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
          <ArrowUpDown className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleExportPosts("json")}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found. Generate your first post to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSave={handleSave}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onGenerateImage={handleGenerateImage}
              generatingImage={generatingImageForPost === post.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
