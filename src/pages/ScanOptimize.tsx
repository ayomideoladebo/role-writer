import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Search, 
  Linkedin, 
  Twitter, 
  RefreshCw, 
  Sparkles, 
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Copy,
  ArrowRight
} from "lucide-react";

interface ScoreCategory {
  name: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}

interface AnalysisResult {
  categories: ScoreCategory[];
  overallScore: number;
  tips: string[];
  strengths: string[];
  improvements: string[];
}

interface PostIdea {
  title: string;
  content: string;
  targetArea: string;
  platform: string;
}

export default function ScanOptimize() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState("");
  const [stats, setStats] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);

  const handleAnalyze = async () => {
    if (!bio.trim() && !posts.trim()) {
      toast.error("Please provide at least your bio or some recent posts");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to use this feature");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("scan-optimize-profile", {
        body: {
          platform,
          bio: bio.trim(),
          posts: posts.trim(),
          stats: stats.trim(),
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests. Please try again in a moment.");
        } else if (data.error.includes("Payment required")) {
          toast.error("AI usage limit reached. Please try again later.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setResult(data);
      toast.success("Profile analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze profile");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (index: number) => {
    const icons = [
      <Target className="w-5 h-5" />,
      <TrendingUp className="w-5 h-5" />,
      <Calendar className="w-5 h-5" />,
      <MessageSquare className="w-5 h-5" />
    ];
    return icons[index] || <Sparkles className="w-5 h-5" />;
  };

  const handleGeneratePostIdeas = async () => {
    if (!result) return;

    setGeneratingIdeas(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to use this feature");
        return;
      }

      // Find weakest categories (score < 70)
      const weakAreas = result.categories
        .filter(c => c.score < 70)
        .map(c => c.name);

      const { data, error } = await supabase.functions.invoke("generate-improvement-posts", {
        body: {
          platform,
          weakAreas,
          improvements: result.improvements,
          tips: result.tips,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setPostIdeas(data.postIdeas || []);
      toast.success("Post ideas generated!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate post ideas");
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const useAsPost = (content: string) => {
    navigate("/dashboard/generate", { state: { topic: content.substring(0, 100), idea: content } });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0c1a]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="p-2 bg-primary rounded-xl">
                  <Search className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Scan & Optimize</h1>
                  <p className="text-xs text-muted-foreground">
                    Analyze your social profile and get optimization tips
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {!result ? (
                <>
                  {/* Platform Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Platform</CardTitle>
                      <CardDescription>
                        Choose the platform you want to analyze
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <Button
                          variant={platform === "linkedin" ? "default" : "outline"}
                          onClick={() => setPlatform("linkedin")}
                          className="flex-1 h-20"
                        >
                          <Linkedin className="w-6 h-6 mr-3" />
                          LinkedIn
                        </Button>
                        <Button
                          variant={platform === "twitter" ? "default" : "outline"}
                          onClick={() => setPlatform("twitter")}
                          className="flex-1 h-20"
                        >
                          <Twitter className="w-6 h-6 mr-3" />
                          Twitter / X
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Input Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Paste Your Profile Content
                      </CardTitle>
                      <CardDescription>
                        Copy and paste your profile information for AI analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="bio">
                          Bio / About Section *
                          <Badge variant="secondary" className="ml-2">Required</Badge>
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder={platform === "linkedin" 
                            ? "Paste your LinkedIn headline and About section here..."
                            : "Paste your Twitter bio here..."
                          }
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="posts">
                          Recent Posts (5-10 posts)
                          <Badge variant="outline" className="ml-2">Recommended</Badge>
                        </Label>
                        <Textarea
                          id="posts"
                          placeholder="Paste your recent posts here, one after another. Include the post text and any engagement numbers if available..."
                          value={posts}
                          onChange={(e) => setPosts(e.target.value)}
                          rows={8}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tip: Include post content, likes, comments, and shares if available
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stats">
                          Profile Stats
                          <Badge variant="outline" className="ml-2">Optional</Badge>
                        </Label>
                        <Textarea
                          id="stats"
                          placeholder={platform === "linkedin"
                            ? "e.g., 5,000 followers, 500+ connections, 50 posts this month..."
                            : "e.g., 10K followers, 500 following, joined 2020, average 50 likes per post..."
                          }
                          value={stats}
                          onChange={(e) => setStats(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing || (!bio.trim() && !posts.trim())}
                        className="w-full h-12"
                        size="lg"
                      >
                        {analyzing ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing Your Profile...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5 mr-2" />
                            Analyze & Get Optimization Tips
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Results Section */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Your Profile Analysis</h2>
                    <p className="text-muted-foreground">
                      Based on your {platform === "linkedin" ? "LinkedIn" : "Twitter"} profile content
                    </p>
                  </div>

                  {/* Overall Score */}
                  <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/50 bg-background mb-4">
                        <span className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Overall Score</h3>
                      <p className="text-muted-foreground">
                        {result.overallScore >= 80 && "Excellent! Your profile is well-optimized."}
                        {result.overallScore >= 60 && result.overallScore < 80 && "Good progress! Some areas need improvement."}
                        {result.overallScore >= 40 && result.overallScore < 60 && "Room for growth. Follow the tips below."}
                        {result.overallScore < 40 && "Needs work. Let's optimize your profile!"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Category Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.categories.map((category, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {getCategoryIcon(index)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{category.name}</h4>
                                <p className="text-xs text-muted-foreground">{category.description}</p>
                              </div>
                            </div>
                            <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                              {category.score}
                            </span>
                          </div>
                          <Progress 
                            value={category.score} 
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Tabs for Tips */}
                  <Tabs defaultValue="tips" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tips">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Tips
                      </TabsTrigger>
                      <TabsTrigger value="strengths">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Strengths
                      </TabsTrigger>
                      <TabsTrigger value="improvements">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        To Improve
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="tips">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Optimization Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {result.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-semibold">
                                  {index + 1}
                                </span>
                                <span className="text-sm">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="strengths">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Your Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {result.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="improvements">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Areas to Improve
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {result.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Generate Post Ideas Section */}
                  <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-primary" />
                        Generate Improvement Posts
                      </CardTitle>
                      <CardDescription>
                        Get AI-generated post ideas specifically designed to improve your weak areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleGeneratePostIdeas}
                        disabled={generatingIdeas}
                        className="w-full"
                        size="lg"
                      >
                        {generatingIdeas ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Generating Post Ideas...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate 5 Post Ideas for My Weak Areas
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Display Generated Post Ideas */}
                  {postIdeas.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Your Improvement Post Ideas
                        </CardTitle>
                        <CardDescription>
                          Posts designed to address your weak areas and boost your profile
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-4">
                            {postIdeas.map((idea, index) => (
                              <Card key={index} className="bg-muted/30 hover:bg-muted/50 transition-colors">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="capitalize">
                                        {idea.platform}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        Targets: {idea.targetArea}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      Idea #{index + 1}
                                    </span>
                                  </div>
                                  
                                  <h4 className="font-semibold mb-2 text-sm">{idea.title}</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                                    {idea.content}
                                  </p>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(idea.content)}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => useAsPost(idea.content)}
                                    >
                                      <ArrowRight className="w-3 h-3 mr-1" />
                                      Use in Generator
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analyze Again */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResult(null);
                        setPostIdeas([]);
                        setBio("");
                        setPosts("");
                        setStats("");
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Analyze Another Profile
                    </Button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}