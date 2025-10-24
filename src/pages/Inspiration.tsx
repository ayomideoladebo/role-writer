import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface InspirationProps {
  profile: Profile | null;
}

export default function Inspiration({ profile }: InspirationProps) {
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [suggestedIdeas, setSuggestedIdeas] = useState<Array<{ topic: string; ideas: string }>>([]);
  const [ideaMode, setIdeaMode] = useState<string>("normal");
  const navigate = useNavigate();

  const generateIdeasHandler = async () => {
    setGeneratingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: { profile, mode: ideaMode },
      });

      if (error) throw error;

      setSuggestedIdeas(data.ideas);
      toast.success("Ideas generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate ideas");
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const selectIdea = (selectedIdea: { topic: string; ideas: string }) => {
    // Navigate to generate page with the selected idea
    navigate("/dashboard/generate", { 
      state: { 
        topic: selectedIdea.topic, 
        idea: selectedIdea.ideas 
      } 
    });
    toast.success("Idea selected! Ready to generate posts.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find Inspiration</h1>
        <p className="text-muted-foreground">
          Get AI-powered topic ideas tailored to your profile
        </p>
      </div>

      <Card className="shadow-card border-2 bg-gradient-card">
        <CardHeader>
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Content Ideas Generator</CardTitle>
                <CardDescription>
                  Choose a mode and generate fresh content ideas
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-shrink-0">
              <Select value={ideaMode} onValueChange={setIdeaMode}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Mode</SelectItem>
                  <SelectItem value="story">Story Mode</SelectItem>
                  <SelectItem value="tips">Tips Mode</SelectItem>
                  <SelectItem value="fun">Fun Mode</SelectItem>
                  <SelectItem value="question">Question Mode</SelectItem>
                  <SelectItem value="list">List Mode</SelectItem>
                  <SelectItem value="howto">How-to Mode</SelectItem>
                  <SelectItem value="mythbust">Myth-busting Mode</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={generateIdeasHandler}
                disabled={generatingIdeas}
                className="bg-gradient-primary hover:opacity-90"
              >
                {generatingIdeas ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {suggestedIdeas.length > 0 && (
          <CardContent>
            <div className="grid gap-3">
              {suggestedIdeas.map((suggestedIdea, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                  onClick={() => selectIdea(suggestedIdea)}
                >
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      {suggestedIdea.topic}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestedIdea.ideas}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
