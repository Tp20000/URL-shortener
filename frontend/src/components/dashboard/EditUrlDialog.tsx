import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { urlAPI } from '@/lib/api';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface UrlData {
  id: string;
  originalUrl: string;
  title: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

interface EditUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: UrlData | null;
  onUpdated: () => void;
}

export function EditUrlDialog({ open, onOpenChange, url, onUpdated }: EditUrlDialogProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (url) {
      setOriginalUrl(url.originalUrl);
      setTitle(url.title || '');
      setExpiresAt(
        url.expiresAt
          ? new Date(url.expiresAt).toISOString().slice(0, 16)
          : ''
      );
      setIsActive(url.isActive);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const data: any = {
        originalUrl,
        title: title || undefined,
        isActive,
      };

      if (expiresAt) {
        data.expiresAt = new Date(expiresAt).toISOString();
      } else {
        data.expiresAt = null;
      }

      await urlAPI.update(url.id, data);
      toast.success('URL updated!');
      onOpenChange(false);
      onUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit URL
          </DialogTitle>
          <DialogDescription>
            Update destination, title, or expiration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-url">Destination URL</Label>
            <Input
              id="edit-url"
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="Optional title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expires">Expiration</Label>
            <Input
              id="edit-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            {expiresAt && (
              <button
                type="button"
                onClick={() => setExpiresAt('')}
                className="text-xs text-destructive hover:underline"
              >
                Remove expiration
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}