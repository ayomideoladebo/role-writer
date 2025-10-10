import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Heart, Trash2, Linkedin, Twitter, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface PostCardProps {
  post: {
    id: string;
    platform: string;
    content: string;
    is_saved: boolean;
    created_at: string;
  };
  onSave: () => void;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
}

const PostCard = ({ post, onSave, onDelete, onEdit }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(post.content);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy");
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== post.content) {
      onEdit(editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setIsEditing(false);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-2 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {post.platform === "linkedin" ? (
            <Linkedin className="w-5 h-5 text-[#0077B5]" />
          ) : (
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
          )}
          <span className="capitalize">{post.platform} Post</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-background/50 rounded-lg border min-h-[150px]">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copying}
                className="flex-1 hover:border-primary"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copying ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className={`flex-1 hover:border-primary ${
                  post.is_saved ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${post.is_saved ? "fill-primary text-primary" : ""}`}
                />
                {post.is_saved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex-1 hover:border-primary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex-1 hover:border-destructive text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
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