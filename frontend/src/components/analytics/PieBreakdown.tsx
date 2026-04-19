import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface PieBreakdownProps {
  title: string;
  icon: LucideIcon;
  data: Array<{ name: string; count: number; percentage: number }>;
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const DOT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function PieBreakdown({ title, icon: Icon, data }: PieBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress bar style breakdown */}
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted mb-4">
          {data.map((item, i) => (
            <div
              key={i}
              className={`${COLORS[i % COLORS.length]} transition-all`}
              style={{ width: `${(item.count / total) * 100}%` }}
              title={`${item.name}: ${item.count} (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                <span className="truncate max-w-[140px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{item.count}</span>
                <span className="w-12 text-right font-medium text-foreground">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}