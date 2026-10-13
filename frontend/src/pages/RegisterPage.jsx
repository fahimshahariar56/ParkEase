import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const { apiRegister, isLoading } = useAuth();
  const { toast } = useToast();

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setServerError('');
  };

  // ── Client-side validation ──────────────────────────────────────────────────
  function validate() {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (form.phone && !/^[\d\s\-+()]{6,20}$/.test(form.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const { user } = await apiRegister({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      toast({
        type: 'success',
        title: 'Account created!',
        message: `Welcome, ${user.fullName}. You are now signed in.`,
      });
      navigate('/parking', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6"
      >
        {/* Page Heading */}
        <div className="text-center space-y-1.5">
          <Badge variant="outline" className="text-[11px] font-mono mb-1">
            CUSTOMER REGISTRATION
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Register as a customer to reserve slots and manage parking sessions.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-surface border-border shadow-sm space-y-5">
          {/* Server-level error feedback banner */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
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
              id="reg-fullname"
              label="Full Name"
              icon={User}
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={set('fullName')}
              error={fieldErrors.fullName}
              disabled={isLoading}
              required
              autoComplete="name"
              autoFocus
            />

            <Input
              id="reg-email"
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={fieldErrors.email}
              disabled={isLoading}
              required
              autoComplete="email"
            />

            <Input
              id="reg-phone"
              label="Phone Number"
              type="tel"
              icon={Phone}
              placeholder="+1 (555) 000-0000 (optional)"
              value={form.phone}
              onChange={set('phone')}
              error={fieldErrors.phone}
              disabled={isLoading}
              autoComplete="tel"
            />

            <Input
              id="reg-password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              icon={Lock}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set('password')}
              error={fieldErrors.password}
              helperText={!fieldErrors.password ? 'Minimum 8 characters. Stored securely with bcrypt hashing.' : undefined}
              disabled={isLoading}
              required
              autoComplete="new-password"
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

            <Input
              id="reg-confirm-password"
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              icon={Lock}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={fieldErrors.confirmPassword}
              disabled={isLoading}
              required
              autoComplete="new-password"
              endAdornment={
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-text-muted hover:text-text transition-colors p-1"
                  tabIndex={0}
                >
                  {showConfirm ? (
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
              icon={UserPlus}
              isLoading={isLoading}
              disabled={isLoading}
              id="register-submit-btn"
              className="mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] text-text-muted text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <span>Registration provisions verified Customer role access.</span>
          </div>

          <div className="pt-4 border-t border-border text-center text-xs text-text-muted">
            <span>Already have an account? </span>
            <Link to="/login" className="text-text font-medium underline hover:text-text-muted transition-colors">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
