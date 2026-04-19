import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { urlAPI } from '@/lib/api';
import {
  Copy, Check, ExternalLink, BarChart3, QrCode,
  Pencil, Trash2, MoreVertical, Clock, MousePointerClick,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface UrlData {
  id: string;
  shortCode: string;
  originalUrl: string;
  customAlias: string | null;
  title: string | null;
  shortUrl: string;
  isActive: boolean;
  expiresAt: string | null;
  clickCount: number;
  createdAt: string;
}

interface UrlCardProps {
  url: UrlData;
  onEdit: (url: UrlData) => void;
  onQR: (url: UrlData) => void;
  onDeleted: () => void;
}

export function UrlCard({ url, onEdit, onQR, onDeleted }: UrlCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    setDeleting(true);
    try {
      await urlAPI.delete(url.id);
      toast.success('URL deleted');
      onDeleted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  return (
    <Card className={`transition-all hover:shadow-md ${!url.isActive || isExpired ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side */}
          <div className="flex-1 min-w-0">
            {/* Title + Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold truncate">
                {url.title || url.shortCode}
              </h3>
              {url.isActive && !isExpired ? (
                <Badge variant="success">Active</Badge>
              ) : isExpired ? (
                <Badge variant="warning">Expired</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {url.customAlias && (
                <Badge variant="outline">Custom</Badge>
              )}
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-2 mt-2">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline truncate"
              >
                {url.shortUrl}
              </a>
              <button onClick={handleCopy} className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>

            {/* Original URL */}
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              <a
                href={url.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline truncate"
              >
                {url.originalUrl}
              </a>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3 w-3" />
                {url.clickCount} clicks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
              </span>
              {url.expiresAt && (
                <span className="flex items-center gap-1">
                  ⏳ Expires {formatDistanceToNow(new Date(url.expiresAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {/* Right Side — Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/analytics/${url.id}`)}
              title="Analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQR(url)}
              title="QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>

            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border bg-background shadow-lg">
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        onEdit(url);
                        setShowMenu(false);
                      }}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="h-3 w-3" />
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}