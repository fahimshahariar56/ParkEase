import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  MapPin,
  Car,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  ParkingSquare,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button, Badge, Dialog, EmptyState, ErrorState, CardSkeleton, useToast } from '../components/ui';
import { parkingApi, vehiclesApi, reservationsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  { value: '', label: 'Any Vehicle Type' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'STANDARD_CAR', label: 'Standard Car' },
  { value: 'SUV', label: 'SUV' },
  { value: 'VAN', label: 'Van' },
  { value: 'TRUCK', label: 'Truck' },
];

const SLOT_TYPE_LABELS = {
  MOTORCYCLE: 'Motorcycle Bay',
  STANDARD_CAR: 'Standard Car',
  SUV: 'SUV / Large',
  VAN: 'Van Bay',
  TRUCK: 'Truck Bay',
};

const STATUS_BADGE_VARIANT = {
  AVAILABLE: 'available',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'neutral',
};

const STATUS_LABEL = {
  AVAILABLE: 'Available',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactive',
};

/**
 * Round a Date to the next whole hour.
 */
function nextHour(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

/**
 * Format a Date to a local datetime-local input value (YYYY-MM-DDTHH:mm).
 */
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes())
  );
}

/**
 * Parse a local datetime-local input string to ISO 8601.
 */
function toISO(localStr) {
  if (!localStr) return null;
  return new Date(localStr).toISOString();
}

// ─── ReservationConfirmDialog ────────────────────────────────────────────────

function formatDateTimeShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ReservationConfirmDialog = ({
  isOpen,
  slot,
  filters,
  userVehicles,
  token,
  onSuccess,
  onClose,
}) => {
  const { toast } = useToast();
  const [vehicleId, setVehicleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState(null); // reservation object on success

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setVehicleId(userVehicles.length === 1 ? String(userVehicles[0].id) : '');
      setSubmitError('');
      setConfirmed(null);
      setIsSubmitting(false);
    }
  }, [isOpen, userVehicles]);

  const handleConfirm = async () => {
    if (!vehicleId) {
      setSubmitError('Please select a vehicle.');
      return;
    }
    if (!filters.startTime || !filters.endTime) {
      setSubmitError('Please select a time window on the search form first.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await reservationsApi.createReservation(
        {
          vehicleId: Number(vehicleId),
          slotId: slot.id,
          startTime: filters.startTime,
          endTime: filters.endTime,
        },
        token
      );
      const reservation = res.data?.reservation;
      setConfirmed(reservation);
      toast({
        type: 'success',
        title: 'Reservation Confirmed',
        message: `Slot ${slot.slotNumber} reserved. Ref #${reservation?.id}.`,
        duration: 6000,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationHours = filters.startTime && filters.endTime
    ? Math.max(1, Math.ceil((new Date(filters.endTime) - new Date(filters.startTime)) / 3600000))
    : null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={confirmed ? onClose : () => !isSubmitting && onClose()}
      title={confirmed ? 'Reservation Confirmed' : `Reserve Slot ${slot?.slotNumber ?? ''}`}
      description={
        confirmed
          ? `Reference #${confirmed.id}`
          : slot?.lotName ?? ''
      }
      footer={
        confirmed ? (
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                onClose();
                window.location.replace('/reservations');
              }}
            >
              View Reservations
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirm}
            >
              Confirm Reservation
            </Button>
          </>
        )
      }
    >
      {confirmed ? (
        /* ── Success state ── */
        <div className="text-center py-4 space-y-3 font-mono">
          <div className="w-14 h-14 rounded-full bg-status-available/15 text-status-available border border-status-available/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-text">Booking Successful</h3>
          <p className="text-xs text-text-muted">
            Slot <span className="text-brand font-semibold">{slot?.slotNumber}</span>
            {slot?.lotName && <> at {slot.lotName}</>} has been reserved.
          </p>
          <div className="text-xs bg-brand/10 border border-brand/20 text-brand rounded-input px-3 py-2 font-medium">
            DEMO — No real money charged
          </div>
        </div>
      ) : (
        /* ── Confirmation form ── */
        <div className="space-y-4 font-mono text-xs">
          {/* Slot details */}
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-text-muted">Slot</span>
              <span className="font-semibold text-text">
                {slot?.slotNumber} · {SLOT_TYPE_LABELS[slot?.slotType] || slot?.slotType}
              </span>
            </div>
            {slot?.lotName && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">Location</span>
                <span className="font-medium text-text">{slot.lotName}</span>
              </div>
            )}
            {filters.startTime && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">From</span>
                <span className="font-medium text-text">{formatDateTimeShort(filters.startTime)}</span>
              </div>
            )}
            {filters.endTime && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">To</span>
                <span className="font-medium text-text">{formatDateTimeShort(filters.endTime)}</span>
              </div>
            )}
            {durationHours && (
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-text-muted">Duration</span>
                <span className="font-medium text-text">{durationHours} hr{durationHours !== 1 ? 's' : ''} (est.)</span>
              </div>
            )}
          </div>

          {/* Vehicle selector */}
          <div className="space-y-1.5">
            <label htmlFor="confirm-vehicle" className="block text-xs font-medium text-text-muted">
              Vehicle <span className="text-status-occupied">*</span>
            </label>
            {userVehicles.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-status-pending bg-status-pending/10 border border-status-pending/30 rounded-input px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                No registered vehicles. Add a vehicle from your Profile page first.
              </div>
            ) : (
              <select
                id="confirm-vehicle"
                value={vehicleId}
                onChange={(e) => { setVehicleId(e.target.value); setSubmitError(''); }}
                className="w-full bg-surface-raised text-text text-sm font-mono border border-border rounded-input px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand appearance-none"
                aria-required="true"
              >
                <option value="">— Select a vehicle —</option>
                {userVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} · {v.vehicleType}
                    {v.makeModel ? ` (${v.makeModel})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Demo notice */}
          <div className="text-[11px] bg-brand/10 border border-brand/20 text-brand rounded-input px-3 py-2 font-medium">
            DEMO PAYMENT — NO REAL MONEY CHARGED
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 text-xs text-status-occupied bg-status-occupied/10 border border-status-occupied/30 rounded-input px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {submitError}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};

// ─── SlotCard ────────────────────────────────────────────────────────────────

const SlotCard = ({ slot, isSelected, onSelect, onReserve }) => {
  const isAvailable = slot.status === 'AVAILABLE';
  const badgeVariant = STATUS_BADGE_VARIANT[slot.status] || 'neutral';
  const statusLabel = STATUS_LABEL[slot.status] || slot.status;
  const slotTypeLabel = SLOT_TYPE_LABELS[slot.slotType] || slot.slotType;

  const handleKey = (e) => {
    if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect(slot);
    }
  };

  return (
    <div
      role="button"
      aria-pressed={isSelected}
      aria-disabled={!isAvailable}
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={handleKey}
      onClick={isAvailable ? () => onSelect(slot) : undefined}
      className={`
        relative rounded-card border font-mono transition-all duration-150
        ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
        ${isSelected
          ? 'bg-brand/10 border-brand shadow-[0_0_0_2px_var(--color-brand)]'
          : isAvailable
            ? 'bg-surface border-border hover:border-brand/50 hover:shadow-raised'
            : 'bg-surface border-border'
        }
      `}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 text-brand" aria-hidden="true">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 border-b border-border/60">
        <div className="min-w-0">
          <p className="font-bold text-base text-text tracking-tight truncate">
            Slot <span className="text-brand">{slot.slotNumber}</span>
          </p>
          <p className="text-xs text-text-muted mt-0.5 truncate">
            {slot.lotName || `Lot #${slot.lotId}`}
          </p>
        </div>
        <Badge variant={badgeVariant} showDot size="sm">
          {statusLabel}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-5 space-y-2 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 flex-shrink-0 text-brand/70" aria-hidden="true" />
          <span>Compatible: <span className="text-text font-medium">{slotTypeLabel}</span></span>
        </div>
        {slot.lotAddress && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand/70 mt-0.5" aria-hidden="true" />
            <span className="truncate">{slot.lotAddress}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border/60 bg-surface-subtle/40 rounded-b-card flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted">
          {isAvailable
            ? isSelected
              ? <span className="text-brand font-semibold">Selected</span>
              : 'Click to select'
            : statusLabel}
        </span>
        <div className="flex items-center gap-2">
          {isSelected && (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={(e) => { e.stopPropagation(); onReserve(slot); }}
              tabIndex={-1}
              aria-hidden="true"
            >
              Reserve
            </Button>
          )}
          <Button
            variant={isSelected ? 'outline' : isAvailable ? 'secondary' : 'secondary'}
            size="sm"
            disabled={!isAvailable}
            onClick={isAvailable ? (e) => { e.stopPropagation(); onSelect(slot); } : undefined}
            tabIndex={-1}
            aria-hidden="true"
          >
            {isSelected ? 'Deselect' : isAvailable ? 'Select' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── SelectionSummary ─────────────────────────────────────────────────────────

const SelectionSummary = ({ slot, filters, onClear, onReserve }) => {
  if (!slot) return null;

  return (
    <div
      className="park-card border-brand/40 bg-brand/5 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text">
            Slot <span className="text-brand">{slot.slotNumber}</span> selected
          </p>
          <p className="text-xs text-text-muted truncate">
            {slot.lotName || `Lot #${slot.lotId}`}
            {' · '}
            {SLOT_TYPE_LABELS[slot.slotType] || slot.slotType}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {filters.startTime && filters.endTime && (
          <div className="text-xs text-text-muted font-mono hidden sm:block">
            {new Date(filters.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' → '}
            {new Date(filters.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => onReserve(slot)}>
          Reserve
        </Button>
      </div>
    </div>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const FilterBar = ({
  filters,
  lots,
  userVehicles,
  validationError,
  isLoading,
  onFilterChange,
  onSubmit,
  onReset,
}) => {
  const defaultStart = toLocalInputValue(nextHour());
  const defaultEnd = toLocalInputValue(nextHour(new Date(nextHour().getTime() + 2 * 3600_000)));

  const [localStart, setLocalStart] = useState(filters.rawStart || defaultStart);
  const [localEnd, setLocalEnd] = useState(filters.rawEnd || defaultEnd);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rawStart: localStart, rawEnd: localEnd });
  };

  const handleReset = () => {
    setLocalStart(defaultStart);
    setLocalEnd(defaultEnd);
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="park-card p-4 md:p-6 space-y-4"
      aria-label="Parking search filters"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lot selector */}
        <div className="w-full space-y-1.5 font-mono">
          <label
            htmlFor="filter-lot"
            className="block text-xs font-medium text-text-muted select-none"
          >
            Parking Lot
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-text-muted">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="filter-lot"
              value={filters.lotId}
              onChange={(e) => onFilterChange('lotId', e.target.value)}
              className="w-full bg-surface-raised text-text text-sm font-mono border border-border rounded-input pl-10 pr-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand appearance-none"
            >
              <option value="">All Parking Lots</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle type selector — prefer user's registered vehicles */}
        <div className="w-full space-y-1.5 font-mono">
          <label
            htmlFor="filter-vehicle"
            className="block text-xs font-medium text-text-muted select-none"
          >
            Vehicle Type
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-text-muted">
              <Car className="w-4 h-4" />
            </div>
            <select
              id="filter-vehicle"
              value={filters.vehicleType}
              onChange={(e) => onFilterChange('vehicleType', e.target.value)}
              className="w-full bg-surface-raised text-text text-sm font-mono border border-border rounded-input pl-10 pr-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand appearance-none"
            >
              {userVehicles.length > 0 ? (
                <>
                  <option value="">Any Vehicle Type</option>
                  <optgroup label="My Vehicles">
                    {userVehicles.map((v) => (
                      <option key={v.id} value={v.vehicleType}>
                        {v.plateNumber} — {SLOT_TYPE_LABELS[v.vehicleType] || v.vehicleType}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Types">
                    {VEHICLE_TYPES.filter(
                      (vt) => vt.value && !userVehicles.some((uv) => uv.vehicleType === vt.value)
                    ).map((vt) => (
                      <option key={vt.value} value={vt.value}>
                        {vt.label}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                VEHICLE_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>
                    {vt.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Start time */}
        <div className="w-full space-y-1.5 font-mono">
          <label
            htmlFor="filter-start"
            className="block text-xs font-medium text-text-muted select-none"
          >
            From
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-text-muted">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="filter-start"
              type="datetime-local"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className={`w-full bg-surface-raised text-text text-sm font-mono border rounded-input pl-10 pr-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${validationError ? 'border-status-occupied' : 'border-border'}`}
              aria-invalid={Boolean(validationError)}
            />
          </div>
        </div>

        {/* End time */}
        <div className="w-full space-y-1.5 font-mono">
          <label
            htmlFor="filter-end"
            className="block text-xs font-medium text-text-muted select-none"
          >
            To
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-text-muted">
              <Clock className="w-4 h-4" />
            </div>
            <input
              id="filter-end"
              type="datetime-local"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className={`w-full bg-surface-raised text-text text-sm font-mono border rounded-input pl-10 pr-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${validationError ? 'border-status-occupied' : 'border-border'}`}
              aria-invalid={Boolean(validationError)}
            />
          </div>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs text-status-occupied font-mono"
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {validationError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Search}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Searching…' : 'Search Slots'}
        </Button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const INITIAL_FILTERS = {
  lotId: '',
  vehicleType: '',
  rawStart: '',
  rawEnd: '',
  startTime: null, // ISO string set after form submit
  endTime: null,
};

export const FindParkingPage = () => {
  const { token } = useAuth();

  // Filters state
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [validationError, setValidationError] = useState('');

  // Data state
  const [lots, setLots] = useState([]);
  const [userVehicles, setUserVehicles] = useState([]);
  const [slots, setSlots] = useState([]);

  // Status state
  const [lotsError, setLotsError] = useState(null);
  const [slotsError, setSlotsError] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selection state
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Reservation confirmation dialog state
  const [reserveTarget, setReserveTarget] = useState(null);

  // Avoid stale-closure issues during concurrent fetch
  const fetchIdRef = useRef(0);

  // ── Load parking lots on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    parkingApi.getLots()
      .then((res) => {
        if (!cancelled) setLots(res.data?.lots || []);
      })
      .catch(() => {
        if (!cancelled) setLotsError('Failed to load parking lots.');
      });
    return () => { cancelled = true; };
  }, []);

  // ── Load user's registered vehicles (if authenticated) ─────────────────────
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    vehiclesApi.getMyVehicles(token)
      .then((res) => {
        if (!cancelled) setUserVehicles(res.data?.vehicles || []);
      })
      .catch(() => {
        /* non-critical — fall back to generic type dropdown */
      });
    return () => { cancelled = true; };
  }, [token]);

  // ── Validate time window ───────────────────────────────────────────────────
  const validateTimes = useCallback((rawStart, rawEnd) => {
    if (!rawStart || !rawEnd) {
      return 'Please select both a start and end date/time.';
    }
    const start = new Date(rawStart);
    const end = new Date(rawEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date/time format.';
    }
    if (end <= start) {
      return 'End time must be after start time.';
    }
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 15 * 60_000) {
      return 'Minimum booking duration is 15 minutes.';
    }
    if (diffMs > 7 * 24 * 3600_000) {
      return 'Maximum booking duration is 7 days.';
    }
    if (end.getTime() <= Date.now()) {
      return 'The selected time window is in the past.';
    }
    return null;
  }, []);

  // ── Fetch available slots ─────────────────────────────────────────────────
  const fetchSlots = useCallback(async (activeFilters) => {
    const id = ++fetchIdRef.current;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);
    setHasSearched(true);

    try {
      const params = {};
      if (activeFilters.startTime) params.startTime = activeFilters.startTime;
      if (activeFilters.endTime) params.endTime = activeFilters.endTime;
      if (activeFilters.lotId) params.lotId = activeFilters.lotId;
      if (activeFilters.vehicleType) params.vehicleType = activeFilters.vehicleType;

      const useAvailability = Boolean(params.startTime && params.endTime);
      const res = useAvailability
        ? await parkingApi.getAvailableSlots(params, token || undefined)
        : await parkingApi.getSlots({ ...(params.lotId ? { lotId: params.lotId } : {}) }, token || undefined);

      if (fetchIdRef.current !== id) return; // stale

      const rawSlots = res.data?.slots || [];
      setSlots(rawSlots);
    } catch (err) {
      if (fetchIdRef.current !== id) return;
      setSlotsError(err.message || 'Failed to load parking slots. Please try again.');
    } finally {
      if (fetchIdRef.current === id) setSlotsLoading(false);
    }
  }, [token]);

  // ── Initial load on mount (show all slots without time filter) ─────────────
  useEffect(() => {
    fetchSlots(INITIAL_FILTERS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle filter field changes ────────────────────────────────────────────
  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  }, []);

  // ── Handle form submit ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(({ rawStart, rawEnd }) => {
    const error = validateTimes(rawStart, rawEnd);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    const startISO = toISO(rawStart);
    const endISO = toISO(rawEnd);
    const nextFilters = {
      ...filters,
      rawStart,
      rawEnd,
      startTime: startISO,
      endTime: endISO,
    };
    setFilters(nextFilters);
    fetchSlots(nextFilters);
  }, [filters, fetchSlots, validateTimes]);

  // ── Handle reset ──────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setValidationError('');
    setSelectedSlot(null);
    fetchSlots(INITIAL_FILTERS);
  }, [fetchSlots]);

  // ── Handle slot selection ─────────────────────────────────────────────────
  const handleSelectSlot = useCallback((slot) => {
    setSelectedSlot((prev) => (prev?.id === slot.id ? null : slot));
  }, []);

  // ── Open reservation dialog ──────────────────────────────────────────────
  const handleReserve = useCallback((slot) => {
    setSelectedSlot(slot);
    setReserveTarget(slot);
  }, []);

  // ── After successful reservation ─────────────────────────────────────────
  const handleReservationSuccess = useCallback(() => {
    // Refresh slots so the just-reserved slot won't show as available
    fetchSlots(filters);
    setSelectedSlot(null);
  }, [fetchSlots, filters]);

  // ── Summary stats from current results ───────────────────────────────────
  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-mono">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">
            Find Parking
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Search available slots by lot, vehicle type, and time window.
          </p>
        </div>
        {hasSearched && !slotsLoading && !slotsError && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {availableCount > 0 && (
              <Badge variant="available" size="sm">
                {availableCount} Available
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {slots.length} Total
            </Badge>
          </div>
        )}
      </div>

      {/* Lot load error (non-fatal) */}
      {lotsError && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs text-status-pending font-mono bg-status-pending/10 border border-status-pending/30 rounded-input px-4 py-3"
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {lotsError} Lot filter may not be available.
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        lots={lots}
        userVehicles={userVehicles}
        validationError={validationError}
        isLoading={slotsLoading}
        onFilterChange={handleFilterChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {/* Selection summary */}
      <SelectionSummary
        slot={selectedSlot}
        filters={filters}
        onClear={() => setSelectedSlot(null)}
        onReserve={handleReserve}
      />

      {/* Results */}
      <section aria-label="Parking slot results" aria-live="polite" aria-busy={slotsLoading}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight text-text">
            {filters.startTime
              ? 'Available Slots'
              : 'Parking Slots'}
          </h2>
          {slots.length > 0 && !slotsLoading && (
            <p className="text-xs text-text-muted">
              {slots.length} slot{slots.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Loading */}
        {slotsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton count={6} />
          </div>
        )}

        {/* Error */}
        {!slotsLoading && slotsError && (
          <ErrorState
            title="Failed to load slots"
            message={slotsError}
            onRetry={() => fetchSlots(filters)}
          />
        )}

        {/* Empty */}
        {!slotsLoading && !slotsError && hasSearched && slots.length === 0 && (
          <EmptyState
            icon={ParkingSquare}
            title="No slots found"
            description={
              filters.startTime
                ? 'No slots are available for the selected time window, vehicle type, or lot. Try adjusting your filters.'
                : 'No parking slots are configured. Contact an administrator.'
            }
            actionLabel="Reset Filters"
            actionIcon={RotateCcw}
            onAction={handleReset}
          />
        )}

        {/* Slot grid */}
        {!slotsLoading && !slotsError && slots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot?.id === slot.id}
                onSelect={handleSelectSlot}
                onReserve={handleReserve}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reservation confirmation dialog */}
      {reserveTarget && (
        <ReservationConfirmDialog
          isOpen={Boolean(reserveTarget)}
          slot={reserveTarget}
          filters={filters}
          userVehicles={userVehicles}
          token={token}
          onSuccess={handleReservationSuccess}
          onClose={() => setReserveTarget(null)}
        />
      )}
    </div>
  );
};
