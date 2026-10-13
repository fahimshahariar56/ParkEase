import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User, Mail, Key, Phone, Eye, EyeOff, UserPlus, ParkingSquare,
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
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
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [serverError, setServerError]   = useState('');

  const navigate  = useNavigate();
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

    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errors.fullName = 'Full name must be at least 2 characters.';

    if (!form.email.trim() || !emailRegex.test(form.email.trim()))
      errors.email = 'Enter a valid email address.';

    if (form.phone && !/^[\d\s\-+()]{6,20}$/.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number.';

    if (!form.password)
      errors.password = 'Password is required.';
    else if (form.password.length < 8)
      errors.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword)
      errors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Passwords do not match.';

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
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        phone:    form.phone.trim() || undefined,
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
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-14 bg-bg font-mono">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-7"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
          <ParkingSquare className="w-5 h-5 text-brand" />
          <span className="text-lg font-bold text-text">ParkEase</span>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text">Create your account</h1>
          <p className="text-xs text-text-muted">
            Public registration creates customer accounts only.
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
              id="reg-fullname"
              label="Full Name"
              icon={User}
              placeholder="Jane Smith"
              value={form.fullName}
              onChange={set('fullName')}
              error={fieldErrors.fullName}
              disabled={isLoading}
              required
              autoComplete="name"
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
              placeholder="+880 1XXX-XXXXXX (optional)"
              value={form.phone}
              onChange={set('phone')}
              error={fieldErrors.phone}
              disabled={isLoading}
              autoComplete="tel"
            />

            {/* Password with show/hide */}
            <div className="relative">
              <Input
                id="reg-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                icon={Key}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                error={fieldErrors.password}
                helperText={!fieldErrors.password ? 'Encrypted using bcrypt on the server.' : undefined}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text transition-colors"
                tabIndex={0}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm password with show/hide */}
            <div className="relative">
              <Input
                id="reg-confirm-password"
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                icon={Key}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                error={fieldErrors.confirmPassword}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text transition-colors"
                tabIndex={0}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              icon={UserPlus}
              isLoading={isLoading}
              disabled={isLoading}
              id="register-submit-btn"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs text-text-muted">
            <span>Already have an account? </span>
            <Link to="/login" className="text-brand hover:underline font-bold">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
