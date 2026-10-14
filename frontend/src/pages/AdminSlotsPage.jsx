import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Grid3X3,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { Badge, Button, Input, Dialog, EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { parkingApi } from '../lib/api';

const SLOT_TYPES = [
  { value: 'STANDARD_CAR', label: 'Standard Car' },
  { value: 'SUV', label: 'SUV / Crossover' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'VAN', label: 'Passenger Van' },
  { value: 'TRUCK', label: 'Heavy Truck' },
];

const SLOT_STATUS_VARIANTS = {
  AVAILABLE: 'available',
  MAINTENANCE: 'pending',
  INACTIVE: 'neutral',
};

export const AdminSlotsPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query parameter synchronization
  const initialLotId = searchParams.get('lotId') || 'ALL';

  // State
  const [lots, setLots] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedLotId, setSelectedLotId] = useState(initialLotId);
  const [selectedSlotType, setSelectedSlotType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    lotId: '',
    slotNumber: '',
    slotType: 'STANDARD_CAR',
    status: 'AVAILABLE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalServerError, setModalServerError] = useState('');

  // Delete Confirmation State
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load Reference Lots
  const loadLots = useCallback(async () => {
    try {
      const res = await parkingApi.getLots({}, token);
      setLots(res?.data?.lots || []);
    } catch {
      // Non-fatal, slots will still attempt load
    }
  }, [token]);

  // Load Slots
  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {};
      if (selectedLotId !== 'ALL') {
        filters.lotId = selectedLotId;
      }
      if (selectedSlotType !== 'ALL') {
        filters.slotType = selectedSlotType;
      }
      if (selectedStatus !== 'ALL') {
        filters.status = selectedStatus;
      }

      const res = await parkingApi.getSlots(filters, token);
      setSlots(res?.data?.slots || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve parking slots.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLotId, selectedSlotType, selectedStatus, token]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Handle lot change & update URL query
  const handleLotFilterChange = (newLotId) => {
    setSelectedLotId(newLotId);
    if (newLotId === 'ALL') {
      searchParams.delete('lotId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ lotId: newLotId });
    }
  };

  // Filter slots locally by search query
  const filteredSlots = useMemo(() => {
    if (!searchQuery.trim()) return slots;
    const q = searchQuery.trim().toLowerCase();
    return slots.filter(
      (s) =>
        s.slotNumber.toLowerCase().includes(q) ||
        (s.lotName && s.lotName.toLowerCase().includes(q))
    );
  }, [slots, searchQuery]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = slots.length;
    const available = slots.filter((s) => s.status === 'AVAILABLE').length;
    const maintenance = slots.filter((s) => s.status === 'MAINTENANCE').length;
    const inactive = slots.filter((s) => s.status === 'INACTIVE').length;
    return { total, available, maintenance, inactive };
  }, [slots]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSlot(null);
    const defaultLot = selectedLotId !== 'ALL' ? selectedLotId : lots[0]?.id ? String(lots[0].id) : '';
    setFormData({
      lotId: defaultLot,
      slotNumber: '',
      slotType: 'STANDARD_CAR',
      status: 'AVAILABLE',
    });
    setFormErrors({});
    setModalServerError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      lotId: String(slot.lotId || ''),
      slotNumber: slot.slotNumber || '',
      slotType: slot.slotType || 'STANDARD_CAR',
      status: slot.status || 'AVAILABLE',
    });
    setFormErrors({});
    setModalServerError('');
    setIsModalOpen(true);
  };

  // Validate Slot Form
  const validateForm = () => {
    const errs = {};
    if (!formData.lotId) {
      errs.lotId = 'Please select a parking lot facility.';
    }

    const trimmedNum = formData.slotNumber.trim().toUpperCase();
    if (!trimmedNum) {
      errs.slotNumber = 'Slot number is required (e.g. A-101).';
    } else if (!/^[A-Za-z0-9\s-]{1,20}$/.test(trimmedNum)) {
      errs.slotNumber = 'Only alphanumeric characters, spaces, and hyphens (max 20).';
    }

    if (!formData.slotType) {
      errs.slotType = 'Please select a slot vehicle classification.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Slot Form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        lotId: Number(formData.lotId),
        slotNumber: formData.slotNumber.trim().toUpperCase(),
        slotType: formData.slotType,
        status: formData.status,
      };

      if (editingSlot) {
        await parkingApi.updateSlot(editingSlot.id, payload, token);
        toast({
          type: 'success',
          title: 'Slot Updated',
          message: `Slot #${payload.slotNumber} has been updated.`,
        });
      } else {
        await parkingApi.createSlot(payload, token);
        toast({
          type: 'success',
          title: 'Slot Created',
          message: `Slot #${payload.slotNumber} successfully added to inventory.`,
        });
      }

      setIsModalOpen(false);
      loadSlots();
    } catch (err) {
      setModalServerError(err.message || 'Operation failed. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Toggle (Available <-> Maintenance)
  const handleToggleStatus = async (slot) => {
    const nextStatus = slot.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await parkingApi.updateSlot(slot.id, { status: nextStatus }, token);
      toast({
        type: 'info',
        title: 'Status Updated',
        message: `Slot #${slot.slotNumber} marked as ${nextStatus}.`,
      });
      loadSlots();
    } catch (err) {
      toast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update slot status.',
      });
    }
  };

  // Delete Slot Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingSlot) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await parkingApi.deleteSlot(deletingSlot.id, token);
      toast({
        type: 'success',
        title: 'Slot Deleted',
        message: `Slot #${deletingSlot.slotNumber} was permanently removed.`,
      });
      setDeletingSlot(null);
      loadSlots();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete parking slot.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand font-bold uppercase tracking-wider mb-1">
            <Grid3X3 className="w-4 h-4" />
            <span>Bay Inventory</span>
          </div>
          <h1 className="park-page-title">Parking Slots Inventory</h1>
          <p className="text-xs text-text-muted mt-1">
            Track parking bays across facility lots, manage vehicle type designations, and toggle maintenance flags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadSlots}
            disabled={isLoading}
            title="Refresh slots list"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            disabled={lots.length === 0}
            id="admin-add-slot-btn"
          >
            Add New Slot
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="park-card p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted uppercase font-bold">Total Bays</span>
          <span className="text-xl font-bold text-text mt-1">{metrics.total}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-available/30 bg-status-available/5">
          <span className="text-[10px] text-status-available uppercase font-bold">Operational</span>
          <span className="text-xl font-bold text-status-available mt-1">{metrics.available}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-status-pending/30 bg-status-pending/5">
          <span className="text-[10px] text-status-pending uppercase font-bold">Maintenance</span>
          <span className="text-xl font-bold text-status-pending mt-1">{metrics.maintenance}</span>
        </div>
        <div className="park-card p-3 flex flex-col justify-between border-border">
          <span className="text-[10px] text-text-muted uppercase font-bold">Inactive</span>
          <span className="text-xl font-bold text-text-muted mt-1">{metrics.inactive}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="park-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by slot #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand"
            />
          </div>

          {/* Lot Filter Dropdown */}
          <div className="space-y-1">
            <select
              value={selectedLotId}
              onChange={(e) => handleLotFilterChange(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Facilities / Lots</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name} ({lot.totalCapacity} slots)
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="space-y-1">
            <select
              value={selectedSlotType}
              onChange={(e) => setSelectedSlotType(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Vehicle Types</option>
              {SLOT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Operating States</option>
              <option value="AVAILABLE">AVAILABLE (Open)</option>
              <option value="MAINTENANCE">MAINTENANCE (Reserved/Work)</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="park-card p-4 space-y-2">
              <Skeleton className="h-5 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-6 w-full rounded mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load parking slots"
          message={error}
          onRetry={loadSlots}
        />
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          icon={Grid3X3}
          title="No parking slots found"
          description={
            searchQuery || selectedLotId !== 'ALL' || selectedSlotType !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No parking slots match the selected filter combination. Try clearing your filters.'
              : lots.length === 0
              ? 'No parking lots exist yet. You must create at least one parking lot before adding bays.'
              : 'No parking slots are configured yet for this facility. Add your first bay.'
          }
          actionLabel={lots.length > 0 ? 'Add First Slot' : undefined}
          onAction={lots.length > 0 ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => {
            const badgeVariant = SLOT_STATUS_VARIANTS[slot.status] || 'neutral';
            const typeLabel = SLOT_TYPES.find((t) => t.value === slot.slotType)?.label || slot.slotType;

            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="park-card p-4 flex flex-col justify-between hover:border-brand/40 transition-colors group relative"
              >
                {/* Slot Bay Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
                        {slot.lotName || 'Facility Lot'}
                      </div>
                      <div className="text-base font-bold text-text tracking-tight group-hover:text-brand transition-colors">
                        #{slot.slotNumber}
                      </div>
                    </div>
                    <Badge variant={badgeVariant} size="sm">
                      {slot.status}
                    </Badge>
                  </div>

                  {/* Vehicle Compatibility Tag */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-raised border border-border/60 text-[11px] text-text-muted">
                    <Car className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span className="truncate font-medium">{typeLabel}</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(slot)}
                    className="text-[11px] text-text-muted hover:text-amber-400 font-medium transition-colors"
                    title="Toggle Maintenance flag"
                  >
                    {slot.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenEdit(slot)}
                      title="Edit slot"
                      className="px-2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setDeletingSlot(slot);
                        setDeleteError('');
                      }}
                      title="Delete slot"
                      className="px-2 text-status-occupied hover:bg-status-occupied/10"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Slot Modal Dialog ──────────────────────────────────── */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingSlot ? `Edit Slot #${editingSlot.slotNumber}` : 'Add Parking Bay'}
        description={
          editingSlot
            ? 'Modify slot bay designation, compatible vehicle classification, or maintenance status.'
            : 'Register a new parking bay under a designated facility lot.'
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForm}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              id="admin-submit-slot-btn"
            >
              {editingSlot ? 'Save Changes' : 'Create Slot'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {modalServerError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-xs text-status-occupied font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{modalServerError}</span>
            </div>
          )}

          {/* Facility Lot Select */}
          <div className="space-y-1">
            <label htmlFor="slot-lot-select" className="block text-xs font-medium text-text">
              Target Facility Lot *
            </label>
            <select
              id="slot-lot-select"
              value={formData.lotId}
              onChange={(e) => {
                setFormData((p) => ({ ...p, lotId: e.target.value }));
                setFormErrors((p) => ({ ...p, lotId: '' }));
              }}
              disabled={isSubmitting || Boolean(editingSlot)}
              className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
            >
              <option value="">Select a facility lot...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.address})
                </option>
              ))}
            </select>
            {formErrors.lotId && (
              <p className="text-[11px] text-status-occupied mt-1">{formErrors.lotId}</p>
            )}
          </div>

          {/* Slot Number */}
          <Input
            id="slot-number-input"
            label="Slot Identifier / Bay # *"
            placeholder="e.g. A-101, B-204"
            value={formData.slotNumber}
            onChange={(e) => {
              setFormData((p) => ({ ...p, slotNumber: e.target.value }));
              setFormErrors((p) => ({ ...p, slotNumber: '' }));
            }}
            error={formErrors.slotNumber}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slot Vehicle Type */}
            <div className="space-y-1">
              <label htmlFor="slot-type-select" className="block text-xs font-medium text-text">
                Vehicle Compatibility *
              </label>
              <select
                id="slot-type-select"
                value={formData.slotType}
                onChange={(e) => setFormData((p) => ({ ...p, slotType: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
              >
                {SLOT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <label htmlFor="slot-status-select" className="block text-xs font-medium text-text">
                Operating Status *
              </label>
              <select
                id="slot-status-select"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
              >
                <option value="AVAILABLE">AVAILABLE (Open for Booking)</option>
                <option value="MAINTENANCE">MAINTENANCE (Reserved/Repairs)</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </form>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog
        isOpen={Boolean(deletingSlot)}
        onClose={() => !isDeleting && setDeletingSlot(null)}
        title="Delete Parking Bay"
        description="Permanently remove this bay from inventory."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeletingSlot(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              disabled={isDeleting}
              id="admin-confirm-delete-slot-btn"
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          {deleteError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied font-medium flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-text">
            Are you sure you want to delete parking bay{' '}
            <span className="font-bold text-brand font-mono">&ldquo;#{deletingSlot?.slotNumber}&rdquo;</span>?
          </p>

          <div className="p-3 rounded-input bg-surface-raised border border-border text-text-muted space-y-1">
            <div>
              <span className="font-bold text-text">Facility Lot:</span> {deletingSlot?.lotName || 'N/A'}
            </div>
            <div>
              <span className="font-bold text-text">Vehicle Class:</span> {deletingSlot?.slotType}
            </div>
            <div>
              <span className="font-bold text-text">Current Status:</span> {deletingSlot?.status}
            </div>
          </div>

          <p className="text-[11px] text-text-muted/80 leading-relaxed">
            Note: Deletion will be rejected if this slot is referenced by active customer reservations or current parking sessions.
          </p>
        </div>
      </Dialog>
    </div>
  );
};
