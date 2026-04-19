import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { UrlCard } from '@/components/dashboard/UrlCard';
import { CreateUrlDialog } from '@/components/dashboard/CreateUrlDialog';
import { EditUrlDialog } from '@/components/dashboard/EditUrlDialog';
import { QRDialog } from '@/components/dashboard/QRDialog';
import { analyticsAPI, urlAPI } from '@/lib/api';
import { Plus, Search, Loader2, LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  // Stats
  const [stats, setStats] = useState({
    totalUrls: 0,
    activeUrls: 0,
    totalClicks: 0,
    clicksToday: 0,
    clicksLast7Days: 0,
    clicksLast30Days: 0,
  });

  // URLs
  const [urls, setUrls] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setStats(res.data.data.overview);
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, []);

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await urlAPI.list(page, 10);
      setUrls(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load URLs');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchStats();
    fetchUrls();
  }, [fetchStats, fetchUrls]);

  const handleCreated = () => {
    fetchStats();
    fetchUrls();
  };

  const handleEdit = (url: any) => {
    setSelectedUrl(url);
    setEditOpen(true);
  };

  const handleQR = (url: any) => {
    setSelectedUrl(url);
    setQrOpen(true);
  };

  const handleUpdated = () => {
    fetchUrls();
    fetchStats();
  };

  const handleDeleted = () => {
    fetchUrls();
    fetchStats();
  };

  // Simple client-side search filter
  const filteredUrls = search
    ? urls.filter(
        (u) =>
          u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
          u.shortCode.toLowerCase().includes(search.toLowerCase()) ||
          (u.title && u.title.toLowerCase().includes(search.toLowerCase())) ||
          (u.customAlias && u.customAlias.toLowerCase().includes(search.toLowerCase()))
      )
    : urls;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your shortened URLs
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Short URL
        </Button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* URL List Section */}
      <div className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Links</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUrls.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No links yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {search
                ? 'No links match your search'
                : 'Create your first short URL to get started'}
            </p>
            {!search && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Link
              </Button>
            )}
          </div>
        ) : (
          /* URL Cards */
          <div className="space-y-3">
            {filteredUrls.map((url) => (
              <UrlCard
                key={url.id}
                url={url}
                onEdit={handleEdit}
                onQR={handleQR}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateUrlDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
      <EditUrlDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        url={selectedUrl}
        onUpdated={handleUpdated}
      />
      <QRDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        urlId={selectedUrl?.id || ''}
        shortUrl={selectedUrl?.shortUrl || ''}
      />
    </div>
  );
}