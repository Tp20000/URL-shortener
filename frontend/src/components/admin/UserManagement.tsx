import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserDetailDialog } from './UserDetailDialog';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Search, Loader2, Eye, Ban, ShieldCheck,
  ShieldOff, Trash2, UserIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.listUsers(page, 10, search);
      setUsers(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await adminAPI.toggleUser(userId);
      const status = res.data.data.isActive ? 'activated' : 'banned';
      toast.success(`User ${status}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle user');
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await adminAPI.changeRole(userId, newRole);
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email} and ALL their data? This cannot be undone.`)) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;

            return (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{user.name}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px]">You</Badge>
                          )}
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? 'success' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Banned'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>{user._count.urls} URLs</span>
                          <span>
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Details"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {!isSelf && user.role !== 'ADMIN' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={user.isActive ? 'Ban User' : 'Unban User'}
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            <Ban className={`h-4 w-4 ${!user.isActive ? 'text-green-600' : 'text-orange-600'}`} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Toggle Role"
                            onClick={() => handleChangeRole(user.id, user.role)}
                          >
                            {user.role === 'ADMIN' ? (
                              <ShieldOff className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete User"
                            onClick={() => handleDelete(user.id, user.email)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
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

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        userId={selectedUserId}
      />
    </div>
  );
}