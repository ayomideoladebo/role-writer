import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block p-4 bg-gradient-primary rounded-3xl mb-4 animate-pulse">
            <Sparkles className="w-16 h-16 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI Content Writer
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate professional LinkedIn and Twitter posts in seconds with AI-powered content tailored to your role and industry
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
            >
              Get Started Free
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-card rounded-2xl shadow-card border-2 hover:shadow-hover transition-all">
              <div className="p-3 bg-gradient-primary rounded-xl w-fit mb-4">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced AI generates engaging content that matches your tone and industry
              </p>
            </div>

            <div className="p-6 bg-card rounded-2xl shadow-card border-2 hover:shadow-hover transition-all">
              <div className="p-3 bg-gradient-primary rounded-xl w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
              <p className="text-muted-foreground">
                Get optimized versions for LinkedIn and Twitter with one click
              </p>
            </div>

            <div className="p-6 bg-card rounded-2xl shadow-card border-2 hover:shadow-hover transition-all">
              <div className="p-3 bg-gradient-primary rounded-xl w-fit mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-muted-foreground">
                Generate, save, and manage all your content in one dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
