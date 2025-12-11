import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImagePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => void;
  generating: boolean;
  postContent?: string;
  platform?: string;
}

export default function ImagePromptDialog({
  open,
  onOpenChange,
  onGenerate,
  generating,
  postContent,
  platform,
}: ImagePromptDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
      setPrompt("");
    }
  };

  const handleSuggest = async () => {
    if (!postContent) {
      toast.error("No post content available to generate suggestion");
      return;
    }

    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-image-prompt', {
        body: { postContent, platform }
      });

      if (error) throw error;
      
      if (data?.suggestion) {
        setPrompt(data.suggestion);
        toast.success("Image description suggested!");
      }
    } catch (error) {
      console.error('Error suggesting image prompt:', error);
      toast.error("Failed to suggest image description");
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Post Image
          </DialogTitle>
          <DialogDescription>
            Describe the image you want for this post. Be specific about style, colors, or elements you'd like to include.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-prompt">Image Description</Label>
              {postContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggest}
                  disabled={suggesting || generating}
                  className="h-7 text-xs gap-1.5"
                >
                  {suggesting ? (
                    <>
                      <Wand2 className="w-3.5 h-3.5 animate-pulse" />
                      Suggesting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Suggest
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="image-prompt"
              placeholder="e.g., A professional workspace with a laptop, modern and minimalist style, warm lighting..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include details about style, mood, colors, and composition for best results
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setPrompt("");
              }}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
            >
              {generating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
