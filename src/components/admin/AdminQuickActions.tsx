import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, UserPlus, Send, Settings, Database } from "lucide-react";

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
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1"
            onClick={onRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="text-xs">Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1"
            onClick={onExportUsers}
          >
            <Download className="w-4 h-4" />
            <span className="text-xs">Export</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1"
            onClick={onBulkUpgrade}
            disabled={selectedCount === 0}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-xs">Bulk Upgrade</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1"
            onClick={onBulkAddCredits}
            disabled={selectedCount === 0}
          >
            <Send className="w-4 h-4" />
            <span className="text-xs">Add Credits</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex-col gap-1 col-span-2 md:col-span-1"
            disabled
          >
            <Database className="w-4 h-4" />
            <span className="text-xs">Backup</span>
          </Button>
        </div>
        {selectedCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {selectedCount} user{selectedCount > 1 ? "s" : ""} selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
