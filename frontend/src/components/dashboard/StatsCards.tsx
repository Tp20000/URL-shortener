import { Card, CardContent } from '@/components/ui/card';
import { Link2, MousePointerClick, Activity, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUrls: number;
    activeUrls: number;
    totalClicks: number;
    clicksToday: number;
    clicksLast7Days: number;
    clicksLast30Days: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Links',
      value: stats.totalUrls,
      subtitle: `${stats.activeUrls} active`,
      icon: Link2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Clicks',
      value: stats.totalClicks,
      subtitle: `${stats.clicksToday} today`,
      icon: MousePointerClick,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Last 7 Days',
      value: stats.clicksLast7Days,
      subtitle: 'clicks this week',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Last 30 Days',
      value: stats.clicksLast30Days,
      subtitle: 'clicks this month',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}