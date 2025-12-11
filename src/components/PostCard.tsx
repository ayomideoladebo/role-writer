import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Trash2, Linkedin, Twitter, Edit2, Save, X, ImagePlus, CalendarClock, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { renderFormattedText } from "@/lib/markdown";
import { format } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    platform: string;
    content: string;
    is_saved: boolean;
    created_at: string;
    image_url?: string | null;
    scheduled_for?: string | null;
    status?: string;
  };
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, newContent: string) => void;
  onCopy: (content: string) => void;
  onGenerateImage: (postId: string) => void;
  onOpenImagePrompt: (postId: string) => void;
  onSchedule?: (postId: string) => void;
  generatingImage?: boolean;
  isPremium?: boolean;
}

const PostCard = ({ post, onSave, onDelete, onEdit, onCopy, onGenerateImage, onOpenImagePrompt, onSchedule, generatingImage, isPremium }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      onCopy(post.content);
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const handleDownloadImage = async () => {
    if (!post.image_url) return;
    
    try {
      const response = await fetch(post.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `post-image-${post.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const charCount = post.content.length;
  const maxChars = post.platform.toLowerCase() === "twitter" ? 280 : 3000;

  const handleSaveEdit = () => {
    if (editedContent.trim() !== post.content) {
      onEdit(post.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setIsEditing(false);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-2 bg-gradient-card">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            {post.platform === "linkedin" ? (
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0077B5]" />
            ) : (
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" />
            )}
            <span className="capitalize">{post.platform} Post</span>
          </div>
          {post.scheduled_for && post.status === 'scheduled' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <CalendarClock className="w-3 h-3" />
              {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="text-xs sm:text-sm"
            />
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className={editedContent.length > maxChars ? 'text-destructive' : 'text-muted-foreground'}>
                {editedContent.length} / {maxChars} characters
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} className="text-xs h-8">
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-xs h-8">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {post.image_url && (
              <div className="mb-3 sm:mb-4 relative group">
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full rounded-lg border object-cover max-h-[300px]"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 gap-1.5"
                  onClick={handleDownloadImage}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            )}
            <div className="p-3 sm:p-4 bg-background/50 rounded-lg border min-h-[120px] sm:min-h-[150px]">
              <div 
                className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={renderFormattedText(post.content)}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className={charCount > maxChars ? 'text-destructive' : 'text-muted-foreground'}>
                {charCount} / {maxChars} characters
              </span>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copying}
                className="hover:border-primary text-xs h-8"
              >
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{copying ? "Copied!" : "Copy"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSave(post.id)}
                className={`hover:border-primary text-xs h-8 ${
                  post.is_saved ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 ${post.is_saved ? "fill-primary text-primary" : ""}`}
                />
                <span className="hidden sm:inline">{post.is_saved ? "Saved" : "Save"}</span>
              </Button>
              {isPremium && onSchedule && !post.scheduled_for && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSchedule(post.id)}
                  className="hover:border-primary text-xs h-8"
                >
                  <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenImagePrompt(post.id)}
                disabled={generatingImage || !!post.image_url}
                className="hover:border-primary text-xs h-8"
              >
                {generatingImage ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {generatingImage ? "Generating..." : post.image_url ? "Has Image" : "Add Image"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="hover:border-primary text-xs h-8"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="hover:border-destructive text-destructive text-xs h-8"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;