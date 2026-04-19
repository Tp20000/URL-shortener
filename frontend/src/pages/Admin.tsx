import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SystemStats } from '@/components/admin/SystemStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { UrlManagement } from '@/components/admin/UrlManagement';
import { BarChart3, Users, Link2, Shield } from 'lucide-react';

export default function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage users, URLs, and monitor system health
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats">
        <TabsList className="w-full sm:w-auto flex">
          <TabsTrigger value="stats" className="flex-1 sm:flex-none">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="urls" className="flex-1 sm:flex-none">
            <Link2 className="mr-2 h-4 w-4" />
            URLs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <SystemStats />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="urls">
          <UrlManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}