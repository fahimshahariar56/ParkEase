import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

// Micro-features shown on the left editorial panel on desktop
const SYSTEM_BENEFITS = [
  {
    icon: CheckCircle2,
    title: 'Time-specific availability',
    desc: 'Check slot availability for the time window you plan to park.',
  },
  {
    icon: Clock,
    title: 'Server-confirmed reservation',
    desc: 'Your booking is confirmed only after the server accepts the request.',
  },
  {
    icon: Shield,
    title: 'Protected Access',
    desc: 'Role-based JWT authorization with bcrypt credential hashing.',
  },
];

export const LoginPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { apiLogin, isLoading } = useAuth();
  const { toast } = useToast();

  const requestedPath = location.state?.from?.pathname;
  const redirectPath = ['/parking', '/reservations', '/profile'].includes(requestedPath)
    ? requestedPath
    : '/parking';
  const redirectTo = ['/parking', '/reservations', '/profile'].includes(requestedPath)
    ? {
      pathname: redirectPath,
      search: typeof location.state?.from?.search === 'string' ? location.state.from.search : '',
      hash: typeof location.state?.from?.hash === 'string' ? location.state.from.hash : '',
    }
    : redirectPath;

  // ── Client-side validation ──────────────────────────────────────────────────
  function validate() {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Real API submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      const { user } = await apiLogin({
        email: email.trim().toLowerCase(),
        password,
      });
      toast({
        type: 'success',
        title: 'Welcome back!',
        message: `Signed in as ${user.fullName}.`,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Sign-in failed. Please verify your credentials.');
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── Left: Value Overview (Desktop) ──────────────────────────────── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-8 pr-4"
        >
          <div className="space-y-3">
            <Badge variant="outline" className="text-[11px] font-mono tracking-wider">
              CUSTOMER PORTAL
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-text leading-tight">
              Smart parking,
              <br />
              <span className="text-text-muted">effortlessly managed.</span>
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Find facilities, manage vehicles, and review your reservation history from one account.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {SYSTEM_BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center flex-shrink-0 text-text mt-0.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-text">{title}</h2>
                  <p className="text-xs text-text-muted leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/60">
            <Link
              to="/parking"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors font-medium group"
            >
              <span>Browse parking facilities</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* ── Right: Authentication Card ──────────────────────────────────── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className="lg:col-span-7 w-full max-w-md mx-auto"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6 space-y-1.5">
            <Badge variant="outline" className="text-[11px] font-mono mb-1">
              CUSTOMER PORTAL
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Sign in to ParkEase</h1>
            <p className="text-xs text-text-muted">
              Find facilities, submit reservations, and manage registered vehicles.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-surface border-border shadow-sm space-y-5">
            <div className="hidden lg:block space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-text">Sign In</h2>
              <p className="text-xs text-text-muted">
                Enter your credentials to continue to your account.
              </p>
            </div>

            {/* Server-level error feedback banner */}
            {serverError && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-input bg-status-occupied/10 border border-status-occupied/30 p-3.5 text-xs text-status-occupied flex items-start gap-2.5"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                  setServerError('');
                }}
                error={fieldErrors.email}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />

              <Input
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                  setServerError('');
                }}
                error={fieldErrors.password}
                disabled={isLoading}
                required
                autoComplete="current-password"
                endAdornment={
                  <button
                    type="button"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass((v) => !v)}
                    className="text-text-muted hover:text-text transition-colors p-1"
                    tabIndex={0}
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                icon={LogIn}
                isLoading={isLoading}
                disabled={isLoading}
                id="login-submit-btn"
                className="mt-2"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Bottom Navigation Links */}
            <div className="pt-4 border-t border-border text-center text-xs text-text-muted space-y-2">
              <p>
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-text font-medium underline hover:text-text-muted transition-colors"
                >
                  Create customer account
                </Link>
              </p>
              <p className="pt-1 text-[11px]">
                Operating as facility staff?{' '}
                <Link
                  to="/admin/login"
                  className="font-mono text-text-muted hover:text-text underline transition-colors"
                >
                  Admin Console Login →
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
