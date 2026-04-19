import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ClicksChartProps {
  data: Array<{ date: string; count: number }>;
}

export function ClicksChart({ data }: ClicksChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Clicks Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No click data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const CHART_HEIGHT = 200;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Clicks Over Time
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">

          {/* Y-axis labels */}
          <div className="flex items-end justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{Math.ceil(maxCount / 2)}</span>
            <span>{maxCount}</span>
          </div>

          {/* Chart */}
          <div
            className="flex items-end gap-2"
            style={{ height: `${CHART_HEIGHT}px` }}
          >
            {data.map((item, i) => {
              const barHeight =
                (item.count / maxCount) * (CHART_HEIGHT - 20);

              let dateLabel = '';
              try {
                dateLabel = format(
                  typeof item.date === 'string'
                    ? parseISO(item.date)
                    : new Date(item.date),
                  'MMM d'
                );
              } catch {
                dateLabel = String(item.date).slice(5);
              }

              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-end group"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all text-xs font-medium mb-1 bg-black text-white px-2 py-1 rounded shadow">
                    {item.count} clicks
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400 transition-all duration-300 cursor-pointer"
                    style={{
                      height: `${Math.max(barHeight, 4)}px`,
                    }}
                  />

                  {/* ✅ FIXED DATE LABEL (no rotation) */}
                  {(data.length <= 14 ||
                    i % Math.ceil(data.length / 10) === 0) && (
                    <span className="mt-2 text-[11px] text-muted-foreground text-center whitespace-nowrap">
                      {dateLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}