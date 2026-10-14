import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Grid3X3,
  Car,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Button, Input, Dialog, EmptyState, ErrorState, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { parkingApi } from '../lib/api';

const LOT_STATUS_VARIANTS = {
  ACTIVE: 'available',
  MAINTENANCE: 'pending',
  INACTIVE: 'neutral',
};

export const AdminLotsPage = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalCapacity: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalServerError, setModalServerError] = useState('');

  // Delete Confirmation State
  const [deletingLot, setDeletingLot] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load Lots
  const loadLots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const res = await parkingApi.getLots(filters, token);
      setLots(res?.data?.lots || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve parking lots.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, token]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingLot(null);
    setFormData({
      name: '',
      address: '',
      totalCapacity: '50',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setModalServerError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lot) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name || '',
      address: lot.address || '',
      totalCapacity: String(lot.totalCapacity ?? ''),
      status: lot.status || 'ACTIVE',
    });
    setFormErrors({});
    setModalServerError('');
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Lot name is required (minimum 2 characters).';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Lot name cannot exceed 100 characters.';
    }

    if (!formData.address.trim() || formData.address.trim().length < 3) {
      errs.address = 'Physical address is required (minimum 3 characters).';
    } else if (formData.address.trim().length > 255) {
      errs.address = 'Address cannot exceed 255 characters.';
    }

    const capNum = Number(formData.totalCapacity);
    if (formData.totalCapacity === '' || isNaN(capNum) || !Number.isInteger(capNum) || capNum < 0) {
      errs.totalCapacity = 'Capacity must be a non-negative integer.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Lot (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        totalCapacity: Number(formData.totalCapacity),
        status: formData.status,
      };

      if (editingLot) {
        await parkingApi.updateLot(editingLot.id, payload, token);
        toast({
          type: 'success',
          title: 'Lot Updated',
          message: `Parking lot "${payload.name}" was successfully updated.`,
        });
      } else {
        await parkingApi.createLot(payload, token);
        toast({
          type: 'success',
          title: 'Lot Created',
          message: `Parking lot "${payload.name}" has been created.`,
        });
      }

      setIsModalOpen(false);
      loadLots();
    } catch (err) {
      setModalServerError(err.message || 'Operation failed. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Lot
  const handleDeleteConfirm = async () => {
    if (!deletingLot) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await parkingApi.deleteLot(deletingLot.id, token);
      toast({
        type: 'success',
        title: 'Lot Deleted',
        message: `Parking lot "${deletingLot.name}" was permanently removed.`,
      });
      setDeletingLot(null);
      loadLots();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete parking lot.');
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
            <Building2 className="w-4 h-4" />
            <span>Facility Management</span>
          </div>
          <h1 className="park-page-title">Parking Lots Management</h1>
          <p className="text-xs text-text-muted mt-1">
            Configure physical parking facilities, location addresses, total capacity, and operational status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadLots}
            disabled={isLoading}
            title="Refresh lots list"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            id="admin-add-lot-btn"
          >
            Add New Lot
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="park-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lot name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-input bg-surface-raised border border-border text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`
                  px-3 py-1.5 rounded-input text-xs font-medium transition-all whitespace-nowrap
                  ${statusFilter === st
                    ? 'bg-brand/15 text-brand border border-brand/30 font-bold'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised border border-transparent'}
                `}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="park-card p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <div className="pt-3 border-t border-border flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load parking lots"
          message={error}
          onRetry={loadLots}
        />
      ) : lots.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No parking lots found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No parking lots match the selected filter criteria. Try adjusting or clearing your filters.'
              : 'No parking lots are currently configured in the database. Create the first lot to get started.'
          }
          actionLabel="Add First Lot"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lots.map((lot) => {
            const badgeVariant = LOT_STATUS_VARIANTS[lot.status] || 'neutral';
            return (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="park-card flex flex-col justify-between hover:border-brand/40 transition-colors group"
              >
                <div className="p-5 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-text tracking-tight group-hover:text-brand transition-colors">
                        {lot.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-text-muted/80" />
                        <span className="truncate">{lot.address}</span>
                      </div>
                    </div>
                    <Badge variant={badgeVariant} size="sm">
                      {lot.status}
                    </Badge>
                  </div>

                  {/* Metrics Box */}
                  <div className="p-3 rounded-input bg-surface-raised border border-border/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block font-medium">Design Capacity</span>
                      <span className="font-bold text-text text-sm">{lot.totalCapacity} slots</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block font-medium">Configured Bays</span>
                      <span className="font-bold text-amber-400 text-sm">{lot.slotCount ?? 0} slots</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-surface-subtle/40 border-t border-border flex items-center justify-between text-xs gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Grid3X3}
                    onClick={() => navigate(`/admin/slots?lotId=${lot.id}`)}
                    className="text-[11px] text-brand hover:underline px-2"
                  >
                    Manage Slots →
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenEdit(lot)}
                      title="Edit Lot details"
                      className="px-2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setDeletingLot(lot);
                        setDeleteError('');
                      }}
                      title="Delete Lot"
                      className="px-2 text-status-occupied hover:bg-status-occupied/10"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Lot Modal Dialog ───────────────────────────────────── */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingLot ? `Edit Facility: ${editingLot.name}` : 'Create New Parking Lot'}
        description={
          editingLot
            ? 'Update physical facility properties, capacity quotas, and operating state.'
            : 'Register a new physical parking facility in the ParkEase database.'
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
              id="admin-submit-lot-btn"
            >
              {editingLot ? 'Save Changes' : 'Create Lot'}
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

          {/* Lot Name */}
          <Input
            id="lot-name-input"
            label="Lot Facility Name *"
            placeholder="e.g. Downtown Central Plaza"
            value={formData.name}
            onChange={(e) => {
              setFormData((p) => ({ ...p, name: e.target.value }));
              setFormErrors((p) => ({ ...p, name: '' }));
            }}
            error={formErrors.name}
            disabled={isSubmitting}
            required
          />

          {/* Address */}
          <Input
            id="lot-address-input"
            label="Physical Street Address / Location *"
            placeholder="e.g. 102 Downtown Avenue, Level G-2"
            value={formData.address}
            onChange={(e) => {
              setFormData((p) => ({ ...p, address: e.target.value }));
              setFormErrors((p) => ({ ...p, address: '' }));
            }}
            error={formErrors.address}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Capacity */}
            <Input
              id="lot-capacity-input"
              label="Design Capacity (Max Slots) *"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 60"
              value={formData.totalCapacity}
              onChange={(e) => {
                setFormData((p) => ({ ...p, totalCapacity: e.target.value }));
                setFormErrors((p) => ({ ...p, totalCapacity: '' }));
              }}
              error={formErrors.totalCapacity}
              disabled={isSubmitting}
              required
            />

            {/* Status Select */}
            <div className="space-y-1">
              <label htmlFor="lot-status-select" className="block text-xs font-medium text-text">
                Operating Status *
              </label>
              <select
                id="lot-status-select"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-input bg-surface-raised border border-border text-xs text-text focus:outline-none focus:border-brand"
              >
                <option value="ACTIVE">ACTIVE (Accepting Bookings)</option>
                <option value="MAINTENANCE">MAINTENANCE (Temporarily Closed)</option>
                <option value="INACTIVE">INACTIVE (Decommissioned)</option>
              </select>
            </div>
          </div>
        </form>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog
        isOpen={Boolean(deletingLot)}
        onClose={() => !isDeleting && setDeletingLot(null)}
        title="Delete Parking Lot"
        description="This action cannot be undone and will permanently remove this facility record."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeletingLot(null)}
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
              id="admin-confirm-delete-lot-btn"
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
            Are you sure you want to delete parking lot{' '}
            <span className="font-bold text-brand font-mono">&ldquo;{deletingLot?.name}&rdquo;</span>?
          </p>

          <div className="p-3 rounded-input bg-surface-raised border border-border text-text-muted space-y-1">
            <div>
              <span className="font-bold text-text">Address:</span> {deletingLot?.address}
            </div>
            <div>
              <span className="font-bold text-text">Capacity:</span> {deletingLot?.totalCapacity} slots
            </div>
            <div>
              <span className="font-bold text-text">Configured Slots:</span> {deletingLot?.slotCount ?? 0}
            </div>
          </div>

          <p className="text-[11px] text-text-muted/80 leading-relaxed">
            Note: The backend safety checks will prevent deletion if this lot or any of its slots contain active
            reservations or ongoing parking sessions.
          </p>
        </div>
      </Dialog>
    </div>
  );
};
