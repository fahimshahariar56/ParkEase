import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import {
  Button,
  Input,
  Card,
  Badge,
  Dialog,
  ToastProvider,
  useToast,
  Skeleton,
  CardSkeleton,
  Spinner,
  EmptyState,
  ErrorState,
} from './components/ui';
import { Search, Mail, Key, Plus, Car, Bell, Check, Sparkles } from 'lucide-react';

function Day4Showcase() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const triggerLoading = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast({
        title: 'Action Succeeded',
        message: 'The simulated asynchronous action has finished.',
        type: 'success',
      });
    }, 1500);
  };

  const validateInput = (val) => {
    setInputValue(val);
    if (val && !val.includes('@')) {
      setInputError('Please enter a valid email address.');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 transition-colors duration-200 font-mono">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-brand font-semibold">ParkEase Primitives</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Day 4 — Shared UI Components</h1>
            <p className="text-text-muted text-sm mt-1">
              Reusable primitives: Buttons, Inputs, Cards, Badges, Dialogs, Toasts, Skeletons & States.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </div>
        </header>

        {/* 1. Buttons Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>1. Buttons & Interaction States</span>
          </h2>
          <div className="park-card p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" icon={Sparkles}>Primary</Button>
              <Button variant="secondary" icon={Car}>Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button
                variant="primary"
                isLoading={btnLoading}
                onClick={triggerLoading}
              >
                Click to Load
              </Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
              <Button size="sm" variant="secondary">Small (sm)</Button>
              <Button size="md" variant="secondary">Medium (md)</Button>
              <Button size="lg" variant="secondary">Large (lg)</Button>
            </div>
          </div>
        </section>

        {/* 2. Form Inputs Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">2. Input Controls & Validation States</h2>
          <div className="park-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Standard Email Input"
              placeholder="user@parkease.io"
              icon={Mail}
              value={inputValue}
              onChange={(e) => validateInput(e.target.value)}
              error={inputError}
              helperText={!inputError ? "We will never share your email." : undefined}
              required
            />
            <Input
              label="Search Parking Slots"
              placeholder="Search lot, zone, or plate number..."
              icon={Search}
            />
            <Input
              label="Password Field"
              type="password"
              placeholder="••••••••••••"
              icon={Key}
              helperText="Minimum 8 characters with bcrypt security."
            />
            <Input
              label="Disabled Control"
              placeholder="Read-only or restricted field"
              disabled
              value="SYS-AUTOLOCKED-SLOT"
            />
          </div>
        </section>

        {/* 3. Badges Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">3. Semantic Badges & Slot States</h2>
          <div className="park-card p-6 flex flex-wrap gap-3">
            <Badge variant="available">Available (Free)</Badge>
            <Badge variant="pending">Pending Reservation</Badge>
            <Badge variant="occupied">Occupied (Session Active)</Badge>
            <Badge variant="maintenance">Maintenance</Badge>
            <Badge variant="info">Fast Charger</Badge>
            <Badge variant="brand">VIP Reserved</Badge>
            <Badge variant="neutral">Standard Compact</Badge>
          </div>
        </section>

        {/* 4. Dialog & Toasts Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">4. Overlays, Dialogs & Feedback Toasts</h2>
          <div className="park-card p-6 flex flex-wrap gap-4 items-center">
            <Button
              variant="primary"
              onClick={() => setIsDialogOpen(true)}
            >
              Open Confirmation Dialog
            </Button>
            <Button
              variant="secondary"
              icon={Check}
              onClick={() => toast({ title: 'Slot Reserved', message: 'Slot #A-104 locked for 15 minutes.', type: 'success' })}
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              icon={Bell}
              onClick={() => toast({ title: 'Payment Simulated', message: 'Demo transaction completed safely.', type: 'info' })}
            >
              Info Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast({ title: 'Slot Unavailable', message: 'Slot was taken by another user.', type: 'error' })}
            >
              Error Toast
            </Button>
          </div>
        </section>

        {/* 5. Cards & State Indicators */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">5. Card Variants, Loading & Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              title="Slot #A-101"
              subtitle="Level 1 • Compact Car"
              headerAction={<Badge variant="available">Available</Badge>}
              footer={<span className="text-xs text-text-muted">$3.50/hr rate</span>}
            >
              <div className="text-xs space-y-2 text-text-muted">
                <p>Sensor Health: Optimal</p>
                <p>Distance to Exit: 45 meters</p>
              </div>
            </Card>

            <Card
              variant="interactive"
              title="Interactive Card"
              subtitle="Hover to elevate"
              headerAction={<Badge variant="brand">Click Me</Badge>}
              onClick={() => toast({ title: 'Card Clicked', message: 'Interactive card trigger fired.', type: 'info' })}
            >
              <p className="text-xs text-text-muted">
                Provides subtle elevation lift, border highlight, and active press scale.
              </p>
            </Card>

            <Card
              variant="raised"
              title="Elevated Summary"
              subtitle="High-priority card"
            >
              <p className="text-xs text-text-muted">
                Elevated background surface with deep contrast for dashboard analytics.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <EmptyState
              title="No Vehicles Registered"
              description="You have not added any vehicles yet. Register a vehicle to begin booking slots."
              actionLabel="Add New Vehicle"
              actionIcon={Plus}
              onAction={() => toast({ title: 'Add Vehicle', message: 'Vehicle modal trigger simulated.', type: 'info' })}
            />

            <ErrorState
              title="Failed to Load Availability"
              message="The parking slot status service could not be reached. Check network connection."
              onRetry={() => toast({ title: 'Retrying...', message: 'Connecting to server...', type: 'info' })}
            />
          </div>

          <div className="park-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-text">Skeleton Shimmer Loader</h3>
            <CardSkeleton count={1} />
          </div>
        </section>

        {/* Reusable Dialog Instance */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Confirm Slot Reservation"
          description="Review reservation details before locking the slot."
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsDialogOpen(false);
                  toast({
                    title: 'Reservation Confirmed',
                    message: 'Slot reserved successfully for demonstration.',
                    type: 'success',
                  });
                }}
              >
                Confirm Booking
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs text-text">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Selected Slot:</span>
              <span className="font-bold">#A-102 (Standard Car)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Hourly Rate:</span>
              <span className="font-bold">$4.00 / hour</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Simulated Payment:</span>
              <span className="text-brand font-bold">DEMO PAYMENT — NO REAL MONEY</span>
            </div>
          </div>
        </Dialog>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Day4Showcase />
      </ToastProvider>
    </ThemeProvider>
  );
}
