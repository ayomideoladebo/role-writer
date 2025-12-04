import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Calendar, DollarSign, Zap, TrendingUp, Activity, Target } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalCredits: number;
  premiumUsers: number;
  freeUsers: number;
  monthlyPosts: number;
  dailyPosts: number;
  revenuePotential: number;
  avgPostsPerUser: number;
  enterpriseUsers: number;
  conversionRate: number;
}

interface AdminStatsCardsProps {
  stats: SystemStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active (7d)`,
      icon: Users,
      gradient: "from-card to-primary/5",
      border: "border-primary/20",
      iconColor: "text-primary",
      valueColor: "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
    },
    {
      title: "Premium Users",
      value: stats.premiumUsers,
      subtitle: `${stats.enterpriseUsers} enterprise`,
      icon: Crown,
      gradient: "from-card to-amber-500/5",
      border: "border-amber-500/20",
      iconColor: "text-amber-500",
      valueColor: "text-amber-500",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      subtitle: `${stats.monthlyPosts} this month`,
      icon: Calendar,
      gradient: "from-card to-blue-500/5",
      border: "border-blue-500/20",
      iconColor: "text-blue-500",
      valueColor: "text-blue-500",
    },
    {
      title: "Revenue Potential",
      value: `$${stats.revenuePotential}`,
      subtitle: "Monthly recurring",
      icon: DollarSign,
      gradient: "from-card to-green-500/5",
      border: "border-green-500/20",
      iconColor: "text-green-500",
      valueColor: "text-green-500",
    },
    {
      title: "Total Credits",
      value: stats.totalCredits.toLocaleString(),
      subtitle: "Across all users",
      icon: Zap,
      gradient: "from-card to-purple-500/5",
      border: "border-purple-500/20",
      iconColor: "text-purple-500",
      valueColor: "text-purple-500",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      subtitle: "Free to paid",
      icon: TrendingUp,
      gradient: "from-card to-emerald-500/5",
      border: "border-emerald-500/20",
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-500",
    },
    {
      title: "Posts Today",
      value: stats.dailyPosts,
      subtitle: `${stats.avgPostsPerUser} avg/user`,
      icon: Activity,
      gradient: "from-card to-cyan-500/5",
      border: "border-cyan-500/20",
      iconColor: "text-cyan-500",
      valueColor: "text-cyan-500",
    },
    {
      title: "Free Users",
      value: stats.freeUsers,
      subtitle: "Potential upgrades",
      icon: Target,
      gradient: "from-card to-rose-500/5",
      border: "border-rose-500/20",
      iconColor: "text-rose-500",
      valueColor: "text-rose-500",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className={`hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br ${stat.gradient} ${stat.border}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium truncate pr-2">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 md:h-5 md:w-5 shrink-0 ${stat.iconColor}`} />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className={`text-xl md:text-2xl lg:text-3xl font-bold ${stat.valueColor}`}>
              {stat.value}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
