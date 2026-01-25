import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp, ArrowRight, CheckCircle2, Rocket, Users, BarChart3, Play, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold gradient-text">
              LinkTweet
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-glow" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary animate-fade-in backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Content Generation
              <span className="px-2 py-0.5 bg-primary/20 rounded-full text-xs">New</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Create Engaging
              <span className="block mt-3 gradient-text-vibrant">
                Social Content
              </span>
              <span className="block mt-3 text-foreground/90">In Seconds</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Generate professional LinkedIn and Twitter posts tailored to your role and industry. 
              Save hours every week with AI-powered content creation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow group font-semibold"
              >
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>2 minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, label: "Active Users", value: "1K+", color: "from-primary to-accent" },
              { icon: Sparkles, label: "Posts Generated", value: "50K+", color: "from-accent to-primary" },
              { icon: TrendingUp, label: "Engagement Rate", value: "92%", color: "from-primary to-accent" },
              { icon: BarChart3, label: "Time Saved", value: "100hrs+", color: "from-accent to-primary" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full text-sm font-medium text-accent">
                <Zap className="w-4 h-4" />
                Powerful Features
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                Everything You Need
                <span className="block mt-2 gradient-text">
                  To Grow Your Presence
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you create, manage, and optimize your social media content
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "AI-Powered Generation",
                  description: "Advanced AI creates engaging content that matches your unique tone and style",
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  icon: TrendingUp,
                  title: "Multi-Platform Support",
                  description: "Perfectly optimized for LinkedIn and Twitter with platform-specific formatting",
                  gradient: "from-primary to-accent",
                },
                {
                  icon: Rocket,
                  title: "Batch Generation",
                  description: "Generate multiple posts at once and schedule them for consistent delivery",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: Sparkles,
                  title: "Smart Inspiration",
                  description: "Find trending topics and generate fresh ideas based on your industry",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: BarChart3,
                  title: "Content Analytics",
                  description: "Track your posts, view insights, and understand what content works best",
                  gradient: "from-primary to-accent",
                },
                {
                  icon: Users,
                  title: "Profile Customization",
                  description: "Tailor content to your audience with detailed profile settings",
                  gradient: "from-rose-500 to-red-500",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/30 shadow-card hover-lift animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Social Proof Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <blockquote className="text-2xl sm:text-3xl font-medium text-foreground/90 mb-6">
              "LinkTweet has completely transformed how I create content. What used to take hours now takes minutes."
            </blockquote>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Sarah Chen</span> · Marketing Director at TechCorp
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl animated-gradient p-[2px]">
              <div className="bg-card rounded-[calc(1.5rem-2px)] p-12 sm:p-16 text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Ready to Level Up
                  <span className="block mt-2 gradient-text">Your Social Presence?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join thousands of professionals saving hours every week with AI-powered content generation
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 text-lg px-10 py-6 shadow-glow font-semibold"
                >
                  Start Creating Now
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-primary rounded-lg">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold gradient-text">LinkTweet</span>
              <span>© 2025 All rights reserved</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
