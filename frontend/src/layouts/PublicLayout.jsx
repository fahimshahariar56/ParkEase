import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button } from '../components/ui/Button';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-text/15 selection:text-text">
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
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-muted font-medium">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-text transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
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
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn border border-border text-text-muted hover:text-text bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-b border-border bg-surface-raised px-4 pt-3 pb-5 space-y-3 overflow-hidden"
            >
              <div className="flex flex-col space-y-1 text-sm text-text-muted font-medium">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-sm hover:bg-surface hover:text-text transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link to="/parking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth icon={ArrowRight} iconPosition="right">
                    Find Parking
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface text-text-muted text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>ParkEase Smart Parking System • Academic Database Project</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/parking" className="hover:text-text transition-colors">Find Parking</Link>
            <Link to="/login" className="hover:text-text transition-colors">Customer Portal</Link>
            <Link to="/admin" className="hover:text-text transition-colors">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
