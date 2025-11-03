import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, ChevronRight, Crown, Plus, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  platform: string;
  content: string;
  created_at: string;
}

interface ContentCalendarProps {
  posts: Post[];
  isPremium: boolean;
}

export default function ContentCalendar({ posts, isPremium }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [platform, setPlatform] = useState<string>("linkedin");
  const [prompt, setPrompt] = useState<string>("");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isPremium) {
      toast.info("Upgrade to Premium to schedule posts");
      return;
    }
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleGeneratePost = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to generate posts");
        return;
      }

      // Check credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (!profile || profile.credits < 1) {
        toast.error("Not enough credits. Please top up to continue.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-posts", {
        body: {
          prompt,
          platform,
          count: 1,
          scheduledDate: selectedDate?.toISOString(),
        },
      });

      if (error) throw error;

      // Deduct credit
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", user.id);

      // Save post
      if (data?.posts?.[0]) {
        await supabase.from("posts").insert({
          user_id: user.id,
          platform,
          content: data.posts[0],
          created_at: selectedDate?.toISOString() || new Date().toISOString(),
        });
      }

      toast.success("Post scheduled successfully!");
      setDialogOpen(false);
      setPrompt("");
      window.location.reload(); // Refresh to show new post
    } catch (error: any) {
      console.error("Error generating post:", error);
      toast.error(error.message || "Failed to generate post");
    } finally {
      setGenerating(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 pb-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Content Calendar</h3>
          <p className="text-muted-foreground mb-4">
            Visualize and plan your content across the month
          </p>
          <Button onClick={() => toast.info("Upgrade to Premium to access the content calendar")}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Content Calendar
            <Badge variant="secondary">Premium</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">{monthName}</span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const postsOnDay = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(date)}
                className={`aspect-square border rounded-lg p-2 transition-all hover:border-primary hover:shadow-md cursor-pointer ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                } ${postsOnDay.length > 0 ? 'bg-accent/50' : ''}`}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                {postsOnDay.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {postsOnDay.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        className={`w-2 h-2 rounded-full ${
                          post.platform === 'linkedin' ? 'bg-blue-500' : 
                          post.platform === 'twitter' ? 'bg-sky-500' :
                          post.platform === 'instagram' ? 'bg-pink-500' : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                    {postsOnDay.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{postsOnDay.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Post for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription>
              Generate and schedule a post for this specific date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Show existing posts for this date */}
            {selectedDate && getPostsForDate(selectedDate).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Posts</h4>
                <div className="space-y-2">
                  {getPostsForDate(selectedDate).map(post => (
                    <Card key={post.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="capitalize">{post.platform}</Badge>
                        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">{post.content}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Generate new post */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Generate New Post</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What should this post be about?</label>
                <Textarea
                  placeholder="e.g., Share insights about AI trends, announce a product launch, motivational Monday post..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={handleGeneratePost} 
                disabled={generating || !prompt.trim()}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate & Schedule Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
