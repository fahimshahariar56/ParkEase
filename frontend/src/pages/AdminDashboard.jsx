import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Building2,
  Grid3X3,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Layers,
  ArrowRightLeft,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  useToast,
} from '../components/ui';
import { parkingApi, reservationsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Status Mappings & Formatters ─────────────────────────────────────────────

const STATUS_BADGE = {
  CONFIRMED: 'available',
  PENDING: 'pending',
  ACTIVE: 'brand',
  COMPLETED: 'neutral',
  CANCELLED: 'occupied',
  NO_SHOW: 'maintenance',
};

const STATUS_LABEL = {
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-Show',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

export const AdminDashboard = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Latest API response states
  const [lots, setLots] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch for parking lots, slots, and reservations
      const [lotsRes, slotsRes, reservationsRes] = await Promise.all([
        parkingApi.getLots({}, token),
        parkingApi.getSlots({}, token),
        reservationsApi.getReservations({}, token),
      ]);

      const fetchedLots = lotsRes?.data?.lots || [];
      const fetchedSlots = slotsRes?.data?.slots || [];
      const fetchedReservations = reservationsRes?.data?.reservations || [];

      setLots(fetchedLots);
      setSlots(fetchedSlots);
      setReservations(fetchedReservations);
      setLastUpdated(new Date());

      if (isManualRefresh) {
        toast({
          type: 'success',
          title: 'Metrics Synchronized',
          message: 'Admin operational data refreshed from server.',
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Failed to load admin overview metrics:', err);
      setError(err?.message || 'Failed to synchronize admin overview metrics.');
      if (isManualRefresh) {
        toast({
          type: 'error',
          title: 'Sync Error',
          message: err?.message || 'Unable to refresh metrics.',
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // ─── Metric Calculations (API response) ─────────────────────────────────────

  const totalLots = lots.length;
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
  const reservedSlots = slots.filter((s) => s.status === 'RESERVED').length;
  const maintenanceSlots = slots.filter((s) => s.status === 'MAINTENANCE').length;

  const occupancyRate = totalSlots > 0
    ? Math.round((occupiedSlots / totalSlots) * 100)
    : 0;

  const totalReservations = reservations.length;
  const activeReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  ).length;

  // Slot Types Breakdown (Real)
  const slotTypeCounts = slots.reduce((acc, slot) => {
    const type = slot.slotType || 'REGULAR';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Recent reservations stream (Newest first, top 6)
  const recentReservations = reservations.slice(0, 6);

  // ─── Render Error State ─────────────────────────────────────────────────────

  if (error && !isLoading && lots.length === 0) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="park-page-title">Operations Overview</h1>
            <p className="park-page-description">Latest parking inventory and reservation data returned by the API.</p>
          </div>
        </div>
        <ErrorState
          title="Failed to Load Dashboard Data"
          message={error}
          onRetry={() => fetchDashboardData(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* ── Top Header & Actions Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="park-page-title">
              Operations Overview
            </h1>
            <Badge variant="neutral" size="sm">API snapshot</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-2 flex-wrap">
            <span>Parking inventory and reservation data from the latest API response</span>
            {lastUpdated && (
              <>
                <span className="text-border">•</span>
                <span className="text-[11px] text-text-muted/70">
                  Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => fetchDashboardData(true)}
            title="Refresh metrics from server"
          >
            Refresh
          </Button>
          <Link to="/admin/lots">
            <Button variant="outline" size="sm" icon={Building2}>
              Lots
            </Button>
          </Link>
          <Link to="/admin/slots">
            <Button variant="outline" size="sm" icon={Grid3X3}>
              Slots
            </Button>
          </Link>
          <Link to="/admin/reservations">
            <Button variant="primary" size="sm" icon={CalendarCheck}>
              Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Operational Status Banner ───────────────────────────────────────── */}
      <div className="p-4 rounded-card bg-surface-raised border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm shadow-subtle">
        <div className="flex items-center gap-3 text-brand">
          <div className="w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-brand" />
          </div>
          <div>
            <div className="font-bold text-text">
              Inventory snapshot · {totalLots} {totalLots === 1 ? 'facility' : 'facilities'}
            </div>
            <div className="text-text-muted text-[11px] mt-0.5">
              {availableSlots} of {totalSlots} registered slots marked available in the latest response
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics KPI Grid (5 Cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Lots & Slots (Real API) */}
        <Card variant="raised" className="relative overflow-hidden">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">Lots / Slots</span>
                <Car className="w-4 h-4 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight font-mono">
                {totalLots} <span className="text-sm font-normal text-text-muted">/</span> {totalSlots}
              </div>
              <div className="text-[11px] text-text-muted mt-2 flex items-center justify-between">
                <span className="text-brand font-medium">{availableSlots} free slots</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                  API
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* KPI 2: Occupancy Rate (Real API) */}
        <Card variant="raised" className="relative overflow-hidden">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">Occupancy Rate</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight font-mono">
                {occupancyRate}%
              </div>
              <div className="text-[11px] text-text-muted mt-2 flex items-center justify-between">
                <span>{occupiedSlots + reservedSlots} slots filled</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                  API
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* KPI 3: Current Bookings (Real API) */}
        <Card variant="raised" className="relative overflow-hidden">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">Reservations</span>
                <CalendarCheck className="w-4 h-4 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight font-mono">
                {totalReservations}
              </div>
              <div className="text-[11px] text-text-muted mt-2 flex items-center justify-between">
                <span className="text-brand font-medium">{activeReservations} active</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                  API
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Session data is not included in the dashboard's current API requests. */}
        <Card variant="raised" className="relative overflow-hidden border-border/80">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">Active Sessions</span>
                <ArrowRightLeft className="w-4 h-4 text-status-pending" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight font-mono">
                —
              </div>
              <div className="text-[11px] text-text-muted mt-2 flex items-center justify-between">
                <span className="text-text-muted">Not included in this view</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-surface-raised text-text-muted border border-border">
                  NOT LOADED
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* KPI 5: Demo Revenue (Simulated seed-labelled per DESIGN.md Section 7) */}
        <Card variant="raised" className="relative overflow-hidden border-border/80">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">Demo Revenue</span>
                <DollarSign className="w-4 h-4 text-status-available" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight font-mono">
                —
              </div>
              <div className="text-[11px] text-text-muted mt-2 flex items-center justify-between">
                <span className="text-text-muted">No real money charged</span>
                <Link to="/admin/payments" className="text-[10px] px-1 py-0.5 rounded bg-surface-raised text-text-muted border border-border hover:text-text">
                  VIEW DEMO PAYMENTS
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Middle Grid: Facility Occupancy & Slot Status Breakdown ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Parking Lots Capacity Breakdown (Real API) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Parking Facilities Status"
            subtitle="Availability counts from the latest facility response"
            headerAction={
              <Link to="/admin/lots" className="text-xs text-brand hover:underline flex items-center gap-1">
                Manage Lots <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-input bg-surface-raised border border-border/40 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2 w-full rounded-pill" />
                  </div>
                ))}
              </div>
            ) : lots.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No parking lots configured"
                description="The parking inventory returned no facility records."
              />
            ) : (
              <div className="space-y-4">
                {lots.map((lot) => {
                  const trackedSlots = Number(lot.slotCount || 0);
                  const available = Number(lot.availableSlots || 0);
                  const percent = trackedSlots > 0
                    ? Math.min(100, Math.round((available / trackedSlots) * 100))
                    : 0;

                  return (
                    <div
                      key={lot.id}
                      className="p-4 rounded-input bg-surface-raised border border-border/60 hover:border-brand/30 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text text-sm">{lot.name}</span>
                            <Badge variant={lot.status === 'ACTIVE' ? 'available' : 'maintenance'} size="sm">
                              {lot.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">{lot.address}</p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-bold text-text">{available} available</span>
                          <span className="text-text-muted"> / {trackedSlots} tracked</span>
                        </div>
                      </div>

                      {/* Availability among registered slots */}
                      <div>
                        <div className="h-2 w-full bg-surface rounded-pill overflow-hidden border border-border/40 flex">
                          <div
                            className="h-full bg-text transition-all duration-300"
                            style={{ width: `${percent}%` }}
                            role="progressbar"
                            aria-valuenow={percent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label={`${lot.name}: ${percent}% of registered slots available`}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-text-muted mt-1.5">
                          <span>Registered slots available</span>
                          <span className="font-semibold text-text">{percent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Slot Inventory Distribution Matrix (Real API) */}
        <div className="space-y-6">
          <Card
            title="Slot Inventory Breakdown"
            subtitle="Status & vehicle compatibility matrix"
            headerAction={
              <Link to="/admin/slots" className="text-xs text-brand hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Status Pills */}
                <div>
                  <div className="text-[11px] text-text-muted mb-2 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand" />
                    <span>Slots By Current Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-input bg-surface-raised border border-border/60">
                      <div className="text-[10px] text-text-muted">Available</div>
                      <div className="text-base font-bold text-status-available font-mono">{availableSlots}</div>
                    </div>
                    <div className="p-2.5 rounded-input bg-surface-raised border border-border/60">
                      <div className="text-[10px] text-text-muted">Occupied</div>
                      <div className="text-base font-bold text-status-occupied font-mono">{occupiedSlots}</div>
                    </div>
                    <div className="p-2.5 rounded-input bg-surface-raised border border-border/60">
                      <div className="text-[10px] text-text-muted">Reserved</div>
                      <div className="text-base font-bold text-brand font-mono">{reservedSlots}</div>
                    </div>
                    <div className="p-2.5 rounded-input bg-surface-raised border border-border/60">
                      <div className="text-[10px] text-text-muted">Maintenance</div>
                      <div className="text-base font-bold text-amber-500 font-mono">{maintenanceSlots}</div>
                    </div>
                  </div>
                </div>

                {/* Slot Type Distribution */}
                <div className="pt-3 border-t border-border/40">
                  <div className="text-[11px] text-text-muted mb-2 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand" />
                    <span>Slots By Classification</span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.keys(slotTypeCounts).length === 0 ? (
                      <p className="text-[11px] text-text-muted">No slots registered.</p>
                    ) : (
                      Object.entries(slotTypeCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-1 border-b border-border/30 last:border-b-0">
                          <span className="text-text-muted">{type.replace('_', ' ')}:</span>
                          <span className="font-bold text-text">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Seed Advisory Card */}
          <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Demo data notice</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Inventory and reservations reflect the latest API response. Demo payment totals are simulated; no real money is charged.
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Reservations & Activity Stream (Real API) ────────────────── */}
      <Card
        title="Recent Customer Bookings"
        subtitle="Latest reservations recorded in the database"
        headerAction={
          <Link to="/admin/reservations" className="text-xs text-brand hover:underline flex items-center gap-1">
            All Bookings ({reservations.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-input bg-surface-raised border border-border/40 flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        ) : recentReservations.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No reservations found"
            description="The reservation API returned no records for this view."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-text-muted text-[11px]">
                  <th className="pb-3 font-medium">Ref #</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Vehicle / Plate</th>
                  <th className="pb-3 font-medium">Facility / Slot</th>
                  <th className="pb-3 font-medium">Scheduled Window</th>
                  <th className="pb-3 font-medium">Estimated Fee</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentReservations.map((res) => {
                  const badgeVariant = STATUS_BADGE[res.status] || 'neutral';
                  const label = STATUS_LABEL[res.status] || res.status;

                  return (
                    <tr key={res.id} className="hover:bg-surface-raised/60 transition-colors">
                      <td className="py-3 font-bold text-text">
                        #{res.id}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-text">{res.user?.fullName || `User #${res.userId}`}</div>
                        <div className="text-[10px] text-text-muted">{res.user?.email || '—'}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono font-medium text-text">{res.vehicle?.plateNumber || `Veh #${res.vehicleId}`}</div>
                        <div className="text-[10px] text-text-muted">{res.vehicle?.vehicleType || 'Standard'}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-text">{res.slot?.lotName || 'Facility'}</div>
                        <div className="text-[10px] text-brand font-mono">Slot #{res.slot?.slotNumber || res.slotId}</div>
                      </td>
                      <td className="py-3 text-[11px] text-text-muted">
                        <div>{formatDateTime(res.startTime)}</div>
                        <div className="text-[10px] text-text-muted/70">to {formatDateTime(res.endTime)}</div>
                      </td>
                      <td className="py-3 font-bold text-text font-mono">
                        {formatCurrency(res.totalEstimatedFee)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={badgeVariant} size="sm">
                          {label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Simulated Operations & Demo Payment Footer Notice ──────────────── */}
      <div className="p-4 rounded-card bg-surface-raised border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0 text-brand">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-text">ParkEase Console Core Synchronized</div>
            <div className="text-text-muted text-[11px]">
              Ready for Day 17 Admin Lot & Slot Inventory Management tools
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/reports">
            <Button variant="ghost" size="sm" icon={TrendingUp}>
              Reports Stub
            </Button>
          </Link>
          <Link to="/admin/pricing">
            <Button variant="ghost" size="sm" icon={DollarSign}>
              Pricing Rules
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
