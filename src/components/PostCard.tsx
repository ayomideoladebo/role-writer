import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart, RefreshCw, Linkedin, Twitter } from "lucide-react";
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
  onRegenerate: () => void;
}

const PostCard = ({ post, onSave, onRegenerate }: PostCardProps) => {
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
        <div className="p-4 bg-background/50 rounded-lg border min-h-[150px]">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
        </div>
        <div className="flex gap-2">
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
            onClick={onRegenerate}
            className="flex-1 hover:border-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;