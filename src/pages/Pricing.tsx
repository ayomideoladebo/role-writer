import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { UpgradeConfirmDialog } from "@/components/UpgradeConfirmDialog";

interface PricingTier {
  id: string;
  tier_name: string;
  price_monthly: number;
  price_yearly: number;
  credits_included: number;
  post_limit: number;
  features: any;
}

export default function Pricing() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [currentCredits, setCurrentCredits] = useState(0);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPricingTiers();
    fetchCurrentTier();
  }, []);

  const fetchPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPricingTiers(data || []);
    } catch (error: any) {
      toast.error("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_tier, credits")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setCurrentTier(data?.subscription_tier || "free");
      setCurrentCredits(data?.credits || 0);
    } catch (error: any) {
      console.error("Error fetching current tier:", error);
    }
  };

  const handleUpgradeClick = (tierName: string) => {
    if (tierName === currentTier) {
      toast.info("You're already on this plan!");
      return;
    }

    const tier = pricingTiers.find(t => t.tier_name === tierName);
    if (!tier) {
      toast.error("Plan not found");
      return;
    }

    setSelectedTier(tier);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedTier) return;

    setUpgrading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      const newCredits = currentCredits + selectedTier.credits_included;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: selectedTier.tier_name,
          monthly_post_limit: selectedTier.post_limit,
          credits: newCredits,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + (billingPeriod === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      setCurrentTier(selectedTier.tier_name);
      setCurrentCredits(newCredits);
      setShowConfirmDialog(false);
      
      toast.success(`Successfully upgraded to ${selectedTier.tier_name} plan!`, {
        description: `You now have ${newCredits} total credits`
      });

      setTimeout(() => {
        navigate("/dashboard/insights");
      }, 2000);
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade. Please try again or contact support.");
    } finally {
      setUpgrading(false);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case "free":
        return <Zap className="w-5 h-5" />;
      case "premium":
        return <Sparkles className="w-5 h-5" />;
      case "enterprise":
        return <Crown className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getHighlightFeatures = (tierName: string) => {
    switch (tierName) {
      case "free":
        return ["20 posts/month", "100 credits", "Basic AI (Gemini Flash)", "LinkedIn & Twitter", "Basic templates"];
      case "premium":
        return ["100 posts/month", "500 credits", "Advanced AI models", "Content calendar", "Custom brand voice", "Batch generation (5x)", "Post scheduling"];
      case "enterprise":
        return ["1000 posts/month", "2000 credits", "GPT-5 Full Access", "Team collaboration", "API access", "White-label options", "Priority 24/7 support", "Advanced analytics"];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Supercharge your content
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "yearly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => {
            const price = billingPeriod === "monthly" ? tier.price_monthly : tier.price_yearly;
            const monthlyPrice = billingPeriod === "yearly" ? Math.round(tier.price_yearly / 12) : tier.price_monthly;
            const isCurrentTier = currentTier === tier.tier_name;
            const isPremiumTier = tier.tier_name === "premium";
            const isEnterprise = tier.tier_name === "enterprise";
            const features = getHighlightFeatures(tier.tier_name);

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-6 transition-all duration-300 ${
                  isPremiumTier
                    ? "bg-gradient-to-b from-primary/20 via-primary/10 to-transparent border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : isEnterprise
                    ? "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/50"
                    : "bg-card/50 border border-border/50"
                }`}
              >
                {/* Badge */}
                {isPremiumTier && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                {isEnterprise && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
                    Best Value
                  </Badge>
                )}

                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${
                    isPremiumTier ? "bg-primary/20 text-primary" : 
                    isEnterprise ? "bg-amber-500/20 text-amber-400" : 
                    "bg-muted text-muted-foreground"
                  }`}>
                    {getTierIcon(tier.tier_name)}
                  </div>
                  <h3 className="text-lg font-semibold capitalize text-foreground">
                    {tier.tier_name}
                  </h3>
                  {isCurrentTier && (
                    <Badge variant="outline" className="ml-auto text-xs border-green-500/50 text-green-400">
                      Current
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">${monthlyPrice}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {billingPeriod === "yearly" && tier.price_yearly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${tier.price_yearly} billed yearly
                    </p>
                  )}
                  {tier.price_monthly === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Free forever
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleUpgradeClick(tier.tier_name)}
                  disabled={isCurrentTier}
                  className={`w-full mb-6 ${
                    isPremiumTier
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : isEnterprise
                      ? "bg-amber-500 hover:bg-amber-500/90 text-white"
                      : ""
                  }`}
                  variant={isPremiumTier || isEnterprise ? "default" : "outline"}
                >
                  {isCurrentTier ? "Current Plan" : tier.tier_name === "free" ? "Get Started" : "Upgrade"}
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className={`w-4 h-4 flex-shrink-0 ${
                        isPremiumTier ? "text-primary" : 
                        isEnterprise ? "text-amber-400" : 
                        "text-muted-foreground"
                      }`} />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ / Trust Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Have questions?{" "}
            <button className="text-primary hover:underline">
              Contact our team
            </button>
          </p>
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      {selectedTier && (
        <UpgradeConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          currentPlan={currentTier}
          newPlan={selectedTier.tier_name}
          currentCredits={currentCredits}
          newPlanCredits={selectedTier.credits_included}
          newPlanPostLimit={selectedTier.post_limit}
          price={billingPeriod === "monthly" ? selectedTier.price_monthly : selectedTier.price_yearly}
          billingPeriod={billingPeriod}
          onConfirm={handleConfirmUpgrade}
          isLoading={upgrading}
        />
      )}
    </div>
  );
}
