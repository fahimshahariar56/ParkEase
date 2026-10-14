import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  CalendarCheck,
  ArrowRightLeft,
  CreditCard,
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
import { Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { RouteTransition } from '../components/ui/RouteTransition';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Parking Lots', path: '/admin/lots', icon: Building2 },
    { label: 'Parking Slots', path: '/admin/slots', icon: Grid3X3 },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Entry / Exit', path: '/admin/sessions', icon: ArrowRightLeft },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Pricing Rules', path: '/admin/pricing', icon: DollarSign },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const currentNavItem = adminNav.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-transparent text-text flex font-sans selection:bg-text/15 selection:text-text">
      
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface flex-shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
              <Car className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-text leading-tight">
                ParkEase
              </span>
              <span className="text-[10px] text-text-muted leading-tight font-normal">
                Operations Console
              </span>
            </div>
          </Link>
          <Badge variant="pending" size="sm" showDot={false}>
            ADMIN
          </Badge>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium transition-colors
                  ${isActive
                    ? 'bg-surface-raised text-text font-semibold border border-border shadow-subtle'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised/60 border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Controls */}
        <div className="p-4 border-t border-border space-y-3 bg-surface-subtle/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-text truncate">
                  {user?.fullName || 'Admin Operator'}
                </div>
                <div className="text-[10px] font-mono text-text-muted truncate">
                  {user?.email || 'admin@parkease.io'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleSignOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="px-2 text-text-muted hover:text-status-occupied"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-btn border border-border text-text-muted hover:text-text bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs font-medium text-text-muted flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-status-pending" aria-hidden="true" />
              <span className="hidden sm:inline">Admin Management</span>
              <span className="text-border" aria-hidden="true">/</span>
              <span className="text-text font-semibold">
                {currentNavItem?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex">
              <Badge variant="available" size="sm">
                System Live
              </Badge>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <RouteTransition transitionKey={location.pathname}>
            <Outlet />
          </RouteTransition>
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
              transition={{ duration: 0.15 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-64 bg-surface border-r border-border flex flex-col h-full z-10 font-sans shadow-raised"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-sm tracking-tight text-text">
                    ParkEase Admin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-btn text-text-muted hover:text-text hover:bg-surface-raised focus-visible:outline-2"
                  aria-label="Close sidebar navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Mobile Admin Navigation">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium transition-colors
                        ${isActive
                          ? 'bg-surface-raised text-text font-semibold border border-border'
                          : 'text-text-muted hover:text-text hover:bg-surface-raised/60'}
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border bg-surface-subtle/40">
                <Button variant="outline" size="sm" fullWidth icon={LogOut} onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
