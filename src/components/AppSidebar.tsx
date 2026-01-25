import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Edit,
  Calendar,
  Megaphone,
  BarChart3,
  LogOut,
  Settings,
  Search,
  CreditCard,
  Shield,
  Zap,
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
  { title: "Generate", url: "/dashboard/generate", icon: Sparkles },
  { title: "Inspiration", url: "/dashboard/inspiration", icon: Lightbulb },
  { title: "Posts", url: "/dashboard/posts", icon: Edit },
  { title: "Scan & Optimize", url: "/dashboard/scan-optimize", icon: Search },
];

const premiumItems = [
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
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

  const isPremium = profile?.subscription_tier !== "free" || profile?.trial_end_date;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold gradient-text">
                LinkTweet
              </h1>
              {profile && (
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {profile.role}
                </p>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 scrollbar-none">
        {/* Main Navigation */}
        <div className="space-y-1.5">
          {!collapsed && (
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-3 px-3">
              Main
            </p>
          )}
          {createItems.map((item, index) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Premium Features */}
        {isPremium && (
          <div className="mt-6 space-y-1.5">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-3 px-3">
                <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Premium
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
            )}
            {premiumItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                  }`
                }
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-6 space-y-1.5">
            {!collapsed && (
              <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-3 px-3">
                Admin
              </p>
            )}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                }`
              }
            >
              <Shield className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
              {!collapsed && (
                <span className="text-sm font-medium">Admin</span>
              )}
            </NavLink>
          </div>
        )}

        {/* Account Section */}
        <div className="mt-auto pt-6 space-y-1.5">
          {!collapsed && (
            <div className="h-px bg-border/30 mb-4" />
          )}
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              }`
            }
          >
            <Settings className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </NavLink>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              }`
            }
          >
            <CreditCard className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="text-sm font-medium">Pricing</span>}
          </NavLink>

          {profile?.subscription_tier === "free" && !profile?.trial_end_date && (
            <Button 
              onClick={() => navigate("/pricing")}
              className="w-full mt-3 bg-gradient-primary hover:opacity-90 shadow-glow font-medium"
            >
              {!collapsed ? (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Free Trial
                </>
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
          </Button>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/20">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
          <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
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
