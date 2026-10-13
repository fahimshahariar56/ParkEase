import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Terminal,
  Car,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Shield,
  Server,
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { ThemeToggle } from '../components/navigation/ThemeToggle';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { apiLoginAdmin, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();

  const redirectPath = location.state?.from?.pathname;

  // If already authenticated as ADMIN, redirect to admin console
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(redirectPath || '/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectPath]);

  // Client-side validation
  function validate() {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Admin email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Admin password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const data = await apiLoginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      toast({
        type: 'success',
        title: 'Authentication Verified',
        message: `Welcome, ${data?.user?.fullName || 'Administrator'}. Console access granted.`,
      });

      const destination = redirectPath || '/admin';
      navigate(destination, { replace: true });
    } catch (err) {
      // Always provide generic, secure invalid-credentials feedback
      const message =
        err.message && err.message.toLowerCase().includes('credential')
          ? err.message
          : 'Invalid admin credentials.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D17] text-slate-100 font-mono flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-amber-500/10 via-brand/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0B1220]/70 backdrop-blur-md px-6 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Car className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-none">
              Park<span className="text-amber-400">Ease</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Administration Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Restricted Zone</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Admin Header Shield Card */}
          <div className="text-center mb-6 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-slate-800/60 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Console Login
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Authorized personnel only. Enter your administrator credentials to access facility operations.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#111C2E]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 opacity-80" />

            {/* Server Error Message */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 flex items-center gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Address */}
              <Input
                id="admin-email"
                label="Administrator Email"
                type="email"
                icon={Mail}
                placeholder="admin@parkease.com"
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

              {/* Password with Show/Hide toggle */}
              <div className="relative">
                <Input
                  id="admin-password"
                  label="Password"
                  type={showPass ? 'text' : 'password'}
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
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition-colors p-1"
                  tabIndex={0}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  icon={LogIn}
                  isLoading={isLoading}
                  disabled={isLoading}
                  id="admin-submit-btn"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20"
                >
                  {isLoading ? 'Verifying Credentials…' : 'Authenticate as Admin'}
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
              <div className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  All login sessions and administrative actions are logged with role verification and IP attribution.
                </span>
              </div>

              {/* Back to Customer Login Link */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Customer? Go to Customer Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-[11px] text-slate-500 relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <span>© {new Date().getFullYear()} ParkEase Operations & Security</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <Link to="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <Link to="/parking" className="hover:text-slate-300 transition-colors">
            Find Parking
          </Link>
          <Link to="/login" className="hover:text-slate-300 transition-colors">
            Customer Portal
          </Link>
        </div>
      </footer>
    </div>
  );
};
