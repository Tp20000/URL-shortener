import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/api';
import { Loader2, Link2, MousePointerClick } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function UserDetailDialog({ open, onOpenChange, userId }: UserDetailDialogProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUser();
    }
  }, [open, userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getUserDetails(userId);
      setUser(res.data.data);
    } catch {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Full user information and recent URLs</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <div className="flex gap-2">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.isActive ? 'success' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {user._count.urls} URLs
                </span>
                <span className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  {user.totalClicks} total clicks
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Recent URLs */}
            <div>
              <h4 className="font-medium mb-2">Recent URLs ({user.urls.length})</h4>
              {user.urls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No URLs created</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {user.urls.map((url: any) => (
                    <div
                      key={url.id}
                      className="flex items-center justify-between rounded border p-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {url.title || url.shortCode}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <Badge
                          variant={url.isActive ? 'success' : 'destructive'}
                          className="text-[10px]"
                        >
                          {url.isActive ? 'Active' : 'Off'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {url.clickCount} clicks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">User not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}