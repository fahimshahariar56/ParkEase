import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Key, UserPlus } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/parking');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-text-muted">
            Register to reserve slots and manage vehicles. (Public registration creates customer accounts only)
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="customer@example.com"
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
              helperText="Encrypted using bcrypt on server."
              required
            />

            <Button type="submit" variant="primary" fullWidth icon={UserPlus}>
              Register Customer
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs text-text-muted">
            <span>Already have an account? </span>
            <Link to="/login" className="text-brand hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
