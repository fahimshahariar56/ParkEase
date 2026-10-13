/**
 * AdminPricingPage — Day 22 Pricing Rules Management
 *
 * Manages hourly billing rates per vehicle type.
 * - Only one ACTIVE rule per vehicle type at a time.
 * - Creating a new rule automatically deactivates the previous one.
 * - Rules can be individually deactivated (soft delete / history preserved).
 * - Rate selection logic: reservations/sessions pick the most-recent active rule
 *   for the vehicle's type at the time of creation.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  Bike,
  Truck,
  Info,
  Search,
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
import { pricingApi } from '../lib/api';

const VEHICLE_TYPES = ['MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK'];

const VEHICLE_LABELS = {
  MOTORCYCLE: 'Motorcycle',
  STANDARD_CAR: 'Standard Car',
  SUV: 'SUV',
  VAN: 'Van',
  TRUCK: 'Truck',
};

const VEHICLE_ICONS = {
  MOTORCYCLE: Bike,
  STANDARD_CAR: Car,
  SUV: Car,
  VAN: Car,
  TRUCK: Truck,
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return String(isoString);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── New Rate Modal ──────────────────────────────────────────────────────────

const NewRateModal = ({ open, onClose, onSuccess, token, toast }) => {
  const [vehicleType, setVehicleType] = useState('STANDARD_CAR');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setVehicleType('STANDARD_CAR');
    setHourlyRate('');
    setError('');
    setIsSubmitting(false);
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    const rate = Number(hourlyRate);
    if (!hourlyRate || isNaN(rate) || rate <= 0) {
      setError('Hourly rate must be a positive number.');
      return;
    }
    if (rate > 9999.99) {
      setError('Hourly rate cannot exceed 9999.99.');
      return;
    }

    setIsSubmitting(true);
    try {
      await pricingApi.createPricingRule({ vehicleType, hourlyRate: rate }, token);
      toast({
        type: 'success',
        title: 'Rate Updated',
        message: `${VEHICLE_LABELS[vehicleType]} rate set to $${rate.toFixed(2)}/hr. Previous rule deactivated.`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create pricing rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Set New Hourly Rate">
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 p-3 rounded-input bg-brand/5 border border-brand/20">
          <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-muted">
            Creating a new rate <span className="text-text font-bold">automatically deactivates</span> the
            current active rule for the selected vehicle type. The previous rate is preserved in history.
            New reservations and sessions will use the new rate.
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-1.5">
          <label
            htmlFor="price-vehicle-type"
            className="text-[10px] text-text-muted uppercase font-bold tracking-wide"
          >
            Vehicle Type
          </label>
          <select
            id="price-vehicle-type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>{VEHICLE_LABELS[type]}</option>
            ))}
          </select>
        </div>

        {/* Hourly Rate */}
        <div className="space-y-1.5">
          <label
            htmlFor="price-hourly-rate"
            className="text-[10px] text-text-muted uppercase font-bold tracking-wide"
          >
            New Hourly Rate ($)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="price-hourly-rate"
              type="number"
              step="0.01"
              min="0.01"
              max="9999.99"
              placeholder="0.00"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand"
              aria-label="New hourly rate in dollars"
            />
          </div>
          <div className="text-[11px] text-text-muted">Rate per hour, minimum 1-hour billing applied to sessions.</div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-xs text-status-occupied">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !hourlyRate}
          >
            {isSubmitting ? 'Saving…' : 'Set New Rate'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Main AdminPricingPage ───────────────────────────────────────────────────

export const AdminPricingPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [rules, setRules] = useState([]);
  const [effectiveRates, setEffectiveRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [newRateModalOpen, setNewRateModalOpen] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const loadPricingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rulesRes, effectiveRes] = await Promise.all([
        pricingApi.getPricingRules(),
        pricingApi.getEffectiveRates(),
      ]);
      setRules(rulesRes?.data?.rules || []);
      setEffectiveRates(effectiveRes?.data?.rates || {});
    } catch (err) {
      setError(err.message || 'Failed to load pricing data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricingData();
  }, [loadPricingData]);

  const handleDeactivate = async (rule) => {
    if (!window.confirm(`Deactivate the $${rule.hourlyRate.toFixed(2)}/hr rule for ${VEHICLE_LABELS[rule.vehicleType]}?\n\nThis will remove the active rate for this vehicle type until a new one is created.`)) return;
    setDeactivatingId(rule.id);
    try {
      await pricingApi.deactivatePricingRule(rule.id, token);
      toast({ type: 'success', title: 'Rule Deactivated', message: `Pricing rule #${rule.id} has been deactivated.` });
      loadPricingData();
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: err.message || 'Failed to deactivate rule.' });
    } finally {
      setDeactivatingId(null);
    }
  };

  // Filter for display
  const displayedRules = useMemo(() => {
    let filtered = showHistory ? rules : rules.filter((r) => r.isActive);
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.vehicleType === typeFilter);
    }
    return filtered;
  }, [rules, showHistory, typeFilter]);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Pricing Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Pricing Rules</h1>
          <p className="text-xs text-text-muted mt-1">
            Hourly billing rates per vehicle type. One active rule per type.
            Reservations and sessions snapshot the rate at creation time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadPricingData} disabled={isLoading}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setNewRateModalOpen(true)}
            id="set-rate-btn"
          >
            Set New Rate
          </Button>
        </div>
      </div>

      {/* Effective Rates Summary Grid */}
      <div>
        <div className="text-[10px] text-text-muted uppercase font-bold tracking-wide mb-3">
          Current Effective Rates
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {VEHICLE_TYPES.map((t) => (
              <div key={t} className="park-card p-3 space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {VEHICLE_TYPES.map((type) => {
              const rate = effectiveRates[type];
              const Icon = VEHICLE_ICONS[type] || Car;
              return (
                <div
                  key={type}
                  className={`park-card p-3 flex flex-col gap-2 ${rate ? 'border-brand/20 bg-brand/3' : 'border-status-occupied/20 bg-status-occupied/3'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase font-bold">
                    <Icon className="w-3 h-3 text-brand" />
                    <span>{VEHICLE_LABELS[type]}</span>
                  </div>
                  {rate ? (
                    <div>
                      <div className="text-lg font-bold text-brand">
                        ${rate.hourlyRate.toFixed(2)}
                        <span className="text-[10px] text-text-muted font-normal">/hr</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-status-available">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-bold text-text-muted">No rate</div>
                      <div className="text-[10px] text-status-occupied">Inactive</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rate history info */}
      <div className="flex items-start gap-2.5 p-3 rounded-input bg-surface-raised/60 border border-border/60">
        <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
        <div className="text-xs text-text-muted">
          <span className="font-bold text-text">Rate Snapshot:</span> When a reservation or parking session is created,
          the current effective rate is saved as a snapshot. Changing the rate later does not affect
          existing reservations or sessions.
        </div>
      </div>

      {/* Filters */}
      <div className="park-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            aria-label="Filter by vehicle type"
          >
            <option value="ALL">All Vehicle Types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{VEHICLE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors px-3 py-2 rounded-input border border-border hover:border-brand/40"
          aria-pressed={showHistory}
        >
          {showHistory ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showHistory ? 'Hide History' : 'Show History'}</span>
        </button>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="park-card p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load pricing rules" message={error} onRetry={loadPricingData} />
      ) : displayedRules.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No pricing rules found"
          description={
            typeFilter !== 'ALL'
              ? `No ${showHistory ? '' : 'active '}rules for ${VEHICLE_LABELS[typeFilter]}.`
              : showHistory
              ? 'No pricing rules have been created yet.'
              : 'No active pricing rules. Use "Set New Rate" to configure rates.'
          }
        />
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] text-text-muted uppercase font-bold tracking-wide px-1">
            {showHistory ? `All rules (${displayedRules.length})` : `Active rules (${displayedRules.length})`}
          </div>
          <AnimatePresence>
            {displayedRules.map((rule) => {
              const Icon = VEHICLE_ICONS[rule.vehicleType] || Car;
              const isDeactivating = deactivatingId === rule.id;

              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`park-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors
                    ${rule.isActive ? 'hover:border-brand/40' : 'opacity-60 hover:opacity-80'}`}
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="font-bold text-sm text-text">{VEHICLE_LABELS[rule.vehicleType]}</span>
                      </div>
                      <Badge variant={rule.isActive ? 'available' : 'neutral'} size="sm">
                        {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                      <span className="text-[10px] text-text-muted">Rule #{rule.id}</span>
                    </div>

                    {/* Rate & timestamps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Hourly Rate</div>
                        <div className={`text-lg font-bold ${rule.isActive ? 'text-brand' : 'text-text-muted'}`}>
                          ${rule.hourlyRate.toFixed(2)}/hr
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Effective From
                        </div>
                        <div className="font-bold text-text text-[11px]">{formatDateTime(rule.effectiveFrom)}</div>
                      </div>
                      {!rule.isActive && rule.effectiveTo && (
                        <div>
                          <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Deactivated At</div>
                          <div className="font-bold text-text-muted text-[11px]">{formatDateTime(rule.effectiveTo)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {rule.isActive && (
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={EyeOff}
                        onClick={() => handleDeactivate(rule)}
                        disabled={isDeactivating}
                        className="text-text-muted hover:text-status-occupied"
                        title="Deactivate this pricing rule"
                      >
                        {isDeactivating ? 'Deactivating…' : 'Deactivate'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New Rate Modal */}
      <NewRateModal
        open={newRateModalOpen}
        onClose={() => setNewRateModalOpen(false)}
        onSuccess={loadPricingData}
        token={token}
        toast={toast}
      />
    </div>
  );
};
