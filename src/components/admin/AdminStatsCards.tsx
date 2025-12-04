import { Card, CardContent } from "@/components/ui/card";
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
      subtitle: `${stats.activeUsers} active`,
      icon: Users,
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Premium",
      value: stats.premiumUsers,
      subtitle: `${stats.enterpriseUsers} enterprise`,
      icon: Crown,
      color: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts,
      subtitle: `${stats.monthlyPosts} this month`,
      icon: Calendar,
      color: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Revenue",
      value: `$${stats.revenuePotential}`,
      subtitle: "MRR potential",
      icon: DollarSign,
      color: "from-green-500/20 to-green-500/5",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "Credits",
      value: stats.totalCredits.toLocaleString(),
      subtitle: "Total balance",
      icon: Zap,
      color: "from-purple-500/20 to-purple-500/5",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Conversion",
      value: `${stats.conversionRate}%`,
      subtitle: "Free to paid",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "Today",
      value: stats.dailyPosts,
      subtitle: `${stats.avgPostsPerUser} avg/user`,
      icon: Activity,
      color: "from-cyan-500/20 to-cyan-500/5",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
    },
    {
      title: "Free Users",
      value: stats.freeUsers,
      subtitle: "Upgrade targets",
      icon: Target,
      color: "from-rose-500/20 to-rose-500/5",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <div className="grid gap-2 md:gap-3 grid-cols-2 sm:grid-cols-4">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className={`group hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br ${stat.color} border-0 shadow-sm hover:shadow-md`}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 md:p-2.5 rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold truncate">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{stat.title}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 truncate hidden sm:block">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
