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
import { Sparkles } from "lucide-react";

interface ImagePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => void;
  generating: boolean;
}

export default function ImagePromptDialog({
  open,
  onOpenChange,
  onGenerate,
  generating,
}: ImagePromptDialogProps) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
      setPrompt("");
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
            <Label htmlFor="image-prompt">Image Description</Label>
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
