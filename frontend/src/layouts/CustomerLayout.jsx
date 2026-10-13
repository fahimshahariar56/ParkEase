import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, User, CalendarCheck, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen bg-bg text-text flex flex-col font-mono selection:bg-brand/20 selection:text-brand">
      {/* Customer Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link to="/parking" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-input bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-text">
                Park<span className="text-brand">Ease</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-brand/10 text-brand border border-brand/30">
              Customer
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-input text-xs font-semibold transition-all
                    ${isActive
                      ? 'bg-brand/10 text-brand border border-brand/30 shadow-subtle'
                      : 'text-text-muted hover:text-text hover:bg-surface-raised border border-transparent'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-text-muted hidden lg:inline">{user?.fullName || user?.email}</span>
            <ThemeToggle />
            <div className="h-5 w-px bg-border" />
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
              className="p-2 rounded-input border border-border text-text-muted hover:text-text bg-surface-raised"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border bg-surface-raised px-4 pt-3 pb-5 space-y-2 overflow-hidden"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2.5 px-3 py-2.5 rounded-input text-xs font-medium transition-colors
                      ${isActive ? 'bg-brand/10 text-brand font-bold border border-brand/30' : 'text-text-muted hover:text-text hover:bg-surface'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border/60">
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
