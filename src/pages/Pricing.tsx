import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setCurrentTier(data?.subscription_tier || "free");
    } catch (error: any) {
      console.error("Error fetching current tier:", error);
    }
  };

  const handleUpgrade = async (tierName: string) => {
    if (tierName === currentTier) {
      toast.info("You're already on this plan!");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      // Find the tier data
      const tier = pricingTiers.find(t => t.tier_name === tierName);
      if (!tier) {
        toast.error("Plan not found");
        return;
      }

      // Get current user credits first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const currentCredits = profileData?.credits || 0;
      const newCredits = currentCredits + tier.credits_included;

      // Update subscription tier in database - add new credits to existing
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tierName,
          monthly_post_limit: tier.post_limit,
          credits: newCredits,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + (billingPeriod === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      setCurrentTier(tierName);
      toast.success(`Successfully upgraded to ${tierName} plan!`, {
        description: `${currentCredits} existing + ${tier.credits_included} new = ${newCredits} total credits`
      });

      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard/insights");
      }, 2000);
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade. Please try again or contact support.");
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case "free":
        return <Zap className="w-6 h-6" />;
      case "premium":
        return <Sparkles className="w-6 h-6" />;
      case "enterprise":
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case "free":
        return "bg-muted";
      case "premium":
        return "bg-gradient-to-br from-primary/20 to-primary/10";
      case "enterprise":
        return "bg-gradient-to-br from-amber-500/20 to-amber-500/10";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock powerful features to supercharge your content creation
          </p>

          <Tabs
            value={billingPeriod}
            onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}
            className="inline-flex"
          >
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => {
            const price = billingPeriod === "monthly" ? tier.price_monthly : tier.price_yearly;
            const monthlyPrice = billingPeriod === "yearly" ? Math.round(tier.price_yearly / 12) : tier.price_monthly;
            const isCurrentTier = currentTier === tier.tier_name;
            const isPremiumTier = tier.tier_name === "premium";

            return (
              <Card
                key={tier.id}
                className={`relative ${getTierColor(tier.tier_name)} ${
                  isPremiumTier ? "border-primary border-2 shadow-2xl scale-105" : ""
                } ${
                  tier.tier_name === "enterprise" ? "border-amber-500 border-2 shadow-2xl" : ""
                }`}
              >
                {isPremiumTier && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {tier.tier_name === "enterprise" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
                    Best Value
                  </Badge>
                )}
                {isCurrentTier && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${tier.tier_name === "enterprise" ? "bg-amber-500/20" : "bg-primary/20"}`}>
                      {getTierIcon(tier.tier_name)}
                    </div>
                    <CardTitle className="text-2xl capitalize">
                      {tier.tier_name}
                    </CardTitle>
                  </div>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">${monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingPeriod === "yearly" && tier.price_yearly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed ${tier.price_yearly}/year
                    </p>
                  )}
                  <CardDescription className="mt-2">
                    {tier.credits_included} credits • {tier.post_limit} posts/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleUpgrade(tier.tier_name)}
                    disabled={isCurrentTier}
                    className={`w-full mb-6 ${
                      isPremiumTier ? "bg-primary hover:bg-primary/90" : ""
                    }`}
                    variant={isPremiumTier ? "default" : "outline"}
                  >
                    {isCurrentTier ? "Current Plan" : tier.tier_name === "free" ? "Get Started" : "Upgrade Now"}
                  </Button>

                  <div className="space-y-3">
                    {Object.entries(tier.features).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-foreground">{key}:</span>
                          <span className="text-sm text-muted-foreground ml-1">{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">
                Need a custom plan?
              </h3>
              <p className="text-muted-foreground mb-4">
                Contact our sales team for custom pricing, bulk discounts, and enterprise features
              </p>
              <Button variant="outline" className="border-primary">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}