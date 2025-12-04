import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, UserPlus, Send, Database, Users } from "lucide-react";

interface AdminQuickActionsProps {
  onExportUsers: () => void;
  onRefreshData: () => void;
  selectedCount: number;
  onBulkUpgrade: () => void;
  onBulkAddCredits: () => void;
  isRefreshing: boolean;
}

export function AdminQuickActions({
  onExportUsers,
  onRefreshData,
  selectedCount,
  onBulkUpgrade,
  onBulkAddCredits,
  isRefreshing,
}: AdminQuickActionsProps) {
  return (
    <Card className="border-0 bg-gradient-to-r from-muted/50 to-muted/30 shadow-sm">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 gap-2"
              onClick={onRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 gap-2"
              onClick={onExportUsers}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            
            {selectedCount > 0 && (
              <>
                <div className="h-6 w-px bg-border hidden sm:block" />
                <Badge variant="secondary" className="h-7 gap-1.5 px-3">
                  <Users className="w-3 h-3" />
                  {selectedCount} selected
                </Badge>
                <Button
                  size="sm"
                  className="h-9 gap-2"
                  onClick={onBulkUpgrade}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade to Premium</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2"
                  onClick={onBulkAddCredits}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Add 100 Credits</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
