import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Heart, Trash2, Linkedin, Twitter, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { renderFormattedText } from "@/lib/markdown";

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
  onCopy: () => void;
}

const PostCard = ({ post, onSave, onDelete, onEdit, onCopy }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      onCopy();
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const charCount = post.content.length;
  const maxChars = post.platform.toLowerCase() === "twitter" ? 280 : 3000;

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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          {post.platform === "linkedin" ? (
            <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0077B5]" />
          ) : (
            <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" />
          )}
          <span className="capitalize">{post.platform} Post</span>
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
            <div className="grid grid-cols-2 sm:flex gap-2">
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
                onClick={onSave}
                className={`hover:border-primary text-xs h-8 ${
                  post.is_saved ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 ${post.is_saved ? "fill-primary text-primary" : ""}`}
                />
                <span className="hidden sm:inline">{post.is_saved ? "Saved" : "Save"}</span>
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
                onClick={onDelete}
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