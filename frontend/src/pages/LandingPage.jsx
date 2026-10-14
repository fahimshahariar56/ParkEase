import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Car,
  MapPin,
  Sparkles,
  Building2,
  RefreshCw,
  Lock,
  CalendarClock,
  Search,
  ClipboardCheck,
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
    <div ref={pageRef} className="space-y-16 py-8 font-sans sm:space-y-20 sm:py-12 lg:space-y-24 lg:py-16">
      
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
          
          {/* Hero Copy */}
          <div className="space-y-5 text-left lg:col-span-6 lg:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-text" aria-hidden="true" />
              <span>Smart parking, made clear</span>
            </div>

            <h1 className="max-w-[13ch] text-display-lg font-semibold text-text">
              Your space.
              <span className="block">Your time.</span>
              <span className="block text-text-muted">Smarter parking.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
              Find a facility, check slot availability for your time window, and manage reservations and vehicles in one considered workspace.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/parking"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-text bg-text px-5 text-sm font-medium tracking-tight text-bg transition-colors hover:border-text/90 hover:bg-text/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
              >
                Find Parking
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-btn border border-border bg-surface-raised px-5 text-sm font-medium tracking-tight text-text transition-colors hover:border-text/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                >
                  Explore how it works
                </Link>
            </div>
          </div>

          {/* Illustrative scene; it does not represent live availability. */}
          <div className="relative flex justify-center lg:col-span-6">
            <div
              className="relative w-full max-w-xl overflow-hidden park-card-raised p-4 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold tracking-wider text-text uppercase">
                    Parking bay · illustration
                  </span>
                </div>
                <Badge variant="neutral" size="sm">Not live data</Badge>
              </div>

              <div
                className="relative h-[210px] w-full overflow-hidden sm:h-[260px] lg:h-[300px]"
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

      {/* ─── Product Value Strip ────────────────────────────────────────── */}
      <section aria-label="ParkEase approach" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 py-4 sm:px-5 sm:first:pl-0">
            <Search className="h-4 w-4 flex-shrink-0 text-text-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">Search by your time</p>
              <p className="text-xs text-text-muted">Availability is checked for your selected window.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4 sm:px-5">
            <Shield className="h-4 w-4 flex-shrink-0 text-text-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">Reservations rechecked</p>
              <p className="text-xs text-text-muted">The server validates slot conflicts before booking.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4 sm:pl-5 sm:pr-0">
            <Lock className="h-4 w-4 flex-shrink-0 text-text-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-text">Clear account boundaries</p>
              <p className="text-xs text-text-muted">Customer and admin tools stay role-protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Real Parking Facilities Preview Section ────────────────────── */}
      <section id="preview" data-scroll-reveal className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
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
          <Link
            to="/parking"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text transition-colors hover:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            View all facilities
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
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

      {/* ─── Illustrative Slot States ───────────────────────────────────── */}
      <section id="slot-preview" data-scroll-reveal className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="space-y-3 lg:col-span-5">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted">A clearer parking view</p>
          <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Know what each status means.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-text-muted">
            This example explains the kinds of slot states you may see. It is not live inventory; availability is checked for your chosen time.
          </p>
          <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right" onClick={handleShowMore}>
            Explore parking
          </Button>
        </div>

        <div className="space-y-3 rounded-card border border-border bg-surface-raised p-4 sm:p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text">Example slot states</span>
            <Badge variant="neutral" size="sm">Illustration · not live data</Badge>
          </div>
          {[
            { label: 'Available for selected time', variant: 'available', mark: 'A' },
            { label: 'Reservation overlaps this time', variant: 'confirmed', mark: 'R' },
            { label: 'Temporarily unavailable', variant: 'maintenance', mark: '—' },
          ].map(({ label, variant, mark }) => (
            <div key={label} className="flex min-h-12 items-center justify-between gap-3 border-b border-border/60 py-2 last:border-b-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-11 flex-shrink-0 items-center justify-center rounded-sm border border-border bg-bg-subtle font-mono text-xs text-text-muted" aria-hidden="true">
                  {mark}
                </span>
                <span className="text-sm text-text">{label}</span>
              </div>
              <Badge variant={variant} size="sm" showDot={false}>Example</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature Architecture Strip ─────────────────────────────────── */}
      <section id="features" data-scroll-reveal className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted">The ParkEase workflow</p>
          <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            The details that make parking easier
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-text-muted">
            One connected place to explore facilities, plan a visit, and keep track of your parking activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 border-y border-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          {[
            {
              icon: Search,
              step: '01',
              title: 'Find a facility',
              description: 'Browse locations and review the parking inventory returned by the API.',
            },
            {
              icon: CalendarClock,
              step: '02',
              title: 'Choose a time',
              description: 'Check eligible slots for your selected date, time window, and vehicle type.',
            },
            {
              icon: ClipboardCheck,
              step: '03',
              title: 'Request a reservation',
              description: 'The server rechecks availability and overlapping bookings before confirmation.',
            },
            {
              icon: Car,
              step: '04',
              title: 'Manage your visit',
              description: 'Keep your vehicles, reservations, and parking activity together in your account.',
            },
          ].map(({ icon: Icon, step, title, description }) => (
            <article key={step} className="flex gap-4 border-b border-border py-5 last:border-b-0 sm:px-5 first:sm:pl-0 lg:border-b-0 lg:py-6 lg:first:pl-0">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-btn border border-border bg-surface-raised">
                <Icon className="h-4 w-4 text-text" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[11px] text-text-muted">{step}</p>
                <h3 className="text-sm font-semibold text-text">{title}</h3>
                <p className="text-xs leading-relaxed text-text-muted">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" data-scroll-reveal className="border-y border-border bg-surface/60 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted">A straightforward journey</p>
            <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              From search to space
            </h2>
            <p className="text-sm leading-relaxed text-text-muted">
              Plan the visit before you arrive. Your reservation and parking records stay connected to your account.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Explore',
                desc: 'Start with facilities and parking options available in the directory.',
              },
              {
                title: 'Set your window',
                desc: 'Choose when you plan to park and the vehicle you will bring.',
              },
              {
                title: 'Review and reserve',
                desc: 'Review your selection; availability is checked again before the reservation is confirmed.',
              },
              {
                title: 'Keep it organized',
                desc: 'Return to your account for reservation details and parking activity.',
              },
            ].map((item, index) => (
              <li key={item.title} className="relative border-t border-border py-5 sm:px-5 sm:first:pl-0 lg:border-t-0 lg:border-l lg:py-1 lg:first:border-l-0 lg:first:pl-0">
                <span className="mb-4 inline-flex h-7 min-w-7 items-center justify-center rounded-sm border border-border px-1.5 font-mono text-[11px] text-text-muted">
                  0{index + 1}
                </span>
                <h3 className="mb-2 text-sm font-semibold text-text">{item.title}</h3>
                <p className="max-w-[28ch] text-xs leading-relaxed text-text-muted">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
      <section data-scroll-reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-y border-border py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Make your next stop easier to plan.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-text-muted">
              Explore parking options and choose a time that works for your visit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/parking"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-text bg-text px-5 text-sm font-medium tracking-tight text-bg transition-colors hover:border-text/90 hover:bg-text/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            >
              Find your parking spot
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-btn border border-border bg-surface-raised px-5 text-sm font-medium tracking-tight text-text transition-colors hover:border-text/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
