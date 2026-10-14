import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Car,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Button, Card, Badge, Skeleton, EmptyState } from '../components/ui';
import { parkingApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { gsap } from '../lib/gsap';
import { ParkingScenePoster } from '../components/scene/ParkingScenePoster';

const ParkingScene = lazy(() => import('../components/scene/ParkingScene'));

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const pageRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Real backend parking facility data state
  const [lots, setLots] = useState([]);
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [lotsError, setLotsError] = useState(null);

  const fetchLots = async () => {
    setIsLoadingLots(true);
    setLotsError(null);
    try {
      const res = await parkingApi.getLots();
      const facilityList = res?.data?.lots || res?.lots || [];
      setLots(facilityList);
    } catch (err) {
      setLotsError(err.message || 'Unable to load the facility directory.');
    } finally {
      setIsLoadingLots(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  useLayoutEffect(() => {
    if (shouldReduceMotion || !pageRef.current) return undefined;

    const context = gsap.context(() => {
      pageRef.current.querySelectorAll('[data-scroll-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        );
      });
    }, pageRef);

    return () => context.revert();
  }, [shouldReduceMotion]);

  const handleShowMore = () => {
    const target = '/parking';

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: target, search: location.search, hash: location.hash } },
      });
      return;
    }

    navigate(target);
  };

  return (
    <div ref={pageRef} className="space-y-24 py-10 md:py-16 font-sans">
      
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-surface-raised border border-border text-xs text-text-muted font-medium">
              <Sparkles className="w-3.5 h-3.5 text-text" aria-hidden="true" />
              <span>Smart Parking Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.055em] text-text leading-[1.03]">
              Your Space. Your Time.{' '}
              <span className="text-text-muted">Parking, planned.</span>
            </h1>

            <p className="text-text-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Find a facility, check slot availability for your time window, and manage reservations and vehicles in one considered workspace.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/parking">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Find Parking
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="secondary" size="lg">
                  How it works
                </Button>
              </Link>
            </div>

            {/* Micro Architecture Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-text-muted font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-text" aria-hidden="true" />
                Time-window checks
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-text" aria-hidden="true" />
                Role-protected access
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-text" aria-hidden="true" />
                Demo billing only
              </span>
            </div>
          </div>

          {/* Illustrative scene; it does not represent live availability. */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div
              className="w-full max-w-md park-card-raised p-5 sm:p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold tracking-wider text-text uppercase">
                    Parking bay · illustration
                  </span>
                </div>
                <Badge variant="neutral" size="sm">Not live data</Badge>
              </div>

              <div
                className="relative h-[220px] w-full overflow-hidden sm:h-[260px]"
                role="img"
                aria-label="Illustrative car in a parking bay. This is not live availability."
              >
                {shouldReduceMotion ? (
                  <ParkingScenePoster className="h-full" />
                ) : (
                  <Suspense fallback={<ParkingScenePoster className="h-full" />}>
                    <ParkingScene />
                  </Suspense>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span className="text-text font-medium">Availability checked on search</span>
                </div>
                <span className="text-text-muted font-mono text-[11px]">Illustrative only</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Real Parking Facilities Preview Section ────────────────────── */}
      <section id="preview" data-scroll-reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text">
                Facility directory
              </h2>
              <Badge variant="neutral" size="sm">API records</Badge>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Facilities returned by the ParkEase API. Slot availability is checked for your selected time window.
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
              <div className="font-semibold text-sm text-text">Facility directory unavailable</div>
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
            title="No facility records found"
            description="The facility directory did not return any parking locations."
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
                      Total capacity: <span className="font-semibold text-text">{lot.totalCapacity ?? '—'}</span>
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
      <section id="features" data-scroll-reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Engineered for Concurrency & Precision
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            A straightforward flow built around facility records, time-window search, and server-checked reservations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Reservation conflict checks"
            subtitle="Server-validated requests"
            headerAction={<Badge variant="neutral">Backend</Badge>}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              Reservation requests are checked against existing time windows by the backend before confirmation.
            </p>
          </Card>

          <Card
            title="Time-specific availability"
            subtitle="Inventory status"
            headerAction={<Badge variant="neutral">API-backed</Badge>}
          >
            <p className="text-xs text-text-muted leading-relaxed">
              Slot records use explicit availability and maintenance states. Search results are evaluated against the requested time window and vehicle category.
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
      <section id="how-it-works" data-scroll-reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-border space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            How It Works
          </h2>
          <p className="text-text-muted text-sm">
            Explore facilities, choose a suitable time, and submit a reservation request.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover',
              desc: 'Browse facilities and supported slot categories from the parking inventory.',
            },
            {
              step: '02',
              title: 'Schedule',
              desc: 'Choose a start and end time for the availability search.',
            },
            {
              step: '03',
              title: 'Reserve',
              desc: 'Submit your selection. The server rechecks availability before confirming a reservation.',
            },
            {
              step: '04',
              title: 'Arrive',
              desc: 'Review your reservation in the customer portal. Admins can record entry and exit sessions.',
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
      <section data-scroll-reveal className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="park-card bg-surface-raised border border-border p-8 sm:p-12 space-y-6 shadow-subtle">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Ready to find and reserve your parking bay?
          </h2>
          <p className="text-text-muted text-sm max-w-lg mx-auto leading-relaxed">
            Start with a time-specific availability search and manage your booking from your customer account.
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
