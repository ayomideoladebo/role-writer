import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Menu, Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b">
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-9 w-9"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage users & content</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="hidden sm:flex px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30"
          >
            <Shield className="w-3 h-3 mr-1.5" />
            Admin Mode
          </Badge>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative" disabled>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </div>
  );
}
