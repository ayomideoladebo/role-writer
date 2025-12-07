import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface StartTrialCardProps {
  onStartTrial: () => Promise<boolean>;
}

export function StartTrialCard({ onStartTrial }: StartTrialCardProps) {
  const [starting, setStarting] = useState(false);

  const handleStartTrial = async () => {
    setStarting(true);
    const success = await onStartTrial();
    setStarting(false);
    
    if (success) {
      toast.success("Welcome to your 7-day Premium trial!", {
        description: "Enjoy full access to all premium features"
      });
    } else {
      toast.error("Failed to start trial. Please try again.");
    }
  };

  const trialFeatures = [
    "Content Calendar",
    "Custom Brand Voice",
    "Advanced Analytics",
    "Batch Generation (5x)",
    "Post Scheduling",
    "500 Credits",
  ];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Try Premium Free</h3>
          <p className="text-sm text-muted-foreground">7-day trial, no credit card required</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {trialFeatures.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground/80">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleStartTrial}
        disabled={starting}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {starting ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Starting Trial...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Start Free Trial
          </>
        )}
      </Button>
    </div>
  );
}