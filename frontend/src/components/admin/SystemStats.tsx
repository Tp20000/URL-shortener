import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/api';
import {
  Users, Link2, MousePointerClick, TrendingUp,
  Activity, Clock, Loader2, Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function SystemStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data);
    } catch (err: any) {
      toast.error('Failed to load system stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total URLs',
      value: stats.urls.total,
      subtitle: `${stats.urls.active} active`,
      icon: Link2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Clicks',
      value: stats.clicks.total,
      subtitle: `${stats.clicks.last24h} last 24h`,
      icon: MousePointerClick,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Clicks (7d)',
      value: stats.clicks.last7Days,
      subtitle: `${stats.clicks.last30Days} last 30d`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'New Users Today',
      value: stats.users.newToday,
      subtitle: `${stats.users.newLast7Days} last 7d`,
      icon: Activity,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      title: 'URLs Created Today',
      value: stats.urls.createdToday,
      subtitle: 'new today',
      icon: Clock,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
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

      {/* Top URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top URLs (All Time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No URLs yet
            </p>
          ) : (
            <div className="space-y-3">
              {stats.topUrls.map((url: any, i: number) => (
                <div
                  key={url.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {url.title || url.shortCode}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {url.originalUrl}
                      </p>
                      {url.user && (
                        <p className="text-xs text-muted-foreground">
                          by {url.user.name} ({url.user.email})
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {url.clickCount} clicks
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-5 w-5 text-primary" />
            Top Users (by URL count)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users yet
            </p>
          ) : (
            <div className="space-y-2">
              {stats.topUsers.map((user: any, i: number) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                    <Badge variant="secondary">{user._count.urls} URLs</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}