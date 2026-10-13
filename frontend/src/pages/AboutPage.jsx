import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Database,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const AboutPage = () => {
  const stackLayers = [
    {
      title: 'Frontend Presentation',
      badge: <Badge variant="neutral" size="sm">Client Tier</Badge>,
      icon: Code2,
      specs: [
        'React 19 & Vite 8 with ES Module architecture',
        'Tailwind CSS with strict monochrome design token system',
        'Motion for React for restrained interaction feedback',
        'Fully accessible semantic HTML, keyboard focus, and ARIA roles',
      ],
    },
    {
      title: 'Backend API Service',
      badge: <Badge variant="neutral" size="sm">Application Tier</Badge>,
      icon: Server,
      specs: [
        'Node.js & Express.js RESTful API architecture',
        'Stateless JWT authentication with role authorization middleware',
        'Secure password hashing utilizing bcryptjs salt rounds',
        'Modular feature controllers, validation schemas, and service layers',
      ],
    },
    {
      title: 'Relational Database',
      badge: <Badge variant="available" size="sm">Source of Truth</Badge>,
      icon: Database,
      specs: [
        'MySQL 8 with InnoDB storage engine',
        'ACID transactions for reservation and session state management',
        'Foreign key constraints and ON DELETE RESTRICT cascade controls',
        'Parameterized queries via mysql2 preventing SQL injection',
      ],
    },
  ];

  const designPrinciples = [
    {
      title: 'Database as Source of Truth',
      desc: 'The backend database remains the sole authority for slot availability, fee calculations, and role permissions. No availability numbers are synthesized on the client.',
    },
    {
      title: 'Truthful Presentation',
      desc: 'Simulated demo payments and seed facilities are clearly disclosed. We do not display fake testimonials, pretend customer counts, or artificial star ratings.',
    },
    {
      title: 'Defensive Concurrency',
      desc: 'Overlapping time-window reservation requests are rejected within database transaction isolation boundaries, mathematically preventing double booking.',
    },
    {
      title: 'Role-Based Isolation',
      desc: 'Customer self-service capabilities and Admin operational powers are strictly separated across distinct layouts, route guards, and backend authorization checks.',
    },
  ];

  return (
    <div className="space-y-20 py-12 md:py-16 font-sans">
      
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-raised border border-border text-xs text-text-muted font-medium">
          <Cpu className="w-3.5 h-3.5 text-text" aria-hidden="true" />
          <span>Academic Database & Systems Project</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text max-w-3xl mx-auto leading-tight">
          About ParkEase
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          ParkEase is a smart parking management application built to demonstrate full-stack software architecture, relational database integrity, and modern user experience engineering.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/parking">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Explore Parking Slots
            </Button>
          </Link>
          <Link to="/features">
            <Button variant="secondary" size="md">
              View Technical Specs
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Architectural Stack ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Three-Tier Technology Architecture
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Strict separation between presentation, application logic, and persistent storage.
            </p>
          </div>
          <Badge variant="neutral" size="sm">Architecture v1.0</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stackLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <Card
                key={layer.title}
                title={layer.title}
                headerAction={layer.badge}
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-btn bg-surface-raised border border-border flex items-center justify-center text-text">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                  <ul className="space-y-2 text-xs text-text-muted">
                    {layer.specs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-status-available mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── Engineering Principles ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Core Engineering Principles
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            System values prioritizing data reliability, honest disclosures, and design discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {designPrinciples.map((p, i) => (
            <div key={i} className="park-card p-5 space-y-2 bg-surface">
              <h3 className="font-semibold text-sm text-text tracking-tight">
                {p.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="park-card bg-surface-raised border border-border p-8 sm:p-10 space-y-5 shadow-subtle">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Explore ParkEase Today
          </h2>
          <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Test real slot reservations or sign in to experience the admin operations console.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/parking">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Find Parking
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="secondary" size="md">
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
