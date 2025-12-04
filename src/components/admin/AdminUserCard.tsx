import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Crown, Shield, Trash2, Plus, Minus, Calendar, Eye, FileText, CreditCard } from "lucide-react";

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
  postCount: number;
  onSelect: (selected: boolean) => void;
  onUpdateSubscription: (userId: string, tier: string) => void;
  onUpdateCredits: (userId: string, amount: number) => void;
  onMakeAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onDelete: (userId: string) => void;
  onViewDetails: (user: Profile) => void;
}

export function AdminUserCard({
  user,
  isSelected,
  postCount,
  onSelect,
  onUpdateSubscription,
  onUpdateCredits,
  onMakeAdmin,
  onRemoveAdmin,
  onDelete,
  onViewDetails,
}: AdminUserCardProps) {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return { 
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          icon: "🚀"
        };
      case "premium":
        return { 
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: "⭐"
        };
      default:
        return { 
          color: "bg-muted text-muted-foreground border-muted",
          icon: "👤"
        };
    }
  };

  const tierConfig = getTierConfig(user.subscription_tier);

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? "ring-2 ring-primary bg-primary/5 border-primary/30" 
          : "hover:bg-muted/30 hover:border-primary/20"
      }`}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg">
              {tierConfig.icon}
            </div>
            {user.role === "admin" && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.industry || "No industry"}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onViewDetails(user)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge className={`text-[10px] h-5 ${tierConfig.color}`}>
                <Crown className="w-3 h-3 mr-1" />
                {user.subscription_tier}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <CreditCard className="w-3 h-3" />
                {user.credits}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <FileText className="w-3 h-3" />
                {postCount}
              </Badge>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(user.created_at).toLocaleDateString()}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px]"
                onClick={() => onViewDetails(user)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
