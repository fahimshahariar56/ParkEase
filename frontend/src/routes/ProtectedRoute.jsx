import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button, Spinner } from '../components/ui';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Spinner text="Verifying authentication permissions..." />
      </div>
    );
  }

  // 1. Unauthenticated check
  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith('/admin') || (allowedRoles?.includes('ADMIN') && !allowedRoles?.includes('CUSTOMER'));
    const redirectTarget = isAdminRoute ? '/admin/login' : '/login';
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  // 2. Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(role);
    if (!hasRole) {
      return (
        <div className="min-h-screen bg-transparent text-text font-mono flex items-center justify-center p-4">
          <div className="max-w-md w-full park-card p-6 md:p-8 text-center space-y-6 border-status-occupied/40">
            <div className="w-12 h-12 rounded-full bg-status-occupied/15 text-status-occupied border border-status-occupied/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">403 — Access Denied</h2>
              <p className="text-xs text-text-muted">
                Your account ({role}) is not authorized to access this protected area.
              </p>
            </div>

            <div className="p-3 rounded-input bg-surface-raised border border-border text-xs text-left space-y-1">
              <div><span className="text-text-muted">Current Role:</span> <span className="font-bold text-brand">{role}</span></div>
              <div><span className="text-text-muted">Required Role:</span> <span className="font-bold text-amber-500">{allowedRoles.join(' or ')}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to={role === 'CUSTOMER' ? '/parking' : '/admin'}>
                <Button variant="primary" size="sm" icon={ArrowLeft}>
                  Return to My Portal
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};
