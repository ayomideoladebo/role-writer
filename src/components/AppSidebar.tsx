import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  FileText,
  Plus,
  Calendar,
  Edit,
  Plug,
  Shield,
  CreditCard,
  Megaphone,
  BarChart3,
  LogOut,
  Settings,
  Search,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const createItems = [
  { title: "Dashboard", url: "/dashboard/insights", icon: TrendingUp },
  { title: "Generate Post", url: "/dashboard/generate", icon: Sparkles },
  { title: "Inspiration", url: "/dashboard/inspiration", icon: Lightbulb },
  { title: "Past Posts", url: "/dashboard/posts", icon: Edit },
  { title: "Scan & Optimize", url: "/dashboard/scan-optimize", icon: Search },
];

const premiumItems = [
  { title: "Content Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Brand Voice", url: "/dashboard/brand-voice", icon: Megaphone },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);

        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-[#1e1e2e]">
      <SidebarHeader className="p-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 sm:p-2 bg-primary rounded-lg sm:rounded-xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
              LinkTweet
            </h1>
            {profile && (
              <p className="text-xs text-muted-foreground">
                {profile.role} · {profile.industry}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* CREATE Section */}
        <div className="mb-6">
          {!collapsed && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
              CREATE
            </p>
          )}
          <nav className="space-y-1">
            {createItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* PREMIUM Features Section */}
        {profile?.subscription_tier !== "free" && (
          <div className="mb-6">
            {!collapsed && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
                PREMIUM
              </p>
            )}
            <nav className="space-y-1">
              {premiumItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* ADMIN Section */}
        {isAdmin && (
          <div className="mb-6">
            {!collapsed && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
                ADMIN
              </p>
            )}
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">Admin Dashboard</span>
                )}
              </NavLink>
            </nav>
          </div>
        )}

        {/* ACCOUNT Section */}
        <div className="mt-auto pt-6 space-y-1">
          {!collapsed && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
              ACCOUNT
            </p>
          )}
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </NavLink>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`
            }
          >
            <CreditCard className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Pricing</span>}
          </NavLink>

          {profile?.subscription_tier === "free" && (
            <Button 
              onClick={() => navigate("/pricing")}
              className="w-full mt-2 bg-primary hover:opacity-90"
            >
              {!collapsed ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full mt-2 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </Button>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/10">

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {profile?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.subscription_tier || "Free"} Plan
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
