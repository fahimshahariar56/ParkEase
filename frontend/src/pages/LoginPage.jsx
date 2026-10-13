import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Key, LogIn, Shield, UserCheck } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setDemoRole } = useAuth();

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = (e) => {
    e.preventDefault();
    const isAdmin = email.toLowerCase().includes('admin');
    const authUser = {
      id: isAdmin ? 99 : 1,
      fullName: isAdmin ? 'Admin Supervisor' : 'Shahariar Ahammad Fahim',
      email: email.trim().toLowerCase(),
      role: isAdmin ? 'ADMIN' : 'CUSTOMER',
    };
    login(isAdmin ? 'demo_admin_jwt_token' : 'demo_customer_jwt_token', authUser);

    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    } else {
      navigate(isAdmin ? '/admin' : '/parking', { replace: true });
    }
  };

  const handleQuickLogin = (role) => {
    setDemoRole(role);
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    } else {
      navigate(role === 'ADMIN' ? '/admin' : '/parking', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-text">Sign in to ParkEase</h1>
          <p className="text-xs text-text-muted">
            Access your customer parking account or admin console.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="customer@parkease.io (or admin@parkease.io)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Key}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth icon={LogIn}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Role Switcher for Evaluating Route Guards */}
          <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
            <span className="text-[11px] text-text-muted block text-center font-medium">
              Quick Role Evaluation (Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={UserCheck}
                onClick={() => handleQuickLogin('CUSTOMER')}
              >
                As Customer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Shield}
                onClick={() => handleQuickLogin('ADMIN')}
              >
                As Admin
              </Button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border/60 text-center text-xs text-text-muted">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-brand hover:underline font-bold">
              Register Customer
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
