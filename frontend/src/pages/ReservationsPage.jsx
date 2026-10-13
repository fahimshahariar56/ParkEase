import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  Button,
  Badge,
  Dialog,
  EmptyState,
  ErrorState,
  CardSkeleton,
  useToast,
} from '../components/ui';
import { reservationsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// ─── ReservationCard ──────────────────────────────────────────────────────────

const ReservationCard = ({ reservation, onCancel }) => {
  const { slot, vehicle } = reservation;
  const statusVariant = STATUS_BADGE[reservation.status] || 'neutral';
  const statusLabel = STATUS_LABEL[reservation.status] || reservation.status;
  const isCancellable = CANCELLABLE_STATUSES.includes(reservation.status);

  return (
    <div className="park-card overflow-hidden font-mono">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 border-b border-border/60">
        <div className="min-w-0">
          <p className="font-bold text-base text-text tracking-tight">
            Reservation <span className="text-brand">#{reservation.id}</span>
          </p>
          {slot && (
            <p className="text-xs text-text-muted mt-0.5 truncate">
              Slot <span className="text-text font-medium">{slot.slotNumber}</span>
              {slot.lotName && <> · {slot.lotName}</>}
            </p>
          )}
        </div>
        <Badge variant={statusVariant} size="sm">
          {statusLabel}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-muted">
        {vehicle && (
          <div className="flex items-start gap-2">
            <Car className="w-3.5 h-3.5 flex-shrink-0 text-brand/70 mt-0.5" />
            <div>
              <p className="text-text font-semibold">{vehicle.plateNumber}</p>
              <p>{vehicle.vehicleType}</p>
            </div>
          </div>
        )}
        {slot?.lotAddress && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand/70 mt-0.5" />
            <p className="truncate">{slot.lotAddress}</p>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-brand/70 mt-0.5" />
          <div>
            <p>{formatDateTime(reservation.startTime)}</p>
            <p className="flex items-center gap-1 mt-0.5">
              <ArrowRight className="w-3 h-3" />
              {formatDateTime(reservation.endTime)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-3.5 h-3.5 flex-shrink-0 text-brand/70 text-[10px] font-bold mt-0.5">$</span>
          <div>
            <p className="text-text font-semibold">{formatCurrency(reservation.totalEstimatedFee)}</p>
            <p>{formatCurrency(reservation.hourlyRateSnapshot)}/hr · estimated</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border/60 bg-surface-subtle/40 rounded-b-card flex items-center justify-between gap-3">
        <p className="text-[11px] text-text-muted">
          Booked {formatDateTime(reservation.createdAt)}
        </p>
        {isCancellable && (
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={() => onCancel(reservation)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── CancelDialog ─────────────────────────────────────────────────────────────

const CancelDialog = ({ reservation, isOpen, isLoading, error, onConfirm, onClose }) => {
  if (!reservation) return null;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Reservation"
      description={`Reservation #${reservation.id} — ${reservation.slot?.slotNumber ?? ''}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Keep
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Confirm Cancel
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm font-mono">
        <p className="text-text-muted text-xs">
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </p>
        <div className="space-y-1.5 text-xs">
          {reservation.slot && (
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Slot</span>
              <span className="font-semibold text-text">
                {reservation.slot.slotNumber} · {reservation.slot.lotName}
              </span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-muted">Period</span>
            <span className="font-medium text-text">
              {formatDateTime(reservation.startTime)} → {formatDateTime(reservation.endTime)}
            </span>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-status-occupied bg-status-occupied/10 border border-status-occupied/30 rounded-input px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const ReservationsPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // ── Load reservations ─────────────────────────────────────────────────────
  const loadReservations = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await reservationsApi.getMyReservations(token);
      setReservations(res.data?.reservations || []);
    } catch (err) {
      setError(err.message || 'Failed to load your reservations.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // ── Cancel flow ───────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await reservationsApi.cancelReservation(cancelTarget.id, token);
      toast({
        type: 'success',
        title: 'Reservation Cancelled',
        message: `Reservation #${cancelTarget.id} has been cancelled.`,
      });
      setCancelTarget(null);
      await loadReservations();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel reservation. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelClose = () => {
    if (isCancelling) return;
    setCancelTarget(null);
    setCancelError('');
  };

  // ── Partition by status ───────────────────────────────────────────────────
  const active = reservations.filter((r) =>
    ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(r.status)
  );
  const history = reservations.filter((r) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(r.status)
  );

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">
            My Reservations
          </h1>
          <p className="text-xs text-text-muted mt-1">
            View your upcoming and past parking reservations.
          </p>
        </div>
        {!isLoading && !error && reservations.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {active.length > 0 && (
              <Badge variant="available" size="sm">{active.length} Active</Badge>
            )}
            <Badge variant="neutral" size="sm">{reservations.length} Total</Badge>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <CardSkeleton count={3} />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <ErrorState
          title="Failed to load reservations"
          message={error}
          onRetry={loadReservations}
        />
      )}

      {/* Empty */}
      {!isLoading && !error && reservations.length === 0 && (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations yet"
          description="You have not made any parking reservations. Find a parking slot and reserve it."
          actionLabel="Find Parking"
          actionIcon={ArrowRight}
          onAction={() => window.location.replace('/parking')}
        />
      )}

      {/* Active Reservations */}
      {!isLoading && !error && active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold tracking-tight text-text mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand" />
            Upcoming
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {active.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {!isLoading && !error && history.length > 0 && (
        <section>
          <h2 className="text-sm font-bold tracking-tight text-text mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-text-muted" />
            History
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {history.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cancel Dialog */}
      <CancelDialog
        reservation={cancelTarget}
        isOpen={Boolean(cancelTarget)}
        isLoading={isCancelling}
        error={cancelError}
        onConfirm={handleCancelConfirm}
        onClose={handleCancelClose}
      />
    </div>
  );
};
