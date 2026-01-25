import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Lightbulb, Zap, Wand2 } from "lucide-react";

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

interface GeneratePostProps {
  profile: Profile | null;
  onPostsGenerated: () => void;
  onCreditsUpdate: (credits: number) => void;
}

export default function GeneratePost({ profile, onPostsGenerated, onCreditsUpdate }: GeneratePostProps) {
  const location = useLocation();
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [idea, setIdea] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "twitter"]);
  const [batchSize, setBatchSize] = useState(3);

  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "enterprise";
  const isEnterprise = profile?.subscription_tier === "enterprise";

  useEffect(() => {
    if (location.state) {
      const { topic: navTopic, idea: navIdea } = location.state as { topic?: string; idea?: string };
      if (navTopic) setTopic(navTopic);
      if (navIdea) setIdea(navIdea);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedModel === "openai/gpt-5" && !isEnterprise) {
      setSelectedModel("google/gemini-2.5-flash");
    }
  }, [selectedModel, isEnterprise]);

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
          model: selectedModel,
          platforms: selectedPlatforms,
        },
      });

      if (error) throw error;

      toast.success("New posts generated! 20 credits deducted.");
      setTopic("");
      setIdea("");

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
      toast.error(error.message || "Failed to generate posts");
    } finally {
      setGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!isPremium) {
      toast.error("Batch generation is a premium feature");
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a topic for batch generation");
      return;
    }

    setGenerating(true);
    try {
      for (let i = 0; i < batchSize; i++) {
        const { error } = await supabase.functions.invoke("generate-posts", {
          body: {
            profile,
            topic: topic.trim(),
            idea: idea.trim() || undefined,
            model: selectedModel,
            platforms: selectedPlatforms,
          },
        });
        if (error) throw error;
      }

      const creditsUsed = batchSize * 20;
      toast.success(`Batch complete! ${batchSize * 2} posts created. ${creditsUsed} credits deducted.`);

      setTopic("");
      setIdea("");

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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Wand2 className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">Generate Post</h1>
        <p className="text-muted-foreground mt-1">
          Create engaging content tailored to your audience
        </p>
      </div>

      <Card className="bg-card border border-border/50 shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
              <Lightbulb className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">What do you want to write about?</CardTitle>
              <CardDescription className="mt-1">
                Enter your topic and any specific ideas or direction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isPremium && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="model" className="text-sm font-medium">
                  AI Model
                  {isEnterprise && (
                    <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent border-accent/20 text-xs">
                      Enterprise
                    </Badge>
                  )}
                </Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={generating}>
                  <SelectTrigger id="model" className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</SelectItem>
                    <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Premium)</SelectItem>
                    <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (Fast)</SelectItem>
                    {isEnterprise && <SelectItem value="openai/gpt-5">GPT-5 Full (Enterprise)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Target Platforms
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">Premium</Badge>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["linkedin", "twitter"].map((platform) => (
                    <Button
                      key={platform}
                      type="button"
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedPlatforms.includes(platform)) {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, platform]);
                        }
                      }}
                      disabled={generating}
                      className={selectedPlatforms.includes(platform) 
                        ? "bg-gradient-primary hover:opacity-90" 
                        : "border-border/50 hover:border-primary/50"
                      }
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="topic" className="text-sm font-medium">
              Topic <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g., AI in healthcare, Remote work productivity, Leadership tips..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
              className="bg-muted/30 border-border/50 focus:border-primary/50 h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="idea" className="text-sm font-medium">
              Your Ideas <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="idea"
              placeholder="e.g., Share 3 key benefits, Include a personal experience, Add a call-to-action..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={generating}
              rows={4}
              className="bg-muted/30 border-border/50 focus:border-primary/50 resize-none"
            />
          </div>

          <Button
            onClick={generatePosts}
            disabled={generating || !topic.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 h-14 text-base font-semibold shadow-glow"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating posts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Posts (20 credits)
              </>
            )}
          </Button>

          {isPremium && (
            <div className="pt-4 border-t border-border/30 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="batch-size" className="text-sm font-medium">
                  Batch Generation
                  <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent border-accent/20 text-xs">
                    {isEnterprise ? "Up to 20" : "Up to 5"}
                  </Badge>
                </Label>
                <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(Number(v))} disabled={generating}>
                  <SelectTrigger id="batch-size" className="w-[180px] bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 batches (6 posts)</SelectItem>
                    <SelectItem value="5">5 batches (10 posts)</SelectItem>
                    {isEnterprise && <SelectItem value="10">10 batches (20 posts)</SelectItem>}
                    {isEnterprise && <SelectItem value="20">20 batches (40 posts)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleBatchGenerate}
                disabled={generating || !topic.trim()}
                variant="outline"
                className="w-full h-12 border-border/50 hover:border-accent/50 hover:bg-accent/5"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating batch...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Batch Generate {batchSize * 2} Posts ({batchSize * 20} credits)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
