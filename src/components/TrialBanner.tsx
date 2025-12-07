import { Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface TrialBannerProps {
  daysRemaining: number;
  isExpiringSoon: boolean;
}

export function TrialBanner({ daysRemaining, isExpiringSoon }: TrialBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const urgencyClass = isExpiringSoon
    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50"
    : "bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/50";

  const iconClass = isExpiringSoon ? "text-amber-400" : "text-primary";

  return (
    <div className={`relative px-4 py-3 border rounded-lg ${urgencyClass} mb-4`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-background/20 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-background/20 ${iconClass}`}>
            {isExpiringSoon ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isExpiringSoon ? (
                <>
                  {daysRemaining === 1 
                    ? "Your trial ends tomorrow!" 
                    : `Only ${daysRemaining} days left in your trial!`}
                </>
              ) : (
                <>Premium trial active - {daysRemaining} days remaining</>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {isExpiringSoon
                ? "Upgrade now to keep your premium features"
                : "Enjoy full access to all premium features"}
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => navigate("/pricing")}
          size="sm"
          className={isExpiringSoon 
            ? "bg-amber-500 hover:bg-amber-600 text-white" 
            : "bg-primary hover:bg-primary/90"
          }
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}