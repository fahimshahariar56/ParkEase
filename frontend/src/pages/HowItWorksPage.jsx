import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CalendarCheck,
  Car,
  ArrowRight,
  ShieldAlert,
  Sliders,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const HowItWorksPage = () => {
  const customerSteps = [
    {
      step: '01',
      icon: Search,
      title: 'Discover Compatible Bays',
      subtitle: 'Facility & Slot Search',
      description:
        'Browse facility records and search slots by the supported vehicle category and requested time window.',
    },
    {
      step: '02',
      icon: CalendarCheck,
      title: 'Schedule Your Reservation',
      subtitle: 'Concurrency Checked',
      description:
        'Choose start and end times. The server checks availability and reservation conflicts before returning eligible slots.',
    },
    {
      step: '03',
      icon: CalendarCheck,
      title: 'Confirm the Reservation',
      subtitle: 'Server-checked request',
      description:
        'Submit a reservation request for the selected slot and vehicle. Confirmation is returned only after the server accepts the request.',
    },
    {
      step: '04',
      icon: Car,
      title: 'Review Your Booking',
      subtitle: 'Customer portal',
      description:
        'Review your reservation history in the customer portal. Admins can record entry and exit, with demo payment records handled separately.',
    },
  ];

  const operationalWorkflows = [
    {
      title: 'Facility & Slot Provisioning',
      icon: Sliders,
      description:
        'Admins add parking lots, configure bay numbers, allocate vehicle classifications, and update maintenance statuses through a dedicated operations portal.',
    },
    {
      title: 'Dynamic Rate Rule Governance',
      icon: ShieldAlert,
      description:
        'Pricing rules can be adjusted per vehicle type. When a new rate is published, the previous rule is archived in history while new bookings inherit updated rates.',
    },
    {
      title: 'Session & Occupancy Reporting',
      icon: FileText,
      description:
        'Audit active parking sessions, review completed transactions, and analyze utilization rates across individual facilities with filtered date ranges.',
    },
  ];

  const systemRules = [
    {
      q: 'Does ParkEase process real payments?',
      a: 'No. Payment records are simulated for demonstration. No payment gateway or real-money transfer is connected.',
    },
    {
      q: 'How does ParkEase prevent double booking?',
      a: 'The server checks requested time windows against reservation and session records before accepting a booking. The backend remains authoritative.',
    },
    {
      q: 'Can I manage more than one vehicle?',
      a: 'Yes. The customer portal supports adding, editing, and removing registered vehicles, subject to the server’s reservation and session rules.',
    },
    {
      q: 'Who records parking entry and exit?',
      a: 'The existing operations console lets authorized admins record vehicle entry and exit for a parking session.',
    },
  ];

  return (
    <div className="space-y-20 py-12 md:py-16 font-sans">
      
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-raised border border-border text-xs text-text-muted font-medium">
          <CalendarCheck className="w-3.5 h-3.5 text-text" aria-hidden="true" />
          <span>Workflow & Operations Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text max-w-3xl mx-auto leading-tight">
          From Slot Discovery to Departure
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A step-by-step look at facility discovery, time-specific availability search, and reservation management.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/parking">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Start Customer Flow
            </Button>
          </Link>
          <Link to="/features">
            <Button variant="secondary" size="md">
              Review System Features
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Customer Journey Steps ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Customer Journey
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              The four essential stages of reserving and using a ParkEase parking slot.
            </p>
          </div>
          <Badge variant="neutral" size="sm">Customer portal</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="park-card p-6 space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <span className="font-mono text-xs font-semibold text-text-muted">
                      STAGE {s.step}
                    </span>
                    <div className="w-7 h-7 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-base text-text tracking-tight mb-1">
                    {s.title}
                  </h3>
                  <div className="text-[11px] font-mono text-text-muted mb-3">
                    {s.subtitle}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Operational Side Workflows ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Operational Management Workflows
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              How parking lot administrators configure inventory, rates, and occupancy tracking.
            </p>
          </div>
          <Badge variant="info" size="sm">Admin Console</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {operationalWorkflows.map((op) => {
            const Icon = op.icon;
            return (
              <Card key={op.title} title={op.title}>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {op.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── System Rules FAQ ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              System Rules & Boundaries
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Explicit constraints ensuring honest operation and data safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {systemRules.map((r, i) => (
            <div key={i} className="park-card p-5 space-y-2 bg-surface">
              <h3 className="font-semibold text-sm text-text tracking-tight">
                {r.q}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {r.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="park-card bg-surface-raised border border-border p-8 sm:p-10 space-y-5 shadow-subtle">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Ready to find parking?
          </h2>
          <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Search facilities, select a time, and submit a reservation request with server-side conflict checks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/parking">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Find Parking Now
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="secondary" size="md">
                Admin Operations Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
