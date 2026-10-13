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
} from 'lucide-react';
import { Button, Badge, EmptyState, ErrorState, CardSkeleton } from '../components/ui';
import { parkingApi, vehiclesApi } from '../lib/api';
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

// ─── SlotCard ────────────────────────────────────────────────────────────────

const SlotCard = ({ slot, isSelected, onSelect }) => {
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
        <Button
          variant={isSelected ? 'outline' : isAvailable ? 'primary' : 'secondary'}
          size="sm"
          disabled={!isAvailable}
          onClick={isAvailable ? () => onSelect(slot) : undefined}
          tabIndex={-1} // slot div is the keyboard target
          aria-hidden="true"
        >
          {isSelected ? 'Deselect' : isAvailable ? 'Select' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};

// ─── SelectionSummary ─────────────────────────────────────────────────────────

const SelectionSummary = ({ slot, filters, onClear }) => {
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
        <div className="text-xs text-brand/80 bg-brand/10 border border-brand/20 rounded-input px-2.5 py-1 font-medium">
          DEMO — No real money charged
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
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
              />
            ))}
          </div>
        )}
      </section>

      {/* Day 14 scope note: reservation confirmation is Day 15 */}
      {selectedSlot && (
        <div className="park-card border-border p-4 text-xs text-text-muted font-mono flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          Slot <span className="text-brand font-semibold">{selectedSlot.slotNumber}</span> selected.
          Reservation confirmation will be available in the next step.
        </div>
      )}
    </div>
  );
};
