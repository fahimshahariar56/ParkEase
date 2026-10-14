import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Car, Menu, X, ArrowRight, ShieldCheck, Sparkles, Route, Info } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button } from '../components/ui/Button';
import { HalftoneWordmarkFooter } from '../components/ui/halftone-wordmark-footer';
import { RouteTransition } from '../components/ui/RouteTransition';

export const PublicLayout = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenu, setMobileMenu] = useState(() => ({ pathname: location.pathname, open: false }));
  const mobileMenuOpen = mobileMenu.open && mobileMenu.pathname === location.pathname;
  const setMobileMenuOpen = React.useCallback(
    (open) => setMobileMenu({ pathname: location.pathname, open }),
    [location.pathname],
  );
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const navLinks = [
    { label: 'Features', path: '/features', icon: Sparkles },
    { label: 'How It Works', path: '/how-it-works', icon: Route },
    { label: 'About', path: '/about', icon: Info },
  ];

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const menuTrigger = menuButtonRef.current;
    const openedPath = location.pathname;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenu({ pathname: openedPath, open: false });
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = drawerRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuTrigger?.focus();
    };
  }, [location.pathname, mobileMenuOpen, setMobileMenu]);

  return (
    <div className="min-h-screen bg-transparent text-text flex flex-col font-sans selection:bg-text/15 selection:text-text">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text group-hover:border-text/30 transition-colors">
              <Car className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-text leading-none">
                ParkEase
              </span>
              <span className="text-[10px] text-text-muted leading-tight font-normal mt-0.5">
                Smart Parking
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Public Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    relative py-2 transition-colors
                    ${isActive
                      ? 'text-text font-semibold'
                      : 'text-text-muted hover:text-text'}
                  `}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId={shouldReduceMotion ? undefined : 'public-active-route'}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-text"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/parking">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Find Parking
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn border border-border text-text-muted hover:text-text bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-drawer"
            >
              <Menu className="w-4 h-4" />
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
              aria-label="Close navigation menu"
            />
            <motion.aside
              ref={drawerRef}
              id="public-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Public navigation"
              initial={shouldReduceMotion ? false : { x: -260 }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? undefined : { x: -260 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-surface font-sans shadow-raised"
            >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-surface-raised text-text">
                  <Car className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold tracking-tight text-text">ParkEase</span>
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-btn p-2 text-text-muted hover:bg-surface-raised hover:text-text focus-visible:outline-2"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav
              className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
              aria-label="Mobile Public Navigation"
            >
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-text-muted">
                Explore ParkEase
              </p>
              {navLinks.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-btn border px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-border bg-surface-raised text-text font-semibold'
                        : 'border-transparent text-text-muted hover:bg-surface-raised/60 hover:text-text'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-btn border border-transparent px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-raised/60 hover:text-text"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Admin Portal</span>
              </Link>
            </nav>

            <div className="space-y-3 border-t border-border bg-surface-subtle/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Theme</span>
                <ThemeToggle />
              </div>
              <div className="space-y-2 border-t border-border/60 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-full items-center justify-center rounded-btn border border-border bg-surface-raised px-3 text-xs font-medium text-text transition-colors hover:border-text/20 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/parking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-btn border border-text bg-text px-3 text-xs font-medium text-bg transition-colors hover:bg-text/90 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Find Parking
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1">
        <RouteTransition transitionKey={location.pathname}>
          <Outlet />
        </RouteTransition>
      </main>

      {/* Footer */}
      {location.pathname === '/' ? (
        <HalftoneWordmarkFooter />
      ) : (
        <footer className="border-t border-border bg-surface text-text-muted text-xs py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>ParkEase Smart Parking System • Academic Database Project</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 font-medium">
              <Link to="/features" className="hover:text-text transition-colors">Features</Link>
              <Link to="/how-it-works" className="hover:text-text transition-colors">How It Works</Link>
              <Link to="/about" className="hover:text-text transition-colors">About</Link>
              <Link to="/parking" className="hover:text-text transition-colors">Find Parking</Link>
              <Link to="/login" className="hover:text-text transition-colors">Sign In</Link>
              <Link to="/admin" className="hover:text-text transition-colors">Admin Console</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
