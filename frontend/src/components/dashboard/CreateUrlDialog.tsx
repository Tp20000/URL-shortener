import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { urlAPI } from '@/lib/api';
import { Link2, Sparkles, Clock, Type } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateUrlDialog({ open, onOpenChange, onCreated }: CreateUrlDialogProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetForm = () => {
    setOriginalUrl('');
    setCustomAlias('');
    setTitle('');
    setExpiresAt('');
    setShowAdvanced(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setIsLoading(true);
    try {
      const data: any = { originalUrl };
      if (customAlias.trim()) data.customAlias = customAlias.trim();
      if (title.trim()) data.title = title.trim();
      if (expiresAt) data.expiresAt = new Date(expiresAt).toISOString();

      await urlAPI.create(data);
      toast.success('Short URL created!');
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Create Short URL
          </DialogTitle>
          <DialogDescription>
            Shorten a long URL with optional customization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Destination URL *</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com/very-long-url..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  <Type className="h-3 w-3" /> Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="My awesome link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Custom Alias */}
              <div className="space-y-2">
                <Label htmlFor="alias" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Custom Alias
                </Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    shortly/
                  </span>
                  <Input
                    id="alias"
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Letters, numbers, hyphens, underscores. Min 3 characters.
                </p>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expires" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Expiration Date
                </Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Short URL'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}