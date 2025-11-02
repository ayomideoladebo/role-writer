import { Crown, Sparkles, Zap, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PremiumBannerProps {
  type: "low-credits" | "feature-locked" | "usage-limit" | "upgrade-prompt";
  credits?: number;
  featureName?: string;
  dismissible?: boolean;
}

export default function PremiumBanner({ 
  type, 
  credits = 0, 
  featureName = "this feature",
  dismissible = false 
}: PremiumBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const bannerConfig = {
    "low-credits": {
      icon: <Zap className="w-5 h-5" />,
      title: "Running Low on Credits",
      description: `You have ${credits} credits left. Upgrade to Premium for 500 credits/month!`,
      cta: "View Plans",
      gradient: "from-amber-500/20 to-orange-500/20",
    },
    "feature-locked": {
      icon: <Crown className="w-5 h-5" />,
      title: "Premium Feature",
      description: `Unlock ${featureName} with Premium. Get advanced AI, analytics, and more!`,
      cta: "Upgrade Now",
      gradient: "from-primary/20 to-purple-500/20",
    },
    "usage-limit": {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Monthly Limit Reached",
      description: "You've reached your monthly post limit. Upgrade for 10x more posts!",
      cta: "See Premium",
      gradient: "from-blue-500/20 to-primary/20",
    },
    "upgrade-prompt": {
      icon: <Crown className="w-5 h-5" />,
      title: "Loving LinkTweet?",
      description: "Upgrade to Premium for unlimited AI models, batch generation, and priority support!",
      cta: "Explore Premium",
      gradient: "from-primary/20 to-pink-500/20",
    },
  };

  const config = bannerConfig[type];

  return (
    <Card className={`relative bg-gradient-to-r ${config.gradient} border-primary/30 shadow-lg`}>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-background/50 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-lg flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Button
            onClick={() => navigate("/pricing")}
            className="flex-shrink-0"
            variant="default"
          >
            <Crown className="w-4 h-4 mr-2" />
            {config.cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}