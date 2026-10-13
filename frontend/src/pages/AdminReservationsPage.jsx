import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarCheck,
  Search,
  Filter,
  Clock,
  User,
  Car,
  MapPin,
  Grid3X3,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Eye,
  ShieldAlert,
  Layers,
  ArrowRight,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { Card, Badge, Button, Input, Dialog, EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { reservationsApi, parkingApi } from '../lib/api';

const STATUS_VARIANTS = {
  CONFIRMED: 'available',
  ACTIVE: 'brand',
  COMPLETED: 'info',
  CANCELLED: 'occupied',
  NO_SHOW: 'maintenance',
  PENDING: 'pending',
};

const PERMITTED_NEXT_STATUSES = {
  CONFIRMED: ['ACTIVE', 'CANCELLED', 'NO_SHOW'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};

export const AdminReservationsPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // State
  const [reservations, setReservations] = useState([]);
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lotFilter, setLotFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Reservation for Details Modal
  const [inspectingReservation, setInspectingReservation] = useState(null);

  // Status Change State
  const [statusUpdatingRes, setStatusUpdatingRes] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');

  // Cancellation Modal State
  const [cancellingRes, setCancellingRes] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Load Reference Lots
  const loadLots = useCallback(async () => {
    try {
      const res = await parkingApi.getLots({}, token);
      setLots(res?.data?.lots || []);
    } catch {
      // Non-fatal
    }
  }, [token]);

  // Load Reservations
  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (lotFilter !== 'ALL') {
        params.lotId = lotFilter;
      }

      const res = await reservationsApi.getReservations(params, token);
      setReservations(res?.data?.reservations || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve reservations.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, lotFilter, token]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Search filter across customer, slot, plate
  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) return reservations;
    const q = searchQuery.trim().toLowerCase();
    return reservations.filter((r) => {
      const customerMatch =
        r.user?.fullName?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.user?.phone?.toLowerCase().includes(q);
      const vehicleMatch =
        r.vehicle?.plateNumber?.toLowerCase().includes(q) ||
        r.vehicle?.makeModel?.toLowerCase().includes(q);
      const slotMatch =
        r.slot?.slotNumber?.toLowerCase().includes(q) ||
        r.slot?.lotName?.toLowerCase().includes(q);
      const idMatch = String(r.id).includes(q) || `res-${r.id}`.includes(q);
      return customerMatch || vehicleMatch || slotMatch || idMatch;
    });
  }, [reservations, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === 'CONFIRMED').length;
    const active = reservations.filter((r) => r.status === 'ACTIVE').length;
    const completed = reservations.filter((r) => r.status === 'COMPLETED').length;
    const cancelled = reservations.filter((r) => r.status === 'CANCELLED' || r.status === 'NO_SHOW').length;
    return { total, confirmed, active, completed, cancelled };
  }, [reservations]);

  // Handle Status Update Submit
  const handleUpdateStatusSubmit = async () => {
    if (!statusUpdatingRes || !targetStatus) return;
    setIsUpdatingStatus(true);
    setStatusUpdateError('');

    try {
      await reservationsApi.updateReservationStatus(statusUpdatingRes.id, targetStatus, token);
      toast({
        type: 'success',
        title: 'Status Updated',
        message: `Reservation #RES-${statusUpdatingRes.id} status changed to ${targetStatus}.`,
      });

      // Update local state if currently inspecting
      if (inspectingReservation && inspectingReservation.id === statusUpdatingRes.id) {
        setInspectingReservation((prev) => ({ ...prev, status: targetStatus }));
      }

      setStatusUpdatingRes(null);
      loadReservations();
    } catch (err) {
      setStatusUpdateError(err.message || 'Failed to update reservation status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Cancel Submit
  const handleCancelSubmit = async () => {
    if (!cancellingRes) return;
    setIsCancelling(true);
    setCancelError('');

    try {
      await reservationsApi.cancelReservation(cancellingRes.id, token);
      toast({
        type: 'info',
        title: 'Reservation Cancelled',
        message: `Reservation #RES-${cancellingRes.id} was marked as cancelled.`,
      });

      if (inspectingReservation && inspectingReservation.id === cancellingRes.id) {
        setInspectingReservation((prev) => ({ ...prev, status: 'CANCELLED' }));
      }

      setCancellingRes(null);
      loadReservations();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Format Helper
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand font-bold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Operations Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Reservation Management</h1>
          <p className="text-xs text-text-muted mt-1">
            Monitor customer bookings, inspect schedule windows, and transition operational reservation states.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadReservations}
            disabled={isLoading}
            title="Refresh bookings"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="park-card p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold">Total Bookings</span>
          <span className="text-xl font-bold text-text mt-1">{metrics.total}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-available/30 bg-status-available/5">
          <span className="text-[10px] text-status-available uppercase font-bold">Confirmed</span>
          <span className="text-xl font-bold text-status-available mt-1">{metrics.confirmed}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-brand/30 bg-brand/5">
          <span className="text-[10px] text-brand uppercase font-bold">Active On-Site</span>
          <span className="text-xl font-bold text-brand mt-1">{metrics.active}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-info/30 bg-status-info/5">
          <span className="text-[10px] text-status-info uppercase font-bold">Completed</span>
          <span className="text-xl font-bold text-status-info mt-1">{metrics.completed}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-occupied/30 bg-status-occupied/5">
          <span className="text-[10px] text-status-occupied uppercase font-bold">Cancelled / No-Show</span>
          <span className="text-xl font-bold text-status-occupied mt-1">{metrics.cancelled}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="park-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer, slot #, or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand"
            />
          </div>

          {/* Facility Lot Filter */}
          <div className="space-y-1">
            <select
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Facility Lots</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED (Scheduled)</option>
              <option value="ACTIVE">ACTIVE (Parked)</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="park-card p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load reservations"
          message={error}
          onRetry={loadReservations}
        />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations found"
          description={
            searchQuery || statusFilter !== 'ALL' || lotFilter !== 'ALL'
              ? 'No bookings match your current filter parameters. Try broadening your search or resetting filters.'
              : 'There are currently no customer reservations in the database.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((res) => {
            const variant = STATUS_VARIANTS[res.status] || 'neutral';
            const allowedActions = PERMITTED_NEXT_STATUSES[res.status] || [];

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="park-card p-4 sm:p-5 hover:border-brand/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: ID & Customer & Slot Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-sm text-text font-mono">
                      #RES-{res.id}
                    </span>
                    <Badge variant={variant} size="sm">
                      {res.status}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      Created {formatDateTime(res.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    {/* Customer */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <User className="w-3 h-3 text-brand" />
                        <span>Customer</span>
                      </div>
                      <div className="font-bold text-text truncate">
                        {res.user?.fullName || 'Anonymous'}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {res.user?.email || 'No email'}
                      </div>
                    </div>

                    {/* Facility & Bay */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <Grid3X3 className="w-3 h-3 text-amber-400" />
                        <span>Parking Bay</span>
                      </div>
                      <div className="font-bold text-text truncate">
                        Slot #{res.slot?.slotNumber || 'Unassigned'} ({res.slot?.slotType || 'Car'})
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {res.slot?.lotName || 'Facility Lot'}
                      </div>
                    </div>

                    {/* Vehicle */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <Car className="w-3 h-3 text-brand" />
                        <span>Vehicle</span>
                      </div>
                      <div className="font-bold text-text font-mono uppercase">
                        {res.vehicle?.plateNumber || 'N/A'}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {res.vehicle?.makeModel || res.vehicle?.vehicleType || 'Vehicle'}
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Financials */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span>
                        {formatDateTime(res.startTime)} → {formatDateTime(res.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-brand" />
                      <span className="text-text font-bold">${res.totalEstimatedFee?.toFixed(2)}</span>
                      <span className="text-[11px]">(${res.hourlyRateSnapshot?.toFixed(2)}/hr)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => setInspectingReservation(res)}
                    className="text-xs"
                  >
                    Details
                  </Button>

                  {/* Permitted Status Actions */}
                  {allowedActions.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {allowedActions.includes('ACTIVE') && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => {
                            setStatusUpdatingRes(res);
                            setTargetStatus('ACTIVE');
                            setStatusUpdateError('');
                          }}
                          className="bg-brand hover:bg-brand-hover text-slate-950 font-bold"
                          title="Record customer vehicle arrival / Check-in"
                        >
                          Check In
                        </Button>
                      )}

                      {allowedActions.includes('COMPLETED') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => {
                            setStatusUpdatingRes(res);
                            setTargetStatus('COMPLETED');
                            setStatusUpdateError('');
                          }}
                          title="Mark reservation session complete"
                        >
                          Complete
                        </Button>
                      )}

                      {allowedActions.includes('CANCELLED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={XCircle}
                          onClick={() => {
                            setCancellingRes(res);
                            setCancelError('');
                          }}
                          className="text-status-occupied hover:bg-status-occupied/10 px-2"
                          title="Cancel booking"
                        >
                          Cancel
                        </Button>
                      )}

                      {allowedActions.includes('NO_SHOW') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Ban}
                          onClick={() => {
                            setStatusUpdatingRes(res);
                            setTargetStatus('NO_SHOW');
                            setStatusUpdateError('');
                          }}
                          className="text-amber-500 hover:bg-amber-500/10 px-2"
                          title="Mark customer as no-show"
                        >
                          No Show
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Reservation Details Modal Dialog ─────────────────────────────── */}
      <Dialog
        isOpen={Boolean(inspectingReservation)}
        onClose={() => setInspectingReservation(null)}
        title={`Reservation Details: #RES-${inspectingReservation?.id}`}
        description="Comprehensive audit record, customer contact, vehicle details, and schedule window."
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {inspectingReservation?.status === 'CONFIRMED' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => {
                    setStatusUpdatingRes(inspectingReservation);
                    setTargetStatus('ACTIVE');
                  }}
                >
                  Check In
                </Button>
              )}
              {inspectingReservation?.status === 'ACTIVE' && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => {
                    setStatusUpdatingRes(inspectingReservation);
                    setTargetStatus('COMPLETED');
                  }}
                >
                  Mark Completed
                </Button>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setInspectingReservation(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        {inspectingReservation && (
          <div className="space-y-4 text-xs">
            {/* Status & ID Header */}
            <div className="p-3 rounded-input bg-surface border border-border flex items-center justify-between">
              <div>
                <span className="text-text-muted text-[10px] uppercase font-bold block">Status</span>
                <Badge variant={STATUS_VARIANTS[inspectingReservation.status] || 'neutral'}>
                  {inspectingReservation.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-text-muted text-[10px] uppercase font-bold block">Estimated Fee</span>
                <span className="font-bold text-base text-brand font-mono">
                  ${inspectingReservation.totalEstimatedFee?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-3.5 rounded-input bg-surface-raised border border-border space-y-2">
              <div className="text-[10px] font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Customer Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text">
                <div>
                  <span className="text-text-muted">Full Name:</span>{' '}
                  <span className="font-bold">{inspectingReservation.user?.fullName}</span>
                </div>
                <div>
                  <span className="text-text-muted">Customer ID:</span> #{inspectingReservation.userId}
                </div>
                <div className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-text-muted flex-shrink-0" />
                  <span>{inspectingReservation.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <Phone className="w-3 h-3 text-text-muted flex-shrink-0" />
                  <span>{inspectingReservation.user?.phone || 'No phone registered'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle & Parking Bay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-input bg-surface-raised border border-border space-y-1.5">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-brand" />
                  <span>Vehicle</span>
                </div>
                <div className="font-bold text-text font-mono text-sm uppercase">
                  {inspectingReservation.vehicle?.plateNumber}
                </div>
                <div className="text-text-muted">
                  {inspectingReservation.vehicle?.makeModel || 'Model unspecified'}
                </div>
                <div className="text-[11px] text-text-muted">
                  Type: {inspectingReservation.vehicle?.vehicleType}
                </div>
              </div>

              <div className="p-3 rounded-input bg-surface-raised border border-border space-y-1.5">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Facility & Slot</span>
                </div>
                <div className="font-bold text-text text-sm">
                  Slot #{inspectingReservation.slot?.slotNumber}
                </div>
                <div className="text-text-muted truncate">
                  {inspectingReservation.slot?.lotName}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {inspectingReservation.slot?.lotAddress}
                </div>
              </div>
            </div>

            {/* Schedule Window */}
            <div className="p-3.5 rounded-input bg-surface-raised border border-border space-y-2">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand" />
                <span>Reserved Interval</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Arrival Window:</span>
                  <span className="font-bold text-text font-mono">
                    {formatDateTime(inspectingReservation.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Departure Window:</span>
                  <span className="font-bold text-text font-mono">
                    {formatDateTime(inspectingReservation.endTime)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/40">
                  <span className="text-text-muted">Saved Rate Snapshot:</span>
                  <span className="font-bold text-brand font-mono">
                    ${inspectingReservation.hourlyRateSnapshot?.toFixed(2)}/hour
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── Status Transition Modal Dialog ───────────────────────────────── */}
      <Dialog
        isOpen={Boolean(statusUpdatingRes)}
        onClose={() => !isUpdatingStatus && setStatusUpdatingRes(null)}
        title="Update Reservation Status"
        description="Transition reservation to a new operational lifecycle state."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusUpdatingRes(null)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateStatusSubmit}
              isLoading={isUpdatingStatus}
              disabled={isUpdatingStatus || !targetStatus}
            >
              Confirm Update
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {statusUpdateError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{statusUpdateError}</span>
            </div>
          )}

          <p className="text-text">
            Update operational state for reservation{' '}
            <span className="font-bold text-brand font-mono">#RES-{statusUpdatingRes?.id}</span>{' '}
            ({statusUpdatingRes?.user?.fullName})
          </p>

          <div className="space-y-1">
            <label htmlFor="new-status-select" className="block text-xs font-medium text-text">
              Target Status *
            </label>
            <select
              id="new-status-select"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              disabled={isUpdatingStatus}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="">Select status...</option>
              <option value="ACTIVE">ACTIVE (Customer arrived / Checked in)</option>
              <option value="COMPLETED">COMPLETED (Session finished & departed)</option>
              <option value="NO_SHOW">NO_SHOW (Customer did not arrive)</option>
              <option value="CANCELLED">CANCELLED (Reservation voided)</option>
            </select>
          </div>
        </div>
      </Dialog>

      {/* ── Cancellation Confirmation Dialog ─────────────────────────────── */}
      <Dialog
        isOpen={Boolean(cancellingRes)}
        onClose={() => !isCancelling && setCancellingRes(null)}
        title="Cancel Customer Reservation"
        description="Release reserved bay and void this booking."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancellingRes(null)}
              disabled={isCancelling}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={handleCancelSubmit}
              isLoading={isCancelling}
              disabled={isCancelling}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {cancelError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          <p className="text-text">
            Are you sure you want to cancel booking{' '}
            <span className="font-bold text-brand font-mono">#RES-{cancellingRes?.id}</span> for customer{' '}
            <span className="font-bold text-text">{cancellingRes?.user?.fullName}</span>?
          </p>

          <div className="p-3 rounded-input bg-surface-raised border border-border text-text-muted space-y-1">
            <div>
              <span className="font-bold text-text">Bay:</span> Slot #{cancellingRes?.slot?.slotNumber} (
              {cancellingRes?.slot?.lotName})
            </div>
            <div>
              <span className="font-bold text-text">Interval:</span> {formatDateTime(cancellingRes?.startTime)} →{' '}
              {formatDateTime(cancellingRes?.endTime)}
            </div>
            <div>
              <span className="font-bold text-text">Vehicle:</span> {cancellingRes?.vehicle?.plateNumber}
            </div>
          </div>

          <p className="text-[11px] text-text-muted/80 leading-relaxed">
            Cancelling this reservation will immediately free the parking bay for other customers.
          </p>
        </div>
      </Dialog>
    </div>
  );
};
