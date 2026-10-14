/**
 * AdminPaymentsPage — Day 21 Demo Payment Flow
 *
 * IMPORTANT: All transactions on this page are SIMULATED.
 * No real payment gateway is used. No real money is transferred.
 * The `isDemoTransaction: true` flag is always set on every payment record.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  DollarSign,
  Clock,
  User,
  Car,
  ShieldAlert,
  Wallet,
  Banknote,
  Receipt,
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
import { paymentsApi, sessionsApi } from '../lib/api';

const METHOD_LABELS = {
  SIMULATED_CARD: 'Simulated Card',
  SIMULATED_MOBILE_WALLET: 'Mobile Wallet (Demo)',
  SIMULATED_CASH: 'Cash (Demo)',
};

const METHOD_ICONS = {
  SIMULATED_CARD: CreditCard,
  SIMULATED_MOBILE_WALLET: Wallet,
  SIMULATED_CASH: Banknote,
};

const STATUS_VARIANTS = {
  PAID: 'available',
  REFUNDED: 'info',
  FAILED: 'occupied',
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Process Payment Modal ───────────────────────────────────────────────────

const ProcessPaymentModal = ({ open, onClose, onSuccess, token, toast }) => {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [demoMethod, setDemoMethod] = useState('SIMULATED_CARD');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedSessionId('');
    setSelectedSession(null);
    setDemoMethod('SIMULATED_CARD');
    setError('');
    setIsSubmitting(false);

    const loadUnpaidSessions = async () => {
      setIsLoadingSessions(true);
      try {
        // Fetch completed sessions, then filter out already-paid ones
        const [sessionsRes, paymentsRes] = await Promise.all([
          sessionsApi.getSessions({ status: 'COMPLETED' }, token),
          paymentsApi.getPayments({}, token),
        ]);
        const allCompleted = sessionsRes?.data?.sessions || [];
        const paidSessionIds = new Set(
          (paymentsRes?.data?.payments || []).map((p) => p.sessionId)
        );
        setCompletedSessions(allCompleted.filter((s) => !paidSessionIds.has(s.id)));
      } catch {
        setCompletedSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadUnpaidSessions();
  }, [open, token]);

  // Update selected session details when session picker changes
  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedSession(null);
      return;
    }
    const found = completedSessions.find((s) => s.id === Number(selectedSessionId));
    setSelectedSession(found || null);
  }, [selectedSessionId, completedSessions]);

  const handleSubmit = async () => {
    if (!selectedSessionId || !demoMethod) return;
    setIsSubmitting(true);
    setError('');
    try {
      await paymentsApi.createPayment(
        { sessionId: Number(selectedSessionId), demoMethod },
        token
      );
      toast({
        type: 'success',
        title: '[DEMO] Payment Recorded',
        message: `Simulated ${METHOD_LABELS[demoMethod]} payment processed for Session #${selectedSessionId}. No real transaction occurred.`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process demo payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const MethodIcon = METHOD_ICONS[demoMethod] || CreditCard;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Process Demo Payment"
    >
      <div className="space-y-4">
        {/* Prominent Demo Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-input bg-amber-500/10 border border-amber-500/40">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-400 mb-0.5">DEMONSTRATION ONLY</div>
            <div className="text-amber-300/80">
              This is a simulated payment for academic demonstration purposes. No real money is
              transferred. No card details are collected. No payment gateway is invoked.
            </div>
          </div>
        </div>

        {/* Session Selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="pay-session-select"
            className="text-[10px] text-text-muted uppercase font-bold tracking-wide"
          >
            Unpaid Completed Session
          </label>
          {isLoadingSessions ? (
            <div className="h-9 rounded-input bg-surface-raised animate-pulse" />
          ) : (
            <select
              id="pay-session-select"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
              disabled={isSubmitting}
            >
              <option value="">— Select Session —</option>
              {completedSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  #SES-{s.id} — {s.vehicle?.plateNumber || 'N/A'} — ${s.totalFee?.toFixed(2) || '?'}
                </option>
              ))}
              {completedSessions.length === 0 && (
                <option disabled value="">
                  No unpaid completed sessions found
                </option>
              )}
            </select>
          )}
        </div>

        {/* Session Preview */}
        {selectedSession && (
          <div className="park-card p-3 space-y-2 bg-surface-raised/60 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Vehicle</div>
                <div className="font-mono font-bold text-text">{selectedSession.vehicle?.plateNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Customer</div>
                <div className="font-bold text-text truncate">{selectedSession.user?.fullName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Duration</div>
                <div className="font-bold text-text">
                  {selectedSession.durationMinutes != null
                    ? `${Math.floor(selectedSession.durationMinutes / 60)}h ${selectedSession.durationMinutes % 60}m`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase font-bold mb-0.5">Amount Due</div>
                <div className="font-bold text-brand text-sm">${selectedSession.totalFee?.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Method Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-text-muted uppercase font-bold tracking-wide">
            Demo Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(METHOD_LABELS).map(([value, label]) => {
              const Icon = METHOD_ICONS[value];
              const isSelected = demoMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDemoMethod(value)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-input border text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-surface-raised text-text-muted hover:border-brand/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-center text-[10px] leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount preview */}
        {selectedSession && (
          <div className="flex items-center justify-between p-3 rounded-input bg-brand/5 border border-brand/20">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <MethodIcon className="w-4 h-4 text-brand" />
              <span>{METHOD_LABELS[demoMethod]}</span>
            </div>
            <div className="font-mono font-bold text-brand text-sm">
              ${selectedSession.totalFee?.toFixed(2)}
            </div>
          </div>
        )}

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
            icon={CreditCard}
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSessionId}
          >
            {isSubmitting ? 'Processing…' : 'Process Demo Payment'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Payment Detail Modal ────────────────────────────────────────────────────

const PaymentDetailModal = ({ payment, open, onClose }) => {
  if (!payment || !open) return null;
  const Icon = METHOD_ICONS[payment.demoMethod] || CreditCard;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Payment #${payment.id} Details`}
    >
      <div className="space-y-4 text-xs">
        {/* Demo warning always shown */}
        <div className="flex items-center gap-2 p-2.5 rounded-input bg-amber-500/10 border border-amber-500/30">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 font-bold text-[11px]">
            DEMO TRANSACTION — No real money transferred
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Status</div>
            <Badge variant={STATUS_VARIANTS[payment.status] || 'neutral'}>{payment.status}</Badge>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Amount</div>
            <div className="font-bold text-brand text-base">${payment.amount.toFixed(2)}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Demo Method</div>
            <div className="flex items-center gap-1.5 font-bold text-text">
              <Icon className="w-3.5 h-3.5 text-brand" />
              {METHOD_LABELS[payment.demoMethod] || payment.demoMethod}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Session</div>
            <div className="font-mono font-bold text-text">#SES-{payment.sessionId}</div>
          </div>

          <div className="col-span-2">
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Transaction Reference</div>
            <div className="font-mono text-text bg-surface-raised px-2 py-1 rounded text-[11px] break-all">
              {payment.transactionReference}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Paid At</div>
            <div className="font-bold text-text">{formatDateTime(payment.paidAt)}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Vehicle</div>
            <div className="font-mono font-bold text-text">{payment.vehicle?.plateNumber || 'N/A'}</div>
            <div className="text-[11px] text-text-muted">{payment.vehicle?.makeModel || payment.vehicle?.vehicleType}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Customer</div>
            <div className="font-bold text-text">{payment.user?.fullName || 'N/A'}</div>
            <div className="text-[11px] text-text-muted">{payment.user?.email}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Slot</div>
            <div className="font-bold text-text">#{payment.slot?.slotNumber || 'N/A'}</div>
            <div className="text-[11px] text-text-muted">{payment.slot?.lotName}</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};

// ─── Main AdminPaymentsPage ──────────────────────────────────────────────────

export const AdminPaymentsPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [inspectingPayment, setInspectingPayment] = useState(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await paymentsApi.getPayments(params, token);
      setPayments(res?.data?.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve demo payments.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.trim().toLowerCase();
    return payments.filter((p) => {
      const refMatch = p.transactionReference?.toLowerCase().includes(q);
      const plateMatch = p.vehicle?.plateNumber?.toLowerCase().includes(q);
      const nameMatch = p.user?.fullName?.toLowerCase().includes(q);
      const idMatch = String(p.id).includes(q) || String(p.sessionId).includes(q);
      return refMatch || plateMatch || nameMatch || idMatch;
    });
  }, [payments, searchQuery]);

  const metrics = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'PAID');
    const totalRevenue = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      total: payments.length,
      paid: paid.length,
      totalRevenue,
    };
  }, [payments]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Demo Payment Console</span>
          </div>
          <h1 className="park-page-title">Demo Payments</h1>
          <p className="text-xs text-text-muted mt-1">
            Simulated payment flow for demonstration purposes. No real transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadPayments}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CreditCard}
            onClick={() => setPaymentModalOpen(true)}
            id="process-payment-btn"
          >
            Process Payment
          </Button>
        </div>
      </div>

      {/* Demo Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 rounded-input bg-amber-500/10 border border-amber-500/30">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wide">
            Academic Demonstration — No Real Payments
          </div>
          <div className="text-amber-300/70">
            All transactions shown below are simulated. No card details are captured, no
            payment gateway is contacted, and no real money changes hands. Every payment
            record is permanently flagged <code className="bg-amber-500/20 px-1 rounded font-mono">isDemoTransaction: true</code>.
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="park-card p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold">Total Transactions</span>
          <span className="text-xl font-bold text-text mt-1">{metrics.total}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-available/30 bg-status-available/5">
          <span className="text-[10px] text-status-available uppercase font-bold">Paid</span>
          <span className="text-xl font-bold text-status-available mt-1">{metrics.paid}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-brand/30 bg-brand/5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-brand uppercase font-bold">Demo Revenue Total</span>
          <div>
            <span className="text-xl font-bold text-brand mt-1">${metrics.totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-text-muted ml-1.5">(simulated)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="park-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, plate, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand"
              aria-label="Search payments"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
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
        <ErrorState title="Could not load payments" message={error} onRetry={loadPayments} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No demo payments found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No payments match your current filters.'
              : 'No demo payments have been recorded yet. Complete a parking session and use "Process Payment" to record one.'
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredPayments.map((payment) => {
              const variant = STATUS_VARIANTS[payment.status] || 'neutral';
              const Icon = METHOD_ICONS[payment.demoMethod] || CreditCard;

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="park-card p-4 sm:p-5 hover:border-brand/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Payment Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-sm text-text font-mono">#PAY-{payment.id}</span>
                      <Badge variant={variant} size="sm">{payment.status}</Badge>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">DEMO</span>
                      <span className="text-xs text-text-muted">Session #SES-{payment.sessionId}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      {/* Method */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <Icon className="w-3 h-3 text-brand" />
                          <span>Demo Method</span>
                        </div>
                        <div className="font-bold text-text">{METHOD_LABELS[payment.demoMethod]}</div>
                      </div>

                      {/* Customer */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-brand" />
                          <span>Customer</span>
                        </div>
                        <div className="font-bold text-text truncate">{payment.user?.fullName || 'N/A'}</div>
                        <div className="text-[11px] text-text-muted truncate">{payment.user?.email}</div>
                      </div>

                      {/* Vehicle */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                          <Car className="w-3 h-3 text-brand" />
                          <span>Vehicle</span>
                        </div>
                        <div className="font-mono font-bold text-text">{payment.vehicle?.plateNumber || 'N/A'}</div>
                        <div className="text-[11px] text-text-muted">{payment.vehicle?.makeModel || payment.vehicle?.vehicleType}</div>
                      </div>
                    </div>

                    {/* Reference & Timestamp row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-brand" />
                        <span className="font-bold text-brand">${payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(payment.paidAt)}</span>
                      </div>
                      <div className="font-mono text-[10px] text-text-muted/60 truncate">
                        {payment.transactionReference}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setInspectingPayment(payment)}
                      title="View payment details"
                    >
                      Details
                    </Button>
                    {payment.status === 'PAID' && (
                      <div className="flex items-center gap-1 text-[11px] text-status-available font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
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
      <ProcessPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={loadPayments}
        token={token}
        toast={toast}
      />
      <PaymentDetailModal
        payment={inspectingPayment}
        open={!!inspectingPayment}
        onClose={() => setInspectingPayment(null)}
      />
    </div>
  );
};
