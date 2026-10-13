import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Mail, Eye, EyeOff, LogIn, Shield, UserCheck,
  ParkingSquare, Zap, Clock, MapPin,
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

// ─── Micro-feature list shown on the brand panel ─────────────────────────────
const FEATURES = [
  { icon: MapPin,  text: 'Find & reserve slots in seconds' },
  { icon: Clock,   text: 'Real-time availability updates'   },
  { icon: Zap,     text: 'Instant session management'       },
  { icon: Shield,  text: 'Secure, role-aware access'        },
];

export const LoginPage = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate  = useNavigate();
  const location  = useLocation();
  const { apiLogin, isLoading, setDemoRole } = useAuth();
  const { toast } = useToast();

  const redirectPath = location.state?.from?.pathname;

  // ── Client-side validation ──────────────────────────────────────────────────
  function validate() {
    const errors = {};
    if (!email.trim())                   errors.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                                         errors.email    = 'Enter a valid email address.';
    if (!password)                       errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Real API submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const { user } = await apiLogin({ email: email.trim().toLowerCase(), password });
      toast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${user.fullName}.` });
      const dest = redirectPath || '/parking';
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Sign-in failed. Please try again.');
    }
  };

  // ── Demo shortcut (preserved for route guard evaluation) ───────────────────
  const handleQuickLogin = (role) => {
    setDemoRole(role);
    const dest = redirectPath || (role === 'ADMIN' ? '/admin' : '/parking');
    navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-[90vh] flex items-stretch font-mono">
      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-center gap-10 w-[42%] bg-surface px-14 py-16 border-r border-border"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-brand/10 flex items-center justify-center">
            <ParkingSquare className="w-5 h-5 text-brand" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text">ParkEase</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-snug text-text">
            Smart parking,<br />
            <span className="text-brand">effortlessly managed.</span>
          </h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs">
            Reserve slots, manage sessions, and view reports — all in one secure platform.
          </p>
        </div>

        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-text-muted">
              <span className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-brand" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-text-muted/60 mt-auto">
          © {new Date().getFullYear()} ParkEase. All rights reserved.
        </p>
      </motion.div>

      {/* ── Right: Sign-in form ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-1 items-center justify-center px-6 py-14 bg-bg"
      >
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <ParkingSquare className="w-5 h-5 text-brand" />
            <span className="text-lg font-bold text-text">ParkEase</span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20 mb-1">
              Customer Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Sign In</h1>
            <p className="text-xs text-text-muted">
              Access your account to book parking slots and manage reservations.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Server-level error banner */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-input bg-status-occupied/10 border border-status-occupied/30 px-4 py-3 text-xs text-status-occupied font-medium"
                  role="alert"
                >
                  ⚠ {serverError}
                </motion.div>
              )}

              <Input
                id="login-email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); setServerError(''); }}
                error={fieldErrors.email}
                disabled={isLoading}
                required
                autoComplete="email"
              />

              {/* Password with show/hide */}
              <div className="relative">
                <Input
                  id="login-password"
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); setServerError(''); }}
                  error={fieldErrors.password}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-[34px] text-text-muted hover:text-text transition-colors"
                  tabIndex={0}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                icon={LogIn}
                isLoading={isLoading}
                disabled={isLoading}
                id="login-submit-btn"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Demo role switcher */}
            <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
              <span className="text-[11px] text-text-muted block text-center font-medium">
                Quick Role Evaluation — Demo (no real account needed)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserCheck}
                  onClick={() => handleQuickLogin('CUSTOMER')}
                  disabled={isLoading}
                  id="demo-customer-btn"
                >
                  As Customer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Shield}
                  onClick={() => handleQuickLogin('ADMIN')}
                  disabled={isLoading}
                  id="demo-admin-btn"
                >
                  As Admin
                </Button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 text-center text-xs text-text-muted">
              <span>Don&apos;t have an account? </span>
              <Link to="/register" className="text-brand hover:underline font-bold">
                Create a customer account
              </Link>
            </div>

            <div className="pt-2 text-center text-[11px] text-text-muted">
              <span>System Administrator? </span>
              <Link to="/admin/login" className="text-amber-500 hover:underline font-bold">
                Admin Console Login →
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
