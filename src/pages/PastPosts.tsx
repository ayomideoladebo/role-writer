import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ArrowUpDown, Download, FileText } from "lucide-react";
import PostCard from "@/components/PostCard";
import ImagePromptDialog from "@/components/ImagePromptDialog";
import { PostScheduleDialog } from "@/components/PostScheduleDialog";

interface Post {
  id: string;
  platform: string;
  content: string;
  is_saved: boolean;
  created_at: string;
  image_url?: string | null;
  scheduled_for?: string | null;
  status?: string;
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
  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [selectedPostForImage, setSelectedPostForImage] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedPostForSchedule, setSelectedPostForSchedule] = useState<Post | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "enterprise";

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

  const handleGenerateImage = async (postId: string, customPrompt?: string) => {
    if (!isPremium) {
      toast.error("Image generation is a premium feature");
      return;
    }

    try {
      if (!profile || profile.credits < 5) {
        toast.error("Insufficient credits. Upgrade your plan to continue.");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      setGeneratingImageForPost(postId);

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
          customPrompt: customPrompt || null,
          userInterests: profile?.interests || null,
        },
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from("posts")
        .update({ image_url: data.imageUrl })
        .eq("id", postId);

      if (updateError) throw updateError;

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

  const handleOpenImagePrompt = (postId: string) => {
    setSelectedPostForImage(postId);
    setImagePromptOpen(true);
  };

  const handleGenerateWithPrompt = async (prompt: string) => {
    if (selectedPostForImage) {
      setImagePromptOpen(false);
      await handleGenerateImage(selectedPostForImage, prompt);
      setSelectedPostForImage(null);
    }
  };

  const handleOpenScheduleDialog = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForSchedule(post);
      setScheduleDialogOpen(true);
    }
  };

  const handleSchedulePost = async (scheduledFor: Date) => {
    if (!selectedPostForSchedule) return;
    
    setScheduling(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ 
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled'
        })
        .eq("id", selectedPostForSchedule.id);

      if (error) throw error;

      onPostsUpdate();
      setScheduleDialogOpen(false);
      setSelectedPostForSchedule(null);
      toast.success("Post scheduled successfully!");
    } catch (error: any) {
      toast.error("Failed to schedule post");
    } finally {
      setScheduling(false);
    }
  };

  const handleExportPosts = (format: "csv" | "json") => {
    if (!isPremium) {
      toast.error("Export is a premium feature");
      return;
    }

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <FileText className="w-3 h-3 mr-1" />
              Content Library
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Past Posts</h1>
          <p className="text-muted-foreground mt-1">
            Browse, edit, and manage your generated content
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold gradient-text">{posts.length}</p>
          <p className="text-sm text-muted-foreground">Total Posts</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[140px] h-11 bg-muted/30 border-border/50">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={filterSaved} onValueChange={setFilterSaved}>
            <TabsList className="bg-muted/30 border border-border/30 h-11">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">All</TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Saved</TabsTrigger>
              <TabsTrigger value="unsaved" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Unsaved</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="h-11 w-11 border-border/50 hover:border-primary/50"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleExportPosts("json")}
            className="h-11 w-11 border-border/50 hover:border-primary/50"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-muted/30 mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No posts found</h3>
          <p className="text-muted-foreground">
            {posts.length === 0 
              ? "Generate your first post to get started!" 
              : "Try adjusting your filters or search query"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPosts.map((post, index) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <PostCard
                post={post}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onGenerateImage={handleGenerateImage}
                onOpenImagePrompt={handleOpenImagePrompt}
                onSchedule={handleOpenScheduleDialog}
                generatingImage={generatingImageForPost === post.id}
                isPremium={isPremium}
              />
            </div>
          ))}
        </div>
      )}

      <ImagePromptDialog
        open={imagePromptOpen}
        onOpenChange={setImagePromptOpen}
        onGenerate={handleGenerateWithPrompt}
        generating={generatingImageForPost !== null}
        postContent={selectedPostForImage ? posts.find(p => p.id === selectedPostForImage)?.content : undefined}
        platform={selectedPostForImage ? posts.find(p => p.id === selectedPostForImage)?.platform : undefined}
      />

      {selectedPostForSchedule && (
        <PostScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          postContent={selectedPostForSchedule.content}
          platform={selectedPostForSchedule.platform}
          onSchedule={handleSchedulePost}
          isLoading={scheduling}
        />
      )}
    </div>
  );
}
