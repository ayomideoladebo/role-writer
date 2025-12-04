import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown, Shield, Trash2, Plus, Minus, Mail, Calendar, 
  User, CreditCard, FileText, Activity, Ban, RefreshCw,
  Edit, Save, X
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  credits: number;
  role: string | null;
  industry: string | null;
  created_at: string;
  subscription_tier: string;
  monthly_post_limit: number;
  updated_at?: string;
}

interface AdminUserDetailSheetProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPosts: number;
  onUpdateSubscription: (userId: string, tier: string) => void;
  onUpdateCredits: (userId: string, amount: number) => void;
  onMakeAdmin: (userId: string) => void;
  onRemoveAdmin: (userId: string) => void;
  onDelete: (userId: string) => void;
  onSuspend?: (userId: string) => void;
}

export function AdminUserDetailSheet({
  user,
  open,
  onOpenChange,
  userPosts,
  onUpdateSubscription,
  onUpdateCredits,
  onMakeAdmin,
  onRemoveAdmin,
  onDelete,
}: AdminUserDetailSheetProps) {
  const [creditAmount, setCreditAmount] = useState("100");
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

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

  const handleAddCredits = () => {
    const amount = parseInt(creditAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpdateCredits(user.id, amount);
    }
  };

  const handleDeductCredits = () => {
    const amount = parseInt(creditAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpdateCredits(user.id, -amount);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg">User Details</SheetTitle>
                {user.role === "admin" && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <SheetDescription className="sr-only">View and manage user details</SheetDescription>
            </SheetHeader>

            {/* User Info Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.industry || "No industry set"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getTierColor(user.subscription_tier)}>
                      <Crown className="w-3 h-3 mr-1" />
                      {user.subscription_tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <CreditCard className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xl font-bold">{user.credits}</p>
                <p className="text-[10px] text-muted-foreground">Credits</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <FileText className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold">{userPosts}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Activity className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold">{user.monthly_post_limit}</p>
                <p className="text-[10px] text-muted-foreground">Limit/mo</p>
              </div>
            </div>

            <Separator />

            {/* Credit Management */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Credit Management</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="h-9"
                  placeholder="Amount"
                />
                <Button size="sm" className="h-9 px-3" onClick={handleAddCredits}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button size="sm" variant="outline" className="h-9 px-3" onClick={handleDeductCredits}>
                  <Minus className="w-4 h-4 mr-1" />
                  Deduct
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onUpdateCredits(user.id, 50)}>+50</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onUpdateCredits(user.id, 100)}>+100</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onUpdateCredits(user.id, 500)}>+500</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onUpdateCredits(user.id, 1000)}>+1000</Button>
              </div>
            </div>

            <Separator />

            {/* Subscription Management */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Subscription Tier</Label>
              <Select 
                value={user.subscription_tier} 
                onValueChange={(value) => onUpdateSubscription(user.id, value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                      Free
                    </span>
                  </SelectItem>
                  <SelectItem value="premium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Premium
                    </span>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Enterprise
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Admin Actions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Admin Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                {user.role !== "admin" ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 justify-start"
                    onClick={() => onMakeAdmin(user.id)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Make Admin
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 justify-start"
                    onClick={() => onRemoveAdmin(user.id)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Remove Admin
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 justify-start"
                  disabled
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 justify-start"
                  disabled
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend User
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 justify-start"
                  disabled
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>

            <Separator />

            {/* Meta Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>User ID</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{user.id}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Joined</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              {user.updated_at && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Last Active</span>
                  <span>{new Date(user.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-destructive/20">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  onDelete(user.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
