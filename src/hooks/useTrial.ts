import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrialState {
  isOnTrial: boolean;
  trialUsed: boolean;
  trialDaysRemaining: number;
  trialEndDate: Date | null;
  canStartTrial: boolean;
  isExpiringSoon: boolean; // 3 days or less
}

export function useTrial(userId?: string) {
  const [trialState, setTrialState] = useState<TrialState>({
    isOnTrial: false,
    trialUsed: false,
    trialDaysRemaining: 0,
    trialEndDate: null,
    canStartTrial: true,
    isExpiringSoon: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchTrialStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("trial_start_date, trial_end_date, trial_used, subscription_tier")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const now = new Date();
      const trialEndDate = data?.trial_end_date ? new Date(data.trial_end_date) : null;
      const isOnTrial = trialEndDate ? now < trialEndDate : false;
      const trialUsed = data?.trial_used || false;
      const isPaidUser = data?.subscription_tier !== "free";
      
      let trialDaysRemaining = 0;
      if (trialEndDate && isOnTrial) {
        trialDaysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      setTrialState({
        isOnTrial,
        trialUsed,
        trialDaysRemaining,
        trialEndDate,
        canStartTrial: !trialUsed && !isPaidUser,
        isExpiringSoon: isOnTrial && trialDaysRemaining <= 3,
      });
    } catch (error) {
      console.error("Error fetching trial status:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const trialStartDate = new Date();
      const trialEndDate = new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { error } = await supabase
        .from("profiles")
        .update({
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_used: true,
          subscription_tier: "premium", // Temporarily upgrade to premium during trial
        })
        .eq("id", userId);

      if (error) throw error;

      setTrialState({
        isOnTrial: true,
        trialUsed: true,
        trialDaysRemaining: 7,
        trialEndDate,
        canStartTrial: false,
        isExpiringSoon: false,
      });

      return true;
    } catch (error) {
      console.error("Error starting trial:", error);
      return false;
    }
  };

  const checkAndExpireTrial = async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("trial_end_date, subscription_tier")
        .eq("id", userId)
        .single();

      if (data?.trial_end_date && data.subscription_tier === "premium") {
        const trialEndDate = new Date(data.trial_end_date);
        const now = new Date();

        if (now >= trialEndDate) {
          // Trial expired, downgrade to free
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", userId);

          setTrialState(prev => ({
            ...prev,
            isOnTrial: false,
            trialDaysRemaining: 0,
          }));
        }
      }
    } catch (error) {
      console.error("Error checking trial expiry:", error);
    }
  };

  useEffect(() => {
    fetchTrialStatus();
    checkAndExpireTrial();
  }, [userId]);

  return {
    ...trialState,
    loading,
    startTrial,
    refetch: fetchTrialStatus,
  };
}