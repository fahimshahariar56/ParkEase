import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, LogIn, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.toLowerCase().includes('admin')) {
      navigate('/admin');
    } else {
      navigate('/parking');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to ParkEase</h1>
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
              placeholder="user@parkease.io (or admin@parkease.io)"
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

          <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs text-text-muted">
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
