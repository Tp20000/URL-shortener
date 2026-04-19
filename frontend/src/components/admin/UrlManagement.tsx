import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { adminAPI } from '@/lib/api';
import {
  Search, Loader2, ExternalLink, Power, Trash2,
  LinkIcon, MousePointerClick, User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function UrlManagement() {
  const [urls, setUrls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.listUrls(page, 10, search, activeFilter || undefined);
      setUrls(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch {
      toast.error('Failed to load URLs');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggle = async (urlId: string) => {
    try {
      const res = await adminAPI.toggleUrl(urlId);
      const status = res.data.data.isActive ? 'activated' : 'deactivated';
      toast.success(`URL ${status}`);
      fetchUrls();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle URL');
    }
  };

  const handleDelete = async (urlId: string) => {
    if (!confirm('Delete this URL? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUrl(urlId);
      toast.success('URL deleted');
      fetchUrls();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search URLs, aliases, titles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <Select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="w-full sm:w-36"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : urls.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No URLs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {urls.map((url) => (
            <Card key={url.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">
                        {url.title || url.shortCode}
                      </span>
                      <Badge variant={url.isActive ? 'success' : 'destructive'}>
                        {url.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {url.customAlias && (
                        <Badge variant="outline">{url.customAlias}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {url.originalUrl}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />
                        {url.clickCount} clicks
                      </span>
                      {url.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {url.user.name} ({url.user.email})
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" title={url.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(url.id)}>
                      <Power className={`h-4 w-4 ${url.isActive ? 'text-orange-600' : 'text-green-600'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(url.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}