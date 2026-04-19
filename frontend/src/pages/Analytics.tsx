import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import { PieBreakdown } from '@/components/analytics/PieBreakdown';
import { ReferrerTable } from '@/components/analytics/ReferrerTable';
import { analyticsAPI } from '@/lib/api';
import {
  ArrowLeft, ExternalLink, Copy, Check,
  Loader2, Monitor, Globe, Smartphone, Laptop,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await analyticsAPI.getUrlAnalytics(id, days);
      setAnalytics(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load analytics');
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, days, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleCopy = () => {
    if (!analytics) return;
    const shortUrl = analytics.url.customAlias
      ? `${window.location.origin}/${analytics.url.customAlias}`
      : `${window.location.origin}/${analytics.url.shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Analytics not available</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { url, summary, period, clicksOverTime, browsers, operatingSystems, devices, referrers } = analytics;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">
            {url.title || url.shortCode}
          </h1>

          {/* URL info */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">
                {url.customAlias || url.shortCode}
              </span>
              <button onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              {url.customAlias && <Badge variant="outline">Custom Alias</Badge>}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <a
                href={url.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-md"
              >
                {url.originalUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Select
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-36"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummary summary={summary} period={period} />

      {/* Clicks Chart */}
      <div className="mt-6">
        <ClicksChart data={clicksOverTime} />
      </div>

      {/* Breakdowns */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PieBreakdown title="Devices" icon={Smartphone} data={devices} />
        <PieBreakdown title="Browsers" icon={Laptop} data={browsers} />
        <PieBreakdown title="Operating Systems" icon={Monitor} data={operatingSystems} />
      </div>

      {/* Referrers */}
      <div className="mt-6">
        <ReferrerTable data={referrers} />
      </div>

      {/* Raw data summary card */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Link Details</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Short Code: </span>
              <span className="font-medium">{url.shortCode}</span>
            </div>
            {url.customAlias && (
              <div>
                <span className="text-muted-foreground">Alias: </span>
                <span className="font-medium">{url.customAlias}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Created: </span>
              <span className="font-medium">
                {new Date(url.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Period: </span>
              <span className="font-medium">
                {new Date(period.startDate).toLocaleDateString()} →{' '}
                {new Date(period.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}