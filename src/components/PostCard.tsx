import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Trash2, Linkedin, Twitter, Edit2, Save, X, ImagePlus, CalendarClock, Download, Loader2, RefreshCw } from "lucide-react";
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
    <Card className="group bg-card border border-border/50 hover:border-primary/30 shadow-card hover-lift overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${post.platform === "linkedin" ? "bg-[#0077B5]/10" : "bg-[#1DA1F2]/10"}`}>
            {post.platform === "linkedin" ? (
              <Linkedin className="w-4 h-4 text-[#0077B5]" />
            ) : (
              <Twitter className="w-4 h-4 text-[#1DA1F2]" />
            )}
          </div>
          <div>
            <span className="font-medium capitalize">{post.platform}</span>
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        {post.scheduled_for && post.status === 'scheduled' && (
          <Badge variant="secondary" className="gap-1.5 text-xs bg-accent/10 text-accent border-accent/20">
            <CalendarClock className="w-3 h-3" />
            {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
          </Badge>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="text-sm bg-muted/30 border-border/50 focus:border-primary/50"
            />
            <div className="flex justify-between items-center text-xs">
              <span className={editedContent.length > maxChars ? 'text-destructive' : 'text-muted-foreground'}>
                {editedContent.length} / {maxChars}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} className="bg-gradient-primary hover:opacity-90">
                <Save className="w-4 h-4 mr-1.5" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="border-border/50">
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {post.image_url && (
              <div className="relative group/image rounded-xl overflow-hidden border border-border/30">
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full object-cover max-h-[280px]"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity h-8 gap-1.5 bg-background/80 backdrop-blur-sm"
                  onClick={handleDownloadImage}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            )}
            
            <div className="p-4 bg-muted/20 rounded-xl border border-border/30 min-h-[120px]">
              <div 
                className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90"
                dangerouslySetInnerHTML={renderFormattedText(post.content)}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className={charCount > maxChars ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {charCount} / {maxChars} characters
              </span>
              {post.is_saved && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Saved
                </Badge>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copying}
                className="h-9 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                <Copy className="w-4 h-4 mr-1.5" />
                {copying ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSave(post.id)}
                className={`h-9 text-xs border-border/50 ${
                  post.is_saved ? "bg-primary/10 border-primary/30 text-primary" : "hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-1.5 ${post.is_saved ? "fill-primary" : ""}`}
                />
                {post.is_saved ? "Saved" : "Save"}
              </Button>
              {isPremium && onSchedule && !post.scheduled_for && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSchedule(post.id)}
                  className="h-9 text-xs border-border/50 hover:border-accent/50 hover:bg-accent/5"
                >
                  <CalendarClock className="w-4 h-4 mr-1.5" />
                  Schedule
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenImagePrompt(post.id)}
                disabled={generatingImage}
                className="h-9 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                {generatingImage ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : post.image_url ? (
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                ) : (
                  <ImagePlus className="w-4 h-4 mr-1.5" />
                )}
                {generatingImage ? "Generating..." : post.image_url ? "Regenerate" : "Add Image"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                <Edit2 className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="h-9 text-xs border-border/50 hover:border-destructive/50 hover:bg-destructive/5 text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
