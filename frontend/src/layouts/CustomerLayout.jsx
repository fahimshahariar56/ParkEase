import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, User, CalendarCheck, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Find Parking', path: '/parking', icon: MapPin },
    { label: 'Reservations', path: '/reservations', icon: CalendarCheck },
    { label: 'Profile & Vehicles', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-text/15 selection:text-text">
      {/* Customer Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link to="/parking" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text group-hover:border-text/30 transition-colors">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base tracking-tight text-text leading-none">
                ParkEase
              </span>
            </Link>
            <Badge variant="neutral" size="sm" showDot={false}>
              Customer
            </Badge>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Customer Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-medium transition-colors
                    ${isActive
                      ? 'bg-surface-raised text-text border border-border shadow-subtle'
                      : 'text-text-muted hover:text-text hover:bg-surface-raised/60 border border-transparent'}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-text-muted font-normal hidden lg:inline max-w-[200px] truncate">
              {user?.fullName || user?.email}
            </span>
            <ThemeToggle />
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleSignOut}
              className="text-text-muted hover:text-status-occupied"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn border border-border text-text-muted hover:text-text bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-b border-border bg-surface-raised px-4 pt-3 pb-5 space-y-2 overflow-hidden"
            >
              <div className="px-2 py-1 text-xs text-text-muted border-b border-border mb-2">
                Signed in as <span className="text-text font-medium">{user?.fullName || user?.email}</span>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-medium transition-colors
                      ${isActive
                        ? 'bg-surface text-text font-semibold border border-border'
                        : 'text-text-muted hover:text-text hover:bg-surface/50'}
                    `}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border">
                <Button variant="outline" size="sm" fullWidth icon={LogOut} onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
