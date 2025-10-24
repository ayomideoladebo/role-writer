import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp, ArrowRight, CheckCircle2, Rocket, Users, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  ">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary rounded-lg sm:rounded-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-primary bg-clip-text text-transparent">
              LinkTweet
            </h1>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            variant="ghost"
            size="sm"
            className="text-sm sm:text-base"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full text-xs sm:text-sm font-medium text-primary">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                AI-Powered Content Generation
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Create Engaging
                <span className="block mt-2 bg-primary bg-clip-text text-transparent">
                  Twitter & Linkedin
                </span>
                <span className="block mt-2">In Seconds</span>
              </h1>
              
              {/* Subheading */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Generate professional LinkedIn and Twitter posts tailored to your role and industry. 
                Save time and maintain consistency across platforms.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-hover group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span>2 minute setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 border-y bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, label: "Active Users", value: "1K+" },
              { icon: Sparkles, label: "Posts Generated", value: "50+" },
              { icon: TrendingUp, label: "Engagement Rate", value: "92%" },
              { icon: BarChart3, label: "Time Saved", value: "100+ hrs" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary" />
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Everything You Need to
                <span className="block mt-2 bg-primary bg-clip-text text-transparent">
                  Grow Your Presence
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you create, manage, and optimize your social media content
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  icon: Zap,
                  title: "AI-Powered Generation",
                  description: "Advanced AI creates engaging content that matches your unique tone, style, and industry expertise",
                  gradient: "from-yellow-500/10 to-orange-500/10",
                },
                {
                  icon: TrendingUp,
                  title: "Multi-Platform Support",
                  description: "Get perfectly optimized versions for LinkedIn and Twitter with platform-specific formatting",
                  gradient: "from-blue-500/10 to-cyan-500/10",
                },
                {
                  icon: Rocket,
                  title: "Batch Generation",
                  description: "Generate multiple posts at once and schedule them for consistent content delivery",
                  gradient: "from-purple-500/10 to-pink-500/10",
                },
                {
                  icon: Sparkles,
                  title: "Smart Inspiration",
                  description: "Find trending topics and generate fresh content ideas based on your industry",
                  gradient: "from-green-500/10 to-emerald-500/10",
                },
                {
                  icon: BarChart3,
                  title: "Content Analytics",
                  description: "Track your saved posts, view insights, and understand what content works best",
                  gradient: "from-indigo-500/10 to-blue-500/10",
                },
                {
                  icon: Users,
                  title: "Profile Customization",
                  description: "Tailor content to your target audience with detailed profile settings and preferences",
                  gradient: "from-red-500/10 to-rose-500/10",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 sm:p-8 bg-card rounded-2xl border-2 border-border hover:border-primary/50 shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="p-3 bg-primary rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 sm:p-12 lg:p-16 text-center shadow-hover">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground">
                  Ready to Level Up
                  <span className="block mt-2">Your Linkedin</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                  Join thousands of professionals who save hours every week with AI-powered content generation
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => navigate("/auth")}
                    size="lg"
                    variant="secondary"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl hover:scale-105 transition-transform"
                  >
                    Start Creating Now
                    <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold bg-primary bg-clip-text text-transparent">LinkTweet</span>
              <span>© 2025 All rights reserved</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
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
