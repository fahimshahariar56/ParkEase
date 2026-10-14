import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Car,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  RefreshCw,
  Layers,
  Lock,
} from 'lucide-react';
import { Button, Card, Badge, Skeleton, EmptyState } from '../components/ui';
import { parkingApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Real backend parking facility data state
  const [lots, setLots] = useState([]);
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [lotsError, setLotsError] = useState(null);

  // Mouse tilt state for subtle, restrained desktop visual
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const fetchLots = async () => {
    setIsLoadingLots(true);
    setLotsError(null);
    try {
      const res = await parkingApi.getLots();
      const facilityList = res?.data?.lots || res?.lots || [];
      setLots(facilityList);
    } catch (err) {
      setLotsError(err.message || 'Unable to connect to live facilities service.');
    } finally {
      setIsLoadingLots(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleMouseMove = (e) => {
    // Restrained cursor response: max +/- 5 deg tilt on desktop
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleShowMore = () => {
    const target = '/parking';

    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: { pathname: target, search: location.search, hash: location.hash } },
      });
      return;
    }

    navigate(target, { replace: true });
  };

  return (
    <div className="space-y-24 py-10 md:py-16 font-sans">
      
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-surface-raised border border-border text-xs text-text-muted font-medium">
              <Sparkles className="w-3.5 h-3.5 text-text" aria-hidden="true" />
              <span>Smart Parking Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.08]">
              Your Space. Your Time.{' '}
              <span className="text-text-muted">Smarter Parking.</span>
            </h1>

            <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Collision-free parking slot reservations, live occupancy detection, and automated session management powered by relational database integrity.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
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

            {/* Micro Architecture Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-text-muted font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-status-available" aria-hidden="true" />
                ACID Concurrency Safe
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-status-info" aria-hidden="true" />
                RBAC Protected
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-status-pending" aria-hidden="true" />
                Simulated Demo Billing
              </span>
            </div>
          </div>

          {/* Hero Visual: Architectural Blueprint Card with Interactive Response */}
          <div
            className="lg:col-span-5 relative flex justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{
                perspective: 1000,
              }}
              animate={{
                rotateY: mousePos.x,
                rotateX: mousePos.y,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="w-full max-w-md park-card bg-surface-raised border border-border p-6 shadow-raised relative overflow-hidden"
            >
              {/* Header Telemetry */}
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulse" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-text uppercase">
                    Bay Monitor: Live
                  </span>
                </div>
                <Badge variant="neutral" size="sm">Ground Level 01</Badge>
              </div>

              {/* Slot Grid Schematic */}
              <div className="grid grid-cols-3 gap-2.5 my-4 font-mono text-center">
                <div className="p-3 rounded-btn border border-status-available/30 bg-status-available/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT A-01</span>
                  <span className="text-xs font-bold text-status-available mt-1">AVAILABLE</span>
                </div>
                <div className="p-3 rounded-btn border border-border bg-surface flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT A-02</span>
                  <span className="text-xs font-bold text-text-muted mt-1">OCCUPIED</span>
                </div>
                <div className="p-3 rounded-btn border border-status-pending/30 bg-status-pending/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT A-03</span>
                  <span className="text-xs font-bold text-status-pending mt-1">RESERVED</span>
                </div>
                <div className="p-3 rounded-btn border border-status-available/30 bg-status-available/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT B-01</span>
                  <span className="text-xs font-bold text-status-available mt-1">AVAILABLE</span>
                </div>
                <div className="p-3 rounded-btn border border-status-available/30 bg-status-available/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT B-02</span>
                  <span className="text-xs font-bold text-status-available mt-1">AVAILABLE</span>
                </div>
                <div className="p-3 rounded-btn border border-border bg-surface flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">SLOT B-03</span>
                  <span className="text-xs font-bold text-text-muted mt-1">OCCUPIED</span>
                </div>
              </div>

              {/* Active Verification Status */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span className="text-text font-medium">Collision Shield Active</span>
                </div>
                <span className="text-status-available font-mono text-[11px] font-semibold">100% Lock Safe</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─── Real Parking Facilities Preview Section ────────────────────── */}
      <section id="preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Live Parking Facilities
              </h2>
              <Badge variant="available" size="sm">Database Grounded</Badge>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Active facilities registered in the ParkEase database. Live data updated automatically.
            </p>
          </div>
          <Link to="/parking">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All Facilities & Slots
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoadingLots && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="park-card p-5 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-24 rounded-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoadingLots && lotsError && (
          <div className="park-card p-6 border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-semibold text-sm text-text">Live Preview Unavailable</div>
              <div className="text-xs text-text-muted">{lotsError}</div>
            </div>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchLots}>
              Retry Connection
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingLots && !lotsError && lots.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No Facilities Published"
            description="There are currently no active parking facilities configured in the database."
            actionLabel="Browse Customer Parking"
            onAction={() => navigate('/parking')}
          />
        )}

        {/* Real Data Grid */}
        {!isLoadingLots && !lotsError && lots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {lots.slice(0, 3).map((lot) => (
              <Card
                key={lot.id}
                title={lot.name}
                subtitle={lot.address}
                headerAction={
                  <Badge variant={lot.status === 'ACTIVE' ? 'available' : 'maintenance'} size="sm">
                    {lot.status || 'Active'}
                  </Badge>
                }
                footer={
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-text-muted">
                      Total Capacity: <span className="font-semibold text-text">{lot.totalCapacity ?? '—'}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={handleShowMore}
                    >
                      Show more
                    </Button>
                  </div>
                }
              >
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-text" aria-hidden="true" />
                  <span className="line-clamp-2">{lot.address || 'Central location'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ─── Feature Architecture Strip ─────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Engineered for Concurrency & Precision
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Eliminating double-booking conflicts and phantom parking spaces with database-backed guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Collision-Free Reservations"
            subtitle="ACID Transaction Guarantees"
            headerAction={<Badge variant="confirmed">Enforced</Badge>}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              Interval overlapping queries run inside relational database transactions with row-level locks, mathematically preventing simultaneous booking of the same slot.
            </p>
          </Card>

          <Card
            title="Real-Time Bay Matrix"
            subtitle="Granular State Tracking"
            headerAction={<Badge variant="available">Live</Badge>}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              Slots are tracked across four explicit lifecycle states: Available, Reserved, Occupied, and Maintenance with vehicle type matching (Sedan, SUV, Bike, EV).
            </p>
          </Card>

          <Card
            title="Separated Portal Controls"
            subtitle="Role-Based System Access"
            headerAction={<Badge variant="info">RBAC</Badge>}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              Dedicated interfaces separate Customer self-service booking from Admin operational monitoring, rate scheduling, and audit report generation.
            </p>
          </Card>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-border space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            How It Works
          </h2>
          <p className="text-text-muted text-sm">
            Four disciplined steps from slot discovery to confirmed arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover',
              desc: 'Inspect real parking facilities and review slots matched to your vehicle classification.',
            },
            {
              step: '02',
              title: 'Schedule',
              desc: 'Select your arrival timestamp and duration window with transparent hourly rate preview.',
            },
            {
              step: '03',
              title: 'Authorize',
              desc: 'Confirm your spot using a simulated demo checkout with zero real financial exposure.',
            },
            {
              step: '04',
              title: 'Arrive',
              desc: 'Park in your reserved bay with automated entry and exit parking session time tracking.',
            },
          ].map((item) => (
            <div key={item.step} className="park-card p-6 space-y-3 relative overflow-hidden">
              <span className="text-3xl font-extrabold font-mono text-text/15">
                {item.step}
              </span>
              <h3 className="font-semibold text-base text-text tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="park-card bg-surface-raised border border-border p-8 sm:p-12 space-y-6 shadow-subtle">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Ready to find and reserve your parking bay?
          </h2>
          <p className="text-text-muted text-sm max-w-lg mx-auto leading-relaxed">
            Experience reliable, collision-free slot reservations backed by verifiable database architecture.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/parking">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Find Your Parking Spot
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
