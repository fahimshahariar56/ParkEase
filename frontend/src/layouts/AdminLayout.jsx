import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  CalendarCheck,
  ArrowRightLeft,
  Users,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Car,
} from 'lucide-react';
import { ThemeToggle } from '../components/navigation/ThemeToggle';
import { Button } from '../components/ui/Button';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Parking Lots', path: '/admin/lots', icon: Building2 },
    { label: 'Parking Slots', path: '/admin/slots', icon: Grid3X3 },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Entry / Exit', path: '/admin/sessions', icon: ArrowRightLeft },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Pricing Rules', path: '/admin/pricing', icon: DollarSign },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex font-mono selection:bg-brand/20 selection:text-brand">
      
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface flex-shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-input bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
              <Car className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-text leading-none">
                Park<span className="text-brand">Ease</span>
              </span>
              <span className="text-[10px] text-text-muted font-medium">Operations Console</span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            ADMIN
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-input text-xs font-medium transition-all
                  ${isActive
                    ? 'bg-brand/15 text-brand font-bold border border-brand/40 shadow-subtle'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Controls */}
        <div className="p-4 border-t border-border space-y-3 bg-surface-subtle/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Theme</span>
            <ThemeToggle />
          </div>
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="font-bold text-text truncate">Admin Operator</div>
                <div className="text-[10px] text-text-muted truncate">admin@parkease.io</div>
              </div>
              <Link to="/login" title="Sign Out">
                <Button variant="ghost" size="sm" icon={LogOut} className="px-2 text-text-muted hover:text-status-occupied" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-input border border-border text-text-muted hover:text-text bg-surface-raised"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-semibold text-text-muted flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Admin Management</span>
              <span className="text-border">/</span>
              <span className="text-text font-bold">
                {adminNav.find((item) => item.path === location.pathname)?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-pill bg-status-available/10 text-status-available border border-status-available/30 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse"></span>
              <span>System Live</span>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay & Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2 }}
              className="relative w-64 bg-surface border-r border-border flex flex-col h-full z-10"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <span className="font-bold text-sm tracking-tight text-text">
                  Park<span className="text-brand">Ease</span> Admin
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded text-text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-input text-xs font-medium transition-colors
                        ${isActive ? 'bg-brand/15 text-brand font-bold border border-brand/40' : 'text-text-muted hover:text-text'}
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border">
                <Link to="/login" onClick={() => setSidebarOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth icon={LogOut}>
                    Sign Out
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
