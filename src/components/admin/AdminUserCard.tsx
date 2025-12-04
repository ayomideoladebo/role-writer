import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Crown, Shield, Trash2, Plus, Minus, Mail, Calendar } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  credits: number;
  role: string | null;
  industry: string | null;
  created_at: string;
  subscription_tier: string;
  monthly_post_limit: number;
}

interface AdminUserCardProps {
  user: Profile;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdateSubscription: (userId: string, tier: string) => void;
  onUpdateCredits: (userId: string, amount: number) => void;
  onMakeAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export function AdminUserCard({
  user,
  isSelected,
  onSelect,
  onUpdateSubscription,
  onUpdateCredits,
  onMakeAdmin,
  onRemoveAdmin,
  onDelete,
}: AdminUserCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "premium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card
      className={`transition-all ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate max-w-[200px]">
                  {user.email}
                </span>
                {user.role === "admin" && (
                  <Badge variant="default" className="h-5 text-[10px]">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={`text-[10px] ${getTierColor(user.subscription_tier)}`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {user.subscription_tier}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {user.credits} credits
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {user.monthly_post_limit} posts/mo
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {user.industry && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.industry}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onUpdateCredits(user.id, 100)}>
                <Plus className="w-4 h-4 mr-2" />
                Add 100 Credits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateCredits(user.id, 500)}>
                <Plus className="w-4 h-4 mr-2" />
                Add 500 Credits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateCredits(user.id, -50)}>
                <Minus className="w-4 h-4 mr-2" />
                Deduct 50 Credits
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateSubscription(user.id, "free")}>
                Set Free Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateSubscription(user.id, "premium")}>
                Set Premium Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateSubscription(user.id, "enterprise")}>
                Set Enterprise Tier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.role !== "admin" ? (
                <DropdownMenuItem onClick={() => onMakeAdmin(user.id)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Make Admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onRemoveAdmin(user.id)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Remove Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
