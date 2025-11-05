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
import { Sparkles, RefreshCw, Lightbulb, Zap, Crown } from "lucide-react";
import PremiumBanner from "@/components/PremiumBanner";

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
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [idea, setIdea] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "twitter"]);
  const [batchSize, setBatchSize] = useState(3);
  const location = useLocation();

  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "enterprise";
  const isEnterprise = profile?.subscription_tier === "enterprise";

  useEffect(() => {
    // Check if we received topic and idea from navigation state
    if (location.state) {
      const { topic: navTopic, idea: navIdea } = location.state as { topic?: string; idea?: string };
      if (navTopic) setTopic(navTopic);
      if (navIdea) setIdea(navIdea);
    }
  }, [location.state]);

  useEffect(() => {
    // Ensure model selection is appropriate for subscription tier
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
      // Generate batches
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
      toast.success(`Batch generation complete! ${batchSize * 2} new posts created. ${creditsUsed} credits deducted.`);

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

      {profile && profile.credits < 50 && (
        <PremiumBanner type="low-credits" credits={profile.credits} dismissible />
      )}

      {!isPremium && (
        <PremiumBanner type="feature-locked" featureName="Advanced AI Models & Batch Generation" dismissible />
      )}

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
          {isPremium && (
            <div className="space-y-2">
              <Label htmlFor="model">AI Model {isEnterprise && <Badge variant="secondary" className="ml-2">Enterprise Exclusive</Badge>}</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={generating}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Premium)</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini (Fast)</SelectItem>
                  {isEnterprise && <SelectItem value="openai/gpt-5">GPT-5 Full (Enterprise Only)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          {isPremium && (
            <div className="space-y-2">
              <Label>Target Platforms <Badge variant="secondary" className="ml-2">Premium</Badge></Label>
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
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
          {isPremium && (
            <>
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size <Badge variant="secondary" className="ml-2">{isEnterprise ? "Up to 20" : "Up to 5"}</Badge></Label>
                <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(Number(v))} disabled={generating}>
                  <SelectTrigger id="batch-size">
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
                className="w-full"
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
            </>
          )}
          {!isPremium && (
            <Button
              onClick={() => toast.info("Upgrade to Premium for batch generation")}
              variant="outline"
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Unlock Batch Generation (Premium)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
