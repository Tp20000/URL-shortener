import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AuthLayout({
  children,
  requireAuth = false,
  requireAdmin = false,
}: AuthLayoutProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}