import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowRightLeft,
  Search,
  Clock,
  User,
  Car,
  Grid3X3,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Eye,
  LogIn,
  LogOut,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { sessionsApi, parkingApi, vehiclesApi } from '../lib/api';

const STATUS_VARIANTS = {
  ACTIVE: 'brand',
  COMPLETED: 'info',
};

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

const formatDuration = (minutes) => {
  if (minutes == null || isNaN(minutes)) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
};

// ─── Entry Modal ─────────────────────────────────────────────────────────────

const EntryModal = ({ open, onClose, onSuccess, token, toast }) => {
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSlotId('');
    setVehicleId('');
    setError('');
    setIsSubmitting(false);

    const loadRefData = async () => {
      try {
        const [slotsRes, vehiclesRes] = await Promise.all([
          parkingApi.getSlots({ status: 'AVAILABLE' }, token),
          vehiclesApi.getMyVehicles(token),
        ]);
        // Admin gets all vehicles; for slot list, show all AVAILABLE slots
        setSlots(slotsRes?.data?.slots || []);
        setVehicles(vehiclesRes?.data?.vehicles || []);
      } catch {
        // Non-fatal: dropdowns just stay empty
      }
    };

    loadRefData();
  }, [open, token]);

  const handleSubmit = async () => {
    if (!slotId || !vehicleId) {
      setError('Please select both a parking slot and a vehicle.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await sessionsApi.recordEntry(
        { slotId: Number(slotId), vehicleId: Number(vehicleId) },
        token
      );
      toast({
        type: 'success',
        title: 'Vehicle Entry Recorded',
        message: `Parking session started for slot #${slotId}.`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Record Vehicle Entry"
      description="Select the parking slot and vehicle to create a new session. Entry timestamp will be generated server-side."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="entry-slot-select"
            className="text-[10px] text-text-muted uppercase font-bold tracking-wide"
          >
            Parking Slot
          </label>
          <select
            id="entry-slot-select"
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            disabled={isSubmitting}
          >
            <option value="">— Select Slot —</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.slotNumber} ({s.slotType}) — {s.lotName || `Lot #${s.lotId}`}
              </option>
            ))}
            {slots.length === 0 && (
              <option disabled value="">
                No available slots found
              </option>
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="entry-vehicle-select"
            className="text-[10px] text-text-muted uppercase font-bold tracking-wide"
          >
            Vehicle
          </label>
          <select
            id="entry-vehicle-select"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            disabled={isSubmitting}
          >
            <option value="">— Select Vehicle —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateNumber} — {v.makeModel || v.vehicleType}
              </option>
            ))}
            {vehicles.length === 0 && (
              <option disabled value="">
                No registered vehicles found
              </option>
            )}
          </select>
        </div>

        <p className="text-[11px] text-text-muted">
          Entry timestamp is generated by the server and cannot be overridden.
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-xs text-status-occupied">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={LogIn}
            onClick={handleSubmit}
            disabled={isSubmitting || !slotId || !vehicleId}
          >
            {isSubmitting ? 'Recording…' : 'Record Entry'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Exit Confirmation Modal ─────────────────────────────────────────────────

const ExitModal = ({ session, open, onClose, onSuccess, token, toast }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setIsSubmitting(false);
    }
  }, [open]);

  if (!session || !open) return null;

  const projectedMinutes = (() => {
    if (!session.entryTime) return 0;
    const entry = new Date(session.entryTime);
    const now = Date.now();
    return Math.max(0, Math.floor((now - entry.getTime()) / 60000));
  })();

  const projectedBillableHours = Math.max(1, Math.ceil(projectedMinutes / 60));
  const projectedFee = (projectedBillableHours * (session.hourlyRateSnapshot || 5)).toFixed(2);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await sessionsApi.recordExit(session.id, {}, token);
      toast({
        type: 'success',
        title: 'Exit Recorded',
        message: `Session #${session.id} completed. Fee calculated server-side.`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record exit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm Vehicle Exit"
      description="Review the session details before recording the vehicle exit. The final fee is calculated server-side."
    >
      <div className="space-y-4">
        {/* Session Info Preview */}
        <div className="park-card p-4 space-y-3 bg-surface-raised/60">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Vehicle</div>
              <div className="font-bold text-text font-mono">{session.vehicle?.plateNumber || 'N/A'}</div>
              <div className="text-[11px] text-text-muted">{session.vehicle?.makeModel || session.vehicle?.vehicleType}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Slot</div>
              <div className="font-bold text-text">#{session.slot?.slotNumber || session.slotId}</div>
              <div className="text-[11px] text-text-muted">{session.slot?.lotName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Entry Time</div>
              <div className="font-bold text-text">{formatDateTime(session.entryTime)}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Hourly Rate</div>
              <div className="font-bold text-brand">${(session.hourlyRateSnapshot || 5).toFixed(2)}/hr</div>
            </div>
          </div>

          {/* Projected Fee Notice */}
          <div className="border-t border-border/40 pt-3 flex items-center justify-between">
            <div className="text-[10px] text-text-muted uppercase font-bold">
              Estimated Charge (Current Duration: ~{formatDuration(projectedMinutes)})
            </div>
            <div className="text-sm font-bold text-brand">${projectedFee}</div>
          </div>
          <p className="text-[10px] text-text-muted">
            Actual fee and duration are calculated by the server at exit time. Minimum 1 hour billable.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-xs text-status-occupied">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={LogOut}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            {isSubmitting ? 'Processing…' : 'Confirm Exit'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Session Detail Modal ────────────────────────────────────────────────────

const SessionDetailModal = ({ session, open, onClose }) => {
  if (!session || !open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Session #${session.id} Details`}
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Status</div>
            <Badge variant={STATUS_VARIANTS[session.status] || 'neutral'}>
              {session.status}
            </Badge>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Session ID</div>
            <div className="font-mono font-bold text-text">#{session.id}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Vehicle</div>
            <div className="font-mono font-bold text-text">{session.vehicle?.plateNumber || 'N/A'}</div>
            <div className="text-[11px] text-text-muted">{session.vehicle?.makeModel || session.vehicle?.vehicleType}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Customer</div>
            <div className="font-bold text-text">{session.user?.fullName || 'N/A'}</div>
            <div className="text-[11px] text-text-muted">{session.user?.email || ''}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Slot</div>
            <div className="font-bold text-text">#{session.slot?.slotNumber || session.slotId}</div>
            <div className="text-[11px] text-text-muted">{session.slot?.lotName || 'N/A'}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Reservation</div>
            <div className="font-bold text-text">
              {session.reservationId ? `#RES-${session.reservationId}` : 'Walk-in (No Reservation)'}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Entry Time</div>
            <div className="font-bold text-text">{formatDateTime(session.entryTime)}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Exit Time</div>
            <div className="font-bold text-text">{formatDateTime(session.exitTime)}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Duration</div>
            <div className="font-bold text-text">{formatDuration(session.durationMinutes)}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Billable Hours</div>
            <div className="font-bold text-text">{session.billableHours ?? 'N/A'}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Rate Snapshot</div>
            <div className="font-bold text-brand">${(session.hourlyRateSnapshot || 5).toFixed(2)}/hr</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Total Fee</div>
            <div className="font-bold text-brand text-base">
              {session.totalFee != null ? `$${session.totalFee.toFixed(2)}` : '—'}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Main AdminSessionsPage ──────────────────────────────────────────────────

export const AdminSessionsPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const { token } = useAuth();
  const { toast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lotFilter, setLotFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [exitingSession, setExitingSession] = useState(null);
  const [inspectingSession, setInspectingSession] = useState(null);

  // Load reference lots
  const loadLots = useCallback(async () => {
    try {
      const res = await parkingApi.getLots({}, token);
      setLots(res?.data?.lots || []);
    } catch {
      // Non-fatal
    }
  }, [token]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (lotFilter !== 'ALL') params.lotId = lotFilter;

      const res = await sessionsApi.getSessions(params, token);
      setSessions(res?.data?.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve parking sessions.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, lotFilter, token]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Client-side search filter
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      const plateMatch = s.vehicle?.plateNumber?.toLowerCase().includes(q);
      const nameMatch = s.user?.fullName?.toLowerCase().includes(q);
      const slotMatch = s.slot?.slotNumber?.toLowerCase().includes(q);
      const lotMatch = s.slot?.lotName?.toLowerCase().includes(q);
      const idMatch = String(s.id).includes(q);
      return plateMatch || nameMatch || slotMatch || lotMatch || idMatch;
    });
  }, [sessions, searchQuery]);

  // Summary KPIs
  const metrics = useMemo(() => {
    const active = sessions.filter((s) => s.status === 'ACTIVE');
    const completed = sessions.filter((s) => s.status === 'COMPLETED');
    const totalRevenue = completed.reduce((sum, s) => sum + (s.totalFee || 0), 0);
    return {
      total: sessions.length,
      active: active.length,
      completed: completed.length,
      totalRevenue,
    };
  }, [sessions]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand font-bold uppercase tracking-wider mb-1">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Operations Console</span>
          </div>
          <h1 className="park-page-title">
            Vehicle Entry &amp; Exit
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Record physical vehicle arrivals and departures with server-side fee calculation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadSessions}
            disabled={isLoading}
            title="Refresh sessions"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={LogIn}
            onClick={() => setEntryModalOpen(true)}
            id="record-entry-btn"
          >
            Record Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="park-card p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold">Total Sessions</span>
          <span className="text-xl font-bold text-text mt-1">{metrics.total}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-brand/30 bg-brand/5">
          <span className="text-[10px] text-brand uppercase font-bold">Active Now</span>
          <span className="text-xl font-bold text-brand mt-1">{metrics.active}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-info/30 bg-status-info/5">
          <span className="text-[10px] text-status-info uppercase font-bold">Completed</span>
          <span className="text-xl font-bold text-status-info mt-1">{metrics.completed}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-border">
          <span className="text-[10px] text-text-muted uppercase font-bold">Demo Revenue</span>
          <span className="text-xl font-bold text-text mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-text-muted">Simulated session fees; no real money charged</span>
        </div>
      </div>

      {/* Filters */}
      <div className="park-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plate, customer, slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand"
              aria-label="Search sessions"
            />
          </div>

          <select
            value={lotFilter}
            onChange={(e) => setLotFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            aria-label="Filter by lot"
          >
            <option value="ALL">All Facility Lots</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE (Parked)</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
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
          title="Could not load sessions"
          message={error}
          onRetry={loadSessions}
        />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No sessions found"
          description={
            searchQuery || statusFilter !== 'ALL' || lotFilter !== 'ALL'
              ? 'No sessions match your current filters. Try broadening your search.'
              : 'No parking sessions have been recorded yet. Use "Record Entry" to start one.'
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredSessions.map((session) => {
              const variant = STATUS_VARIANTS[session.status] || 'neutral';
              const isActive = session.status === 'ACTIVE';

              return (
                <motion.div
                  key={session.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                  className="park-card p-4 sm:p-5 hover:border-brand/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Session Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-sm text-text font-mono">
                        #SES-{session.id}
                      </span>
                      <Badge variant={variant} size="sm">
                        {session.status}
                      </Badge>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] text-brand animate-pulse">
                          <Timer className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {session.reservationId && (
                        <span className="text-[10px] text-text-muted">
                          #RES-{session.reservationId}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      {/* Customer */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-brand" />
                          <span>Customer</span>
                        </div>
                        <div className="font-bold text-text truncate">
                          {session.user?.fullName || 'Anonymous'}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">
                          {session.user?.email || '—'}
                        </div>
                      </div>

                      {/* Slot */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <Grid3X3 className="w-3 h-3 text-amber-400" />
                          <span>Parking Bay</span>
                        </div>
                        <div className="font-bold text-text truncate">
                          Slot #{session.slot?.slotNumber || session.slotId} ({session.slot?.slotType || 'N/A'})
                        </div>
                        <div className="text-[11px] text-text-muted truncate">
                          {session.slot?.lotName || 'Facility'}
                        </div>
                      </div>

                      {/* Vehicle */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <Car className="w-3 h-3 text-brand" />
                          <span>Vehicle</span>
                        </div>
                        <div className="font-bold text-text font-mono uppercase truncate">
                          {session.vehicle?.plateNumber || 'N/A'}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">
                          {session.vehicle?.makeModel || session.vehicle?.vehicleType || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Timestamps & Fee Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-status-available" />
                        <span>{formatDateTime(session.entryTime)}</span>
                      </div>
                      {session.exitTime && (
                        <div className="flex items-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5 text-status-occupied" />
                          <span>{formatDateTime(session.exitTime)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(session.durationMinutes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-brand" />
                        <span className="text-text font-bold">
                          {session.totalFee != null
                            ? `$${session.totalFee.toFixed(2)}`
                            : `$${session.hourlyRateSnapshot?.toFixed(2) || '5.00'}/hr`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setInspectingSession(session)}
                      title="View session details"
                    >
                      Details
                    </Button>

                    {isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={LogOut}
                        onClick={() => setExitingSession(session)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                        title="Record vehicle exit"
                      >
                        Record Exit
                      </Button>
                    )}

                    {session.status === 'COMPLETED' && (
                      <div className="flex items-center gap-1 text-[11px] text-status-available font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <EntryModal
        open={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        onSuccess={loadSessions}
        token={token}
        toast={toast}
      />

      <ExitModal
        session={exitingSession}
        open={!!exitingSession}
        onClose={() => setExitingSession(null)}
        onSuccess={loadSessions}
        token={token}
        toast={toast}
      />

      <SessionDetailModal
        session={inspectingSession}
        open={!!inspectingSession}
        onClose={() => setInspectingSession(null)}
      />
    </div>
  );
};
