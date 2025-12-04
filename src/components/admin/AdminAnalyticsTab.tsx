import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Linkedin, Twitter, Activity, TrendingUp, Clock, Users } from "lucide-react";

interface SystemStats {
  platformUsage: {
    linkedin: number;
    twitter: number;
  };
  systemHealth: {
    apiResponseTime: number;
    databaseLoad: number;
    serverUptime: number;
  };
  avgPostsPerUser: number;
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  monthlyPosts: number;
  dailyPosts: number;
}

interface AdminAnalyticsTabProps {
  stats: SystemStats;
}

export function AdminAnalyticsTab({ stats }: AdminAnalyticsTabProps) {
  const weeklyGrowth = Math.round((stats.activeUsers / stats.totalUsers) * 100);
  const engagementRate = stats.totalUsers > 0 ? Math.round((stats.totalPosts / stats.totalUsers) * 10) : 0;

  return (
    <div className="space-y-4">
      {/* Platform Usage */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Platform Distribution
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Post distribution across platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Linkedin className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium">LinkedIn</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-40 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${stats.platformUsage.linkedin}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right">
                  {stats.platformUsage.linkedin}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <Twitter className="w-4 h-4 text-sky-500" />
                </div>
                <span className="text-sm font-medium">Twitter</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-40 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
                    style={{ width: `${stats.platformUsage.twitter}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-12 text-right">
                  {stats.platformUsage.twitter}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-card to-green-500/5 border-green-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response</span>
              <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                {stats.systemHealth.apiResponseTime}ms
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Load</span>
              <Badge variant="outline" className={`${
                stats.systemHealth.databaseLoad > 70 
                  ? "text-amber-500 border-amber-500/30 bg-amber-500/10" 
                  : "text-green-500 border-green-500/30 bg-green-500/10"
              }`}>
                {stats.systemHealth.databaseLoad}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Uptime</span>
              <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
                {stats.systemHealth.serverUptime}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-purple-500/5 border-purple-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Weekly Active</span>
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10">
                {weeklyGrowth}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Posts/User</span>
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10">
                {stats.avgPostsPerUser}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Engagement Score</span>
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10">
                {engagementRate}/10
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.dailyPosts}</div>
              <div className="text-xs text-muted-foreground">Posts Today</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{stats.monthlyPosts}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.activeUsers}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-amber-500">{stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">Total Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
