import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Lightbulb, Zap } from "lucide-react";

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

interface GeneratePostProps {
  profile: Profile | null;
  onPostsGenerated: () => void;
  onCreditsUpdate: (credits: number) => void;
}

export default function GeneratePost({ profile, onPostsGenerated, onCreditsUpdate }: GeneratePostProps) {
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [idea, setIdea] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Check if we received topic and idea from navigation state
    if (location.state) {
      const { topic: navTopic, idea: navIdea } = location.state as { topic?: string; idea?: string };
      if (navTopic) setTopic(navTopic);
      if (navIdea) setIdea(navIdea);
    }
  }, [location.state]);

  const generatePosts = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: {
          profile,
          topic: topic.trim(),
          idea: idea.trim() || undefined,
        },
      });

      if (error) throw error;

      toast.success("New posts generated! 20 credits deducted.");

      // Clear inputs
      setTopic("");
      setIdea("");

      // Fetch updated credits
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user!.id)
        .single();

      if (profileData) {
        onCreditsUpdate(profileData.credits);
      }

      // Notify parent to refresh posts
      onPostsGenerated();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate posts");
    } finally {
      setGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for batch generation");
      return;
    }

    setGenerating(true);
    try {
      // Generate 3 batches
      for (let i = 0; i < 3; i++) {
        const { error } = await supabase.functions.invoke("generate-posts", {
          body: {
            profile,
            topic: topic.trim(),
            idea: idea.trim() || undefined,
          },
        });
        if (error) throw error;
      }

      toast.success("Batch generation complete! 6 new posts created. 60 credits deducted.");

      setTopic("");
      setIdea("");

      // Fetch updated credits
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user!.id)
        .single();

      if (profileData) {
        onCreditsUpdate(profileData.credits);
      }

      onPostsGenerated();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate batch posts");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate Post</h1>
        <p className="text-muted-foreground">
          Tell us your topic and ideas to generate tailored content
        </p>
      </div>

      <Card className="shadow-card border-2 bg-gradient-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>What do you want to write about?</CardTitle>
              <CardDescription>
                Enter your topic and any specific ideas or direction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., AI in healthcare, Remote work productivity"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea">Your Ideas (optional)</Label>
            <Textarea
              id="idea"
              placeholder="e.g., Share 3 key benefits, Include a personal experience..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={generating}
              rows={3}
            />
          </div>
          <Button
            onClick={generatePosts}
            disabled={generating || !topic.trim()}
            className="w-full bg-primary hover:opacity-90"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating posts...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Posts (20 credits)
              </>
            )}
          </Button>
          <Button
            onClick={handleBatchGenerate}
            disabled={generating || !topic.trim()}
            variant="outline"
            className="w-full"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Batch...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Batch Generate 6 Posts (60 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
