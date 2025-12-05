import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Sparkles, CreditCard, Calendar, Check } from "lucide-react";

interface UpgradeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  newPlan: string;
  currentCredits: number;
  newPlanCredits: number;
  newPlanPostLimit: number;
  price: number;
  billingPeriod: "monthly" | "yearly";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function UpgradeConfirmDialog({
  open,
  onOpenChange,
  currentPlan,
  newPlan,
  currentCredits,
  newPlanCredits,
  newPlanPostLimit,
  price,
  billingPeriod,
  onConfirm,
  isLoading,
}: UpgradeConfirmDialogProps) {
  const totalCredits = currentCredits + newPlanCredits;
  const isDowngrade = 
    (currentPlan === "enterprise" && (newPlan === "premium" || newPlan === "free")) ||
    (currentPlan === "premium" && newPlan === "free");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isDowngrade ? "Confirm Plan Change" : "Confirm Upgrade"}
          </DialogTitle>
          <DialogDescription>
            Review your plan change details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Change */}
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5 capitalize text-base">
              {currentPlan}
            </Badge>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <Badge className="px-3 py-1.5 capitalize text-base bg-primary">
              {newPlan}
            </Badge>
          </div>

          <Separator />

          {/* Credit Calculation */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Credit Calculation
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your current credits</span>
                <span className="font-medium">{currentCredits}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>+ New plan credits</span>
                <span className="font-medium">+{newPlanCredits}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total credits</span>
                <span className="text-primary">{totalCredits}</span>
              </div>
            </div>
          </div>

          {/* New Plan Features */}
          <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              What you'll get
            </h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{newPlanCredits} credits added to your balance</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>{newPlanPostLimit} posts per month limit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Access to {newPlan} features</span>
              </li>
            </ul>
          </div>

          {/* Price */}
          {price > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-muted-foreground">
                {billingPeriod === "monthly" ? "Monthly" : "Yearly"} price
              </span>
              <span className="text-xl font-bold">
                ${price}/{billingPeriod === "monthly" ? "mo" : "yr"}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : isDowngrade ? "Confirm Change" : "Confirm Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
