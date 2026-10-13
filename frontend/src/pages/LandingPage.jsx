import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const LandingPage = () => {
  return (
    <div className="space-y-20 py-12 md:py-20 font-mono">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand/10 border border-brand/30 text-brand text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Smart Parking</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text max-w-4xl mx-auto leading-tight">
          Your Space. Your Time. <span className="text-brand">Smarter Parking.</span>
        </h1>

        <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto">
          Effortlessly discover available parking slots, make instant reservations, and track your vehicles in real-time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/parking">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Find Parking
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">
              Explore How It Works
            </Button>
          </a>
        </div>
      </section>

      {/* Feature Strip */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Engineered for Efficiency</h2>
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            Experience reliable, collision-free slot reservations backed by ACID relational transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Real-Time Availability"
            subtitle="Verified against active bookings"
            headerAction={<Badge variant="available">Live</Badge>}
          >
            <p className="text-xs text-text-muted">
              Live status filtering prevents double booking using server-side interval checks and transaction locks.
            </p>
          </Card>

          <Card
            title="Seamless Reservations"
            subtitle="Lock slot before arriving"
            headerAction={<Badge variant="brand">Guaranteed</Badge>}
          >
            <p className="text-xs text-text-muted">
              Select vehicle type, review duration pricing, and secure your spot with simulated demo payment.
            </p>
          </Card>

          <Card
            title="Operations Management"
            subtitle="Complete admin control"
            headerAction={<Badge variant="info">Admin</Badge>}
          >
            <p className="text-xs text-text-muted">
              Dedicated operations dashboard for entry/exit tracking, pricing rules, and occupancy reporting.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-y border-border/60">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-text-muted text-sm">Four simple steps to stress-free parking.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Discover', desc: 'Search lots and find compatible slots for your vehicle type.' },
            { step: '02', title: 'Select', desc: 'Pick your preferred arrival time and required reservation duration.' },
            { step: '03', title: 'Reserve', desc: 'Confirm booking with simulated demo payment authorization.' },
            { step: '04', title: 'Park', desc: 'Arrive at your assigned slot with verified entry records.' },
          ].map((item) => (
            <div key={item.step} className="park-card p-6 space-y-3 relative overflow-hidden">
              <span className="text-3xl font-extrabold text-brand/30">{item.step}</span>
              <h3 className="font-bold text-base text-text">{item.title}</h3>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to reserve your parking spot?</h2>
        <p className="text-text-muted text-sm max-w-xl mx-auto">
          Join ParkEase now to streamline your daily parking routine.
        </p>
        <Link to="/parking">
          <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
            Find Your Parking Spot
          </Button>
        </Link>
      </section>
    </div>
  );
};
