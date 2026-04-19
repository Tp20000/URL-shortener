import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Users, TrendingUp, Calendar } from 'lucide-react';

interface SummaryProps {
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    allTimeClicks: number;
  };
  period: {
    days: number;
  };
}

export function AnalyticsSummary({ summary, period }: SummaryProps) {
  const avgPerDay =
    period.days > 0
      ? Math.round((summary.totalClicks / period.days) * 10) / 10
      : 0;

  const cards = [
    {
      title: `Clicks (${period.days}d)`,
      value: summary.totalClicks,
      icon: MousePointerClick,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Unique Visitors',
      value: summary.uniqueVisitors,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'All-Time Clicks',
      value: summary.allTimeClicks,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Avg per Day',
      value: avgPerDay,
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {typeof card.value === 'number' && card.value % 1 !== 0
                    ? card.value.toFixed(1)
                    : card.value.toLocaleString()}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}