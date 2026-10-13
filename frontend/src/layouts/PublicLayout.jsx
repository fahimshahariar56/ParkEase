import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button } from '../components/ui/Button';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Benefits', href: '/#benefits' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-mono selection:bg-brand/20 selection:text-brand">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-bg/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-input bg-brand/10 border border-brand/30 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-text leading-none">
                Park<span className="text-brand">Ease</span>
              </span>
              <span className="text-[10px] text-text-muted leading-tight font-medium">Smart Parking</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-muted">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-text transition-colors hover:border-b-2 hover:border-brand py-1"
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
              className="p-2 rounded-input border border-border text-text-muted hover:text-text bg-surface-raised"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border bg-surface-raised px-4 pt-3 pb-5 space-y-3 overflow-hidden"
            >
              <div className="flex flex-col space-y-2 text-sm text-text-muted">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-input hover:bg-surface hover:text-text transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
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
      <footer className="border-t border-border/80 bg-surface text-text-muted text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>ParkEase Smart Parking System • Academic Database Project</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/parking" className="hover:text-text transition-colors">Find Parking</Link>
            <Link to="/login" className="hover:text-text transition-colors">Customer Portal</Link>
            <Link to="/admin" className="hover:text-brand transition-colors">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
