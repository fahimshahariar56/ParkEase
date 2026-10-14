import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Car, MapPin, User, CalendarCheck, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { RouteTransition } from '../components/ui/RouteTransition';

export const CustomerLayout = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenu, setMobileMenu] = useState({ pathname: location.pathname, open: false });
  const mobileMenuOpen = mobileMenu.open && mobileMenu.pathname === location.pathname;
  const setMobileMenuOpen = useCallback(
    (open) => setMobileMenu({ pathname: location.pathname, open }),
    [location.pathname],
  );
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const menuTrigger = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusableElements = drawerRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuTrigger?.focus();
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

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
    <div className="min-h-screen bg-transparent text-text flex flex-col font-sans selection:bg-text/15 selection:text-text">
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
                    relative flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-medium transition-colors
                    ${isActive
                      ? 'bg-surface-raised text-text border border-border shadow-subtle'
                      : 'text-text-muted hover:text-text hover:bg-surface-raised/60 border border-transparent'}
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId={shouldReduceMotion ? undefined : 'customer-active-route'}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                      className="absolute inset-y-2 left-0 w-0.5 bg-text"
                      aria-hidden="true"
                    />
                  )}
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
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn border border-border text-text-muted hover:text-text bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Toggle customer navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="customer-mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </header>

      {/* Keep the fixed drawer outside the sticky, backdrop-filtered header. */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <motion.button
              type="button"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
              aria-label="Close customer navigation"
            />
            <motion.aside
              ref={drawerRef}
              id="customer-mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Customer navigation"
              initial={shouldReduceMotion ? false : { x: -260 }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? undefined : { x: -260 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-surface font-sans shadow-raised"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                    <Car className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm tracking-tight text-text leading-tight">
                      ParkEase
                    </span>
                    <span className="text-[10px] text-text-muted leading-tight">Customer Portal</span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-btn text-text-muted hover:text-text hover:bg-surface-raised focus-visible:outline-2"
                  aria-label="Close customer navigation"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Mobile Customer Navigation">
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
                        relative flex items-center gap-3 px-3 py-2.5 rounded-btn text-[13px] font-medium transition-colors
                        ${isActive
                          ? 'bg-surface-raised text-text font-semibold border border-border'
                          : 'text-text-muted hover:text-text hover:bg-surface-raised/60 border border-transparent'}
                      `}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : 'customer-mobile-active-route'}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                          className="absolute inset-y-2 left-0 w-0.5 bg-text"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border bg-surface-subtle/40">
                <div className="mb-3 min-w-0 text-xs">
                  <div className="font-semibold text-text truncate">{user?.fullName || 'Customer'}</div>
                  <div className="text-[10px] font-mono text-text-muted truncate">{user?.email}</div>
                </div>
                <Button variant="outline" size="sm" fullWidth icon={LogOut} onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <RouteTransition transitionKey={location.pathname}>
          <Outlet />
        </RouteTransition>
      </main>
    </div>
  );
};
