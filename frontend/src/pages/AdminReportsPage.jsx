/**
 * AdminReportsPage — Operational and Audit Reports
 *
 * Operational reporting powered by backend queries and aggregates.
 * Supports:
 * - Parking occupancy & slot distribution
 * - Reservation statistics, status breakdowns, and cancellation metrics
 * - Parking session durations, active entry/exit logs, and historical fee snapshots
 * - Demo payment audits strictly labelled as simulated transactions
 * - Date-range filters, lot filters, CSV export, and clean SVG/CSS visualizations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  BarChart3,
  CalendarCheck,
  Clock,
  DollarSign,
  Building2,
  Grid3X3,
  RefreshCw,
  Download,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Wallet,
  CreditCard,
  Banknote,
} from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  ErrorState,
  Skeleton,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { reportsApi, parkingApi } from '../lib/api';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatPercent(pct) {
  return `${Number(pct || 0).toFixed(1)}%`;
}

function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'occupancy', label: 'Parking Occupancy', icon: Grid3X3 },
  { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
  { id: 'sessions', label: 'Parking Sessions', icon: Clock },
  { id: 'payments', label: 'Demo Payments', icon: DollarSign, badge: 'Demo' },
];

const PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom' },
];

export const AdminReportsPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPreset, setSelectedPreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');

  // Loaded lots for filter dropdown
  const [lotsList, setLotsList] = useState([]);

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [reservationsData, setReservationsData] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ─── Filter Dates Computation ───────────────────────────────────────────────

  const computeDateRange = useCallback((preset) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (preset === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }
    if (preset === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }
    return { start: '', end: '' };
  }, []);

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    if (presetId !== 'custom') {
      const { start, end } = computeDateRange(presetId);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // ─── Load Lots for Dropdown ─────────────────────────────────────────────────

  useEffect(() => {
    async function loadLots() {
      try {
        const res = await parkingApi.getLots({}, token);
        setLotsList(res?.data?.lots || []);
      } catch {
        // Soft fail
      }
    }
    loadLots();
  }, [token]);

  // ─── Fetch Reports Data ─────────────────────────────────────────────────────

  const fetchReports = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedLotId) params.lotId = selectedLotId;

      try {
        const [sumRes, occRes, resRes, sessRes, payRes] = await Promise.all([
          reportsApi.getSummary(token),
          reportsApi.getOccupancy({ lotId: selectedLotId || undefined }, token),
          reportsApi.getReservations(params, token),
          reportsApi.getSessions(params, token),
          reportsApi.getPayments(params, token),
        ]);

        setSummaryData(sumRes?.data || null);
        setOccupancyData(occRes?.data || null);
        setReservationsData(resRes?.data || null);
        setSessionsData(sessRes?.data || null);
        setPaymentsData(payRes?.data || null);

        if (isManual) {
          toast({
            type: 'success',
            title: 'Reports Synchronized',
            message: 'All database metrics and query aggregates refreshed.',
            duration: 3000,
          });
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.message || 'Failed to load report analytics from database.');
        if (isManual) {
          toast({
            type: 'error',
            title: 'Sync Error',
            message: err.message || 'Could not refresh reporting metrics.',
            duration: 4000,
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [startDate, endDate, selectedLotId, token, toast]
  );

  useEffect(() => {
    fetchReports(false);
  }, [fetchReports]);

  // ─── CSV Export ─────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    let rows = [];
    let filename = `parkease-report-${activeTab}.csv`;

    if (activeTab === 'reservations' && reservationsData?.records) {
      rows = reservationsData.records.map((r) => ({
        ID: r.id,
        Customer: r.customerName,
        Email: r.customerEmail,
        Vehicle: r.plateNumber,
        Type: r.vehicleType,
        Lot: r.lotName,
        Slot: r.slotNumber,
        StartTime: r.startTime,
        EndTime: r.endTime,
        DurationMinutes: r.durationMinutes,
        RateSnapshot: r.hourlyRateSnapshot,
        EstimatedFee: r.totalEstimatedFee,
        Status: r.status,
      }));
    } else if (activeTab === 'sessions' && sessionsData?.records) {
      rows = sessionsData.records.map((s) => ({
        ID: s.id,
        Vehicle: s.plateNumber,
        Customer: s.customerName,
        Lot: s.lotName,
        Slot: s.slotNumber,
        EntryTime: s.entryTime,
        ExitTime: s.exitTime || 'ACTIVE',
        DurationMinutes: s.durationMinutes,
        RateSnapshot: s.hourlyRateSnapshot,
        RecordedFee: s.totalFee !== null ? s.totalFee : 'ONGOING',
        Status: s.status,
      }));
    } else if (activeTab === 'payments' && paymentsData?.records) {
      rows = paymentsData.records.map((p) => ({
        ID: p.id,
        Reference: p.transactionReference,
        Customer: p.customerName,
        Plate: p.plateNumber,
        Lot: p.lotName,
        Slot: p.slotNumber,
        Amount: p.amount,
        DemoMethod: p.demoMethod,
        Status: p.status,
        PaidAt: p.paidAt,
        IsDemo: 'TRUE',
      }));
    } else if (occupancyData?.byLot) {
      rows = occupancyData.byLot.map((l) => ({
        LotName: l.lotName,
        Address: l.address,
        TotalCapacity: l.totalCapacity,
        TotalSlots: l.totalSlots,
        OccupiedSlots: l.occupiedSlots,
        ReservedSlots: l.reservedSlots,
        AvailableSlots: l.availableSlots,
        MaintenanceSlots: l.maintenanceSlots,
        OccupancyRate: `${l.occupancyRate}%`,
      }));
      filename = 'parkease-occupancy-report.csv';
    }

    if (rows.length === 0) {
      toast({
        type: 'info',
        title: 'No Records',
        message: 'No table records available to export for this view.',
      });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: 'success',
      title: 'Export Complete',
      message: `Downloaded ${filename} (${rows.length} rows).`,
    });
  };

  // ─── Render Components ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="park-page-title">
              Operational Reports & Analytics
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Operational reports, slot occupancy, session records, and simulated payment audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports(true)}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── Global Filter Bar ── */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-text-muted mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Range:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetChange(p.id)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  selectedPreset === p.id
                    ? 'bg-brand text-bg font-bold'
                    : 'bg-bg-subtle text-text-muted hover:text-text hover:bg-surface'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Lot Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="lotFilter" className="text-xs font-semibold text-text-muted flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Lot:
            </label>
            <select
              id="lotFilter"
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="bg-bg-subtle border border-border rounded px-2.5 py-1 text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="">All Parking Facilities</option>
              {lotsList.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name} ({lot.totalCapacity} bays)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if 'custom' is active */}
        {selectedPreset === 'custom' && (
          <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Start Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">End Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-bg-subtle border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Category Navigation Tabs ── */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-surface text-brand border border-brand/40 shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-bg-subtle'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Error State ── */}
      {error && (
        <ErrorState
          title="Reporting Query Failure"
          message={error}
          onRetry={() => fetchReports(true)}
        />
      )}

      {/* ── Loading State ── */}
      {isLoading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      )}

      {/* ── Main Tab Contents ── */}
      {!isLoading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <OverviewTab
                occupancy={occupancyData}
                reservations={reservationsData}
                sessions={sessionsData}
                payments={paymentsData}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'occupancy' && <OccupancyTab data={occupancyData} />}

            {activeTab === 'reservations' && <ReservationsTab data={reservationsData} />}

            {activeTab === 'sessions' && <SessionsTab data={sessionsData} />}

            {activeTab === 'payments' && <DemoPaymentsTab data={paymentsData} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

// ─── TAB 1: OVERVIEW ──────────────────────────────────────────────────────────

function OverviewTab({ occupancy, reservations, sessions, payments, onSelectTab }) {
  const occSum = occupancy?.summary || {};
  const resSum = reservations?.summary || {};
  const sessSum = sessions?.summary || {};
  const paySum = payments?.summary || {};

  return (
    <div className="space-y-6">
      {/* 4 High-Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Occupancy */}
        <button
          type="button"
          onClick={() => onSelectTab('occupancy')}
          className="w-full text-left bg-surface border border-border hover:border-brand/50 rounded-lg p-4 transition-all"
        >
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Slot Occupancy</span>
            <Grid3X3 className="w-4 h-4 text-brand" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">
            {formatPercent(occSum.occupancyRate)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
            <span>
              {occSum.occupiedSlots || 0} occ / {occSum.availableSlots || 0} avail
            </span>
            <span className="text-brand flex items-center gap-0.5">
              Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Card 2: Reservations */}
        <button
          type="button"
          onClick={() => onSelectTab('reservations')}
          className="w-full text-left bg-surface border border-border hover:border-brand/50 rounded-lg p-4 transition-all"
        >
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">
            {resSum.totalReservations || 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
            <span>
              {resSum.confirmedCount || 0} conf / {resSum.cancelledCount || 0} canc
            </span>
            <span className="text-blue-400 flex items-center gap-0.5">
              Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Card 3: Parking Sessions */}
        <button
          type="button"
          onClick={() => onSelectTab('sessions')}
          className="w-full text-left bg-surface border border-border hover:border-brand/50 rounded-lg p-4 transition-all"
        >
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Active &amp; Past Sessions</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-text">
            {sessSum.totalSessions || 0}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
            <span>
              {sessSum.activeSessions || 0} active / {sessSum.completedSessions || 0} closed
            </span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Card 4: Demo Revenue */}
        <button
          type="button"
          onClick={() => onSelectTab('payments')}
          className="w-full text-left bg-surface border border-border hover:border-amber-500/50 rounded-lg p-4 transition-all"
        >
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Demo Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {formatCurrency(paySum.successfulTotalAmount)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-500/90 text-[10px]">Simulated Total</span>
            <span className="text-amber-400 flex items-center gap-0.5">
              Audit <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      {/* Overview Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy by Facility Snapshot */}
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" /> Facility Occupancy Breakdown
            </h3>
            <span className="text-xs text-text-muted">Current Snapshot</span>
          </div>

          {occupancy?.byLot && occupancy.byLot.length > 0 ? (
            <div className="space-y-3">
              {occupancy.byLot.map((lot) => (
                <div key={lot.lotId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text">{lot.lotName}</span>
                    <span className="text-text-muted">
                      {lot.occupiedSlots + lot.reservedSlots} / {lot.totalSlots} slots ({lot.occupancyRate}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-bg-subtle rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${lot.totalSlots > 0 ? (lot.occupiedSlots / lot.totalSlots) * 100 : 0}%`,
                      }}
                      className="bg-red-500/80 h-full"
                      title={`Occupied: ${lot.occupiedSlots}`}
                    />
                    <div
                      style={{
                        width: `${lot.totalSlots > 0 ? (lot.reservedSlots / lot.totalSlots) * 100 : 0}%`,
                      }}
                      className="bg-amber-500/80 h-full"
                      title={`Reserved: ${lot.reservedSlots}`}
                    />
                    <div
                      style={{
                        width: `${lot.totalSlots > 0 ? (lot.availableSlots / lot.totalSlots) * 100 : 0}%`,
                      }}
                      className="bg-brand/80 h-full"
                      title={`Available: ${lot.availableSlots}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              No parking facilities registered in database.
            </div>
          )}
        </div>

        {/* Demo Payment Methods Breakdown */}
        <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" /> Demo Payment Methods
            </h3>
            <span className="text-xs text-amber-400/90 font-semibold">[DEMO DATA]</span>
          </div>

          {payments?.byMethod && payments.byMethod.length > 0 ? (
            <div className="space-y-3">
              {payments.byMethod.map((m) => (
                <div key={m.demoMethod} className="bg-bg-subtle rounded p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-text">{m.demoMethod.replace(/_/g, ' ')}</span>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {m.successfulCount} successful / {m.transactionCount} attempts
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">{formatCurrency(m.successfulAmount)}</span>
                    <p className="text-[10px] text-text-muted">Simulated</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              No simulated demo transactions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: PARKING OCCUPANCY REPORT ──────────────────────────────────────────

function OccupancyTab({ data }) {
  const summary = data?.summary || {};
  const lots = data?.byLot || [];
  const slotTypes = data?.bySlotType || [];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Total Slots</div>
          <div className="text-xl font-bold text-text mt-1">{summary.totalSlots || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-brand font-semibold">Available</div>
          <div className="text-xl font-bold text-brand mt-1">{summary.availableSlots || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-red-400 font-semibold">Occupied</div>
          <div className="text-xl font-bold text-red-400 mt-1">{summary.occupiedSlots || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-amber-400 font-semibold">Reserved</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{summary.reservedSlots || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-gray-400 font-semibold">Maintenance</div>
          <div className="text-xl font-bold text-gray-400 mt-1">{summary.maintenanceSlots || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted font-semibold">Occupancy %</div>
          <div className="text-xl font-bold text-brand mt-1">{formatPercent(summary.occupancyRate)}</div>
        </div>
      </div>

      {/* Visual Status Legend & Distribution Meter */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>Overall Bay Utilization Meter</span>
          <span>{summary.totalSlots || 0} Total Installed Slots</span>
        </div>
        <div className="h-4 w-full bg-bg-subtle rounded overflow-hidden flex">
          <div
            style={{ width: `${summary.totalSlots ? (summary.occupiedSlots / summary.totalSlots) * 100 : 0}%` }}
            className="bg-red-500 h-full"
            title={`Occupied: ${summary.occupiedSlots}`}
          />
          <div
            style={{ width: `${summary.totalSlots ? (summary.reservedSlots / summary.totalSlots) * 100 : 0}%` }}
            className="bg-amber-500 h-full"
            title={`Reserved: ${summary.reservedSlots}`}
          />
          <div
            style={{ width: `${summary.totalSlots ? (summary.availableSlots / summary.totalSlots) * 100 : 0}%` }}
            className="bg-brand h-full"
            title={`Available: ${summary.availableSlots}`}
          />
          <div
            style={{ width: `${summary.totalSlots ? (summary.maintenanceSlots / summary.totalSlots) * 100 : 0}%` }}
            className="bg-gray-500 h-full"
            title={`Maintenance: ${summary.maintenanceSlots}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Physically Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Time-Window Reserved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" /> Open / Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" /> Maintenance / Inactive
          </span>
        </div>
      </div>

      {/* Lot-by-Lot Breakdown Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Facility Occupancy Details (MySQL Aggregates)
          </h3>
          <span className="text-xs text-text-muted">{lots.length} Facilities Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-muted border-b border-border">
              <tr>
                <th className="p-3">Facility Name</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Total Bays</th>
                <th className="p-3">Occupied</th>
                <th className="p-3">Reserved</th>
                <th className="p-3">Available</th>
                <th className="p-3">Maintenance</th>
                <th className="p-3 text-right">Occupancy %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {lots.length > 0 ? (
                lots.map((lot) => (
                  <tr key={lot.lotId} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="p-3 font-semibold text-text">
                      {lot.lotName}
                      <span className="block text-[10px] text-text-muted font-normal">{lot.address}</span>
                    </td>
                    <td className="p-3 text-text-muted">{lot.totalCapacity}</td>
                    <td className="p-3 text-text font-bold">{lot.totalSlots}</td>
                    <td className="p-3 text-red-400 font-semibold">{lot.occupiedSlots}</td>
                    <td className="p-3 text-amber-400 font-semibold">{lot.reservedSlots}</td>
                    <td className="p-3 text-brand font-semibold">{lot.availableSlots}</td>
                    <td className="p-3 text-gray-400">{lot.maintenanceSlots}</td>
                    <td className="p-3 text-right font-bold text-text">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          lot.occupancyRate >= 80
                            ? 'bg-red-500/20 text-red-400'
                            : lot.occupancyRate >= 50
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-brand/20 text-brand'
                        }`}
                      >
                        {formatPercent(lot.occupancyRate)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-text-muted">
                    No parking lots or slots found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown by Slot Type */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider">
          Breakdown by Vehicle / Slot Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {slotTypes.map((t) => (
            <div key={t.slotType} className="bg-bg-subtle rounded p-3 text-xs space-y-1">
              <span className="font-bold text-brand">{t.slotType.replace(/_/g, ' ')}</span>
              <div className="text-text-muted flex justify-between">
                <span>Total:</span> <span className="font-semibold text-text">{t.totalSlots}</span>
              </div>
              <div className="text-text-muted flex justify-between">
                <span>Avail:</span> <span className="text-brand">{t.availableSlots}</span>
              </div>
              <div className="text-text-muted flex justify-between">
                <span>Occupied:</span> <span className="text-red-400">{t.occupiedSlots}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 3: RESERVATIONS REPORT ───────────────────────────────────────────────

function ReservationsTab({ data }) {
  const summary = data?.summary || {};
  const byStatus = data?.byStatus || [];
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Total Reservations</div>
          <div className="text-xl font-bold text-text mt-1">{summary.totalReservations || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-brand">Confirmed</div>
          <div className="text-xl font-bold text-brand mt-1">{summary.confirmedCount || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-red-400">Cancelled</div>
          <div className="text-xl font-bold text-red-400 mt-1">{summary.cancelledCount || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Cancellation Rate</div>
          <div className="text-xl font-bold text-text mt-1">
            {formatPercent(summary.cancellationRate)}
          </div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Est. Revenue</div>
          <div className="text-xl font-bold text-brand mt-1">
            {formatCurrency(summary.totalEstimatedRevenue)}
          </div>
        </div>
      </div>

      {/* Status Distribution Pills */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider">
          Reservation Counts by Project Status
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {byStatus.map((s) => (
            <div
              key={s.status}
              className="bg-bg-subtle border border-border rounded px-3 py-1.5 flex items-center gap-2 text-xs"
            >
              <Badge variant={s.status === 'CONFIRMED' ? 'available' : s.status === 'CANCELLED' ? 'occupied' : 'brand'}>
                {s.status}
              </Badge>
              <span className="font-bold text-text">{s.count}</span>
              <span className="text-text-muted text-[10px]">({formatCurrency(s.estimatedRevenue)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Reservations Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Reservation Transaction Log ({records.length} Records)
          </h3>
          <span className="text-xs text-text-muted">Direct MySQL Query</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-muted border-b border-border">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Facility &amp; Bay</th>
                <th className="p-3">Schedule Window</th>
                <th className="p-3">Snapshot Rate</th>
                <th className="p-3">Est. Fee</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="p-3 text-text-muted">#{r.id}</td>
                    <td className="p-3 font-semibold text-text">
                      {r.customerName}
                      <span className="block text-[10px] text-text-muted font-normal">{r.customerEmail}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-brand">{r.plateNumber}</span>
                      <span className="block text-[10px] text-text-muted">{r.vehicleType}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-text">{r.lotName}</span>
                      <span className="block text-[10px] text-text-muted">Bay: {r.slotNumber}</span>
                    </td>
                    <td className="p-3 text-[11px] text-text-muted">
                      {formatDateTime(r.startTime)}
                      <span className="block text-[10px] text-text-muted">to {formatDateTime(r.endTime)}</span>
                    </td>
                    <td className="p-3 font-mono text-text-muted">${r.hourlyRateSnapshot}/hr</td>
                    <td className="p-3 font-mono font-bold text-text">${r.totalEstimatedFee}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          r.status === 'CONFIRMED'
                            ? 'available'
                            : r.status === 'CANCELLED'
                            ? 'occupied'
                            : 'brand'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No reservations recorded matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: PARKING SESSIONS REPORT ───────────────────────────────────────────

function SessionsTab({ data }) {
  const summary = data?.summary || {};
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      {/* Sessions KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Total Sessions</div>
          <div className="text-xl font-bold text-text mt-1">{summary.totalSessions || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-brand font-semibold">Active In-Facility</div>
          <div className="text-xl font-bold text-brand mt-1">{summary.activeSessions || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Completed</div>
          <div className="text-xl font-bold text-text mt-1">{summary.completedSessions || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Avg Duration</div>
          <div className="text-xl font-bold text-text mt-1">
            {summary.avgDurationMinutes || 0} mins
          </div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Total Recorded Fees</div>
          <div className="text-xl font-bold text-brand mt-1">
            {formatCurrency(summary.totalRecordedFees)}
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Parking Entry/Exit Session Log ({records.length} Records)
          </h3>
          <span className="text-xs text-text-muted">Historical Snapshot Rates Preserved</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-muted border-b border-border">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Vehicle &amp; Customer</th>
                <th className="p-3">Location</th>
                <th className="p-3">Entry Time</th>
                <th className="p-3">Exit Time</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Rate Snapshot</th>
                <th className="p-3">Recorded Total Fee</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {records.length > 0 ? (
                records.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="p-3 text-text-muted">#{s.id}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-brand">{s.plateNumber}</span>
                      <span className="block text-[10px] text-text-muted">{s.customerName}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-text">{s.lotName}</span>
                      <span className="block text-[10px] text-text-muted">Slot #{s.slotNumber}</span>
                    </td>
                    <td className="p-3 text-text-muted">{formatDateTime(s.entryTime)}</td>
                    <td className="p-3 text-text-muted">
                      {s.exitTime ? formatDateTime(s.exitTime) : <span className="text-brand font-semibold">Active</span>}
                    </td>
                    <td className="p-3 text-text font-mono">{s.durationMinutes} mins</td>
                    <td className="p-3 text-text-muted font-mono">${s.hourlyRateSnapshot}/hr</td>
                    <td className="p-3 font-mono font-bold text-text">
                      {s.totalFee !== null ? `$${s.totalFee}` : '—'}
                    </td>
                    <td className="p-3">
                      <Badge variant={s.status === 'ACTIVE' ? 'brand' : 'neutral'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted">
                    No parking sessions recorded in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 5: DEMO PAYMENTS REPORT ──────────────────────────────────────────────

function DemoPaymentsTab({ data }) {
  const summary = data?.summary || {};
  const byMethod = data?.byMethod || [];
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      {/* Explicit Academic Project Demo Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-400">Demo Transaction Audit Report — Academic Demonstration</h4>
          <p className="text-text-muted leading-relaxed">
            All payment records displayed on this page are simulated demonstration transactions. No real payment
            gateway integration exists, and no real currency is transferred. Successful revenue aggregates strictly sum
            completed simulated transactions (<code className="text-amber-400">status = 'PAID'</code>) and exclude failed
            or duplicate attempts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-text-muted">Total Demo Transactions</div>
          <div className="text-xl font-bold text-text mt-1">{summary.totalTransactions || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-brand font-semibold">Successful (PAID)</div>
          <div className="text-xl font-bold text-brand mt-1">{summary.successfulCount || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-red-400 font-semibold">Failed Attempts</div>
          <div className="text-xl font-bold text-red-400 mt-1">{summary.failedCount || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded p-3 text-center">
          <div className="text-xs text-amber-400 font-semibold">Simulated Revenue Total</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {formatCurrency(summary.successfulTotalAmount)}
          </div>
        </div>
      </div>

      {/* Method Distribution Cards */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider">
          Demo Payment Methods Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {byMethod.map((m) => (
            <div key={m.demoMethod} className="bg-bg-subtle rounded p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {m.demoMethod.includes('CARD') ? (
                  <CreditCard className="w-4 h-4 text-blue-400" />
                ) : m.demoMethod.includes('WALLET') ? (
                  <Wallet className="w-4 h-4 text-brand" />
                ) : (
                  <Banknote className="w-4 h-4 text-amber-400" />
                )}
                <div>
                  <span className="font-semibold text-text">{m.demoMethod.replace(/_/g, ' ')}</span>
                  <p className="text-[10px] text-text-muted">{m.successfulCount} paid of {m.transactionCount}</p>
                </div>
              </div>
              <span className="font-bold text-amber-400">{formatCurrency(m.successfulAmount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Payments Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">
            Simulated Payment Audit Ledger ({records.length} Records)
          </h3>
          <Badge variant="brand">isDemoTransaction: true</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-muted border-b border-border">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Session</th>
                <th className="p-3">Customer &amp; Vehicle</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {records.length > 0 ? (
                records.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="p-3 font-mono text-amber-400 font-semibold">{p.transactionReference}</td>
                    <td className="p-3 text-text-muted">#{p.sessionId}</td>
                    <td className="p-3">
                      <span className="text-text font-semibold">{p.customerName}</span>
                      <span className="block text-[10px] text-text-muted font-mono">{p.plateNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-text">{p.lotName}</span>
                      <span className="block text-[10px] text-text-muted">Slot #{p.slotNumber}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-text">${p.amount}</td>
                    <td className="p-3 text-[11px] text-text-muted">{p.demoMethod.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <Badge variant={p.status === 'PAID' ? 'available' : p.status === 'FAILED' ? 'occupied' : 'brand'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-text-muted">{formatDateTime(p.paidAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No simulated payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
