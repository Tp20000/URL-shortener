import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Link2, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Link2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Shortly</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              {user?.role === 'ADMIN' && (
                <Button variant="ghost" onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
              <div className="flex items-center space-x-2 ml-2 pl-4 border-l">
                <span className="text-sm text-muted-foreground">
                  {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              {user?.role === 'ADMIN' && (
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/admin'); setMobileOpen(false); }}>
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
              <Button className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Get Started</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}