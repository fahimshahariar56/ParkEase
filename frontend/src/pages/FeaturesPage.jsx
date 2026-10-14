import React from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Layers,
  ArrowRight,
  Database,
  Car,
  Clock,
  LayoutDashboard,
  CreditCard,
  Grid3X3,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const FeaturesPage = () => {
  const coreFeatures = [
    {
      title: 'Reservation Conflict Protection',
      category: 'Concurrency Control',
      badge: <Badge variant="confirmed" size="sm">Enforced</Badge>,
      icon: Lock,
      description:
        'Time-window overlap detection runs directly inside relational database transactions with row-level locks, preventing simultaneous booking of the same slot even under concurrent requests.',
    },
    {
      title: 'Multi-Category Slot Architecture',
      category: 'Inventory Management',
      badge: <Badge variant="neutral" size="sm">Configured</Badge>,
      icon: Grid3X3,
      description:
        'Parking slot records support Standard Car, SUV, Motorcycle, Van, and Truck categories, with availability and maintenance states managed through the inventory.',
    },
    {
      title: 'Automated Session & Entry/Exit Tracking',
      category: 'Operations',
      badge: <Badge variant="available" size="sm">Active</Badge>,
      icon: Clock,
      description:
        'Administrators can record vehicle entry and exit. Session timing and fee calculation are handled by the existing backend workflow.',
    },
    {
      title: 'Role-Separated Operations Console',
      category: 'Access Control',
      badge: <Badge variant="info" size="sm">Admin</Badge>,
      icon: LayoutDashboard,
      description:
        'Separate admin routes provide parking lot, slot, reservation, session, pricing, payment, and reporting views, protected by role-based routing.',
    },
    {
      title: 'Demo Payment Records',
      category: 'Simulated Billing',
      badge: <Badge variant="pending" size="sm">Demo Only</Badge>,
      icon: CreditCard,
      description:
        'Payment records use demo-only methods. No payment gateway is connected and no real money or financial credentials are processed.',
    },
    {
      title: 'Customer Vehicle & History Hub',
      category: 'Self Service',
      badge: <Badge variant="available" size="sm">Active</Badge>,
      icon: Car,
      description:
        'Self-service customer portal enabling multi-vehicle registration, active reservation management, simulated checkout history inspection, and account profile controls.',
    },
  ];

  const schemaEntities = [
    { name: 'parking_lots', purpose: 'Physical facility registry, address, and total capacity quotas' },
    { name: 'parking_slots', purpose: 'Individual numbered bays, floor index, and vehicle category constraints' },
    { name: 'reservations', purpose: 'Time-window locks, vehicle associations, and reservation states' },
    { name: 'parking_sessions', purpose: 'Real entry and exit timestamps, billable hours, and final fee snapshot' },
    { name: 'pricing_rules', purpose: 'Vehicle-type specific hourly rates with active/inactive versioning' },
    { name: 'payments', purpose: 'Demo payment records linked to completed parking sessions' },
  ];

  return (
    <div className="space-y-20 py-12 md:py-16 font-sans">
      
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-raised border border-border text-xs text-text-muted font-medium">
          <Layers className="w-3.5 h-3.5 text-text" aria-hidden="true" />
          <span>System Capabilities & Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text max-w-3xl mx-auto leading-tight">
          Engineered for Precision & Data Integrity
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Explore the implemented ParkEase workflows, from time-window reservation checks to role-separated administration.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/parking">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Explore Available Slots
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="secondary" size="md">
              View Workflow Guide
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Core Features Grid ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
            Implemented System Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Existing customer and admin capabilities, presented against their current API and data contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.title}
                title={feat.title}
                subtitle={feat.category}
                headerAction={feat.badge}
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── Relational Schema Section ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-text-muted" aria-hidden="true" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Relational Database Design
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Normalized MySQL 8 InnoDB schema ensuring referential integrity and foreign key constraints.
            </p>
          </div>
          <Badge variant="neutral" size="sm">MySQL 8 InnoDB</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemaEntities.map((ent) => (
            <div
              key={ent.name}
              className="park-card p-4 space-y-2 bg-surface hover:bg-surface-raised/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-text">
                  {ent.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-status-available" aria-hidden="true" />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {ent.purpose}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="park-card bg-surface-raised border border-border p-8 sm:p-10 space-y-5 shadow-subtle">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Ready to test slot availability?
          </h2>
          <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Review the server-checked reservation flow or sign in to manage registered vehicles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/parking">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Find Parking Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="md">
                Customer Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
