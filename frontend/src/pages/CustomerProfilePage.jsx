import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Bike,
  Truck,
} from 'lucide-react';
import { Button, Input, Card, Badge, Dialog, useToast, CardSkeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { usersApi, vehiclesApi } from '../lib/api';

const VEHICLE_TYPE_CONFIG = {
  STANDARD_CAR: { label: 'Standard Car', icon: Car, variant: 'brand' },
  SUV: { label: 'SUV', icon: Car, variant: 'neutral' },
  MOTORCYCLE: { label: 'Motorcycle', icon: Bike, variant: 'info' },
  VAN: { label: 'Van', icon: Truck, variant: 'neutral' },
  TRUCK: { label: 'Truck', icon: Truck, variant: 'neutral' },
};

export const CustomerProfilePage = () => {
  const { user, token, login } = useAuth();
  const { addToast } = useToast();
  const profileFallback = useRef(user);

  // Profile State
  const [profile, setProfile] = useState(user);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');

  // Add Vehicle Dialog State
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('STANDARD_CAR');
  const [newModel, setNewModel] = useState('');
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [addVehicleError, setAddVehicleError] = useState('');

  // Edit Vehicle Dialog State
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editPlate, setEditPlate] = useState('');
  const [editType, setEditType] = useState('STANDARD_CAR');
  const [editModel, setEditModel] = useState('');
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [editVehicleError, setEditVehicleError] = useState('');

  // Delete Vehicle Confirmation Dialog State
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [deleteVehicleError, setDeleteVehicleError] = useState('');

  useEffect(() => {
    profileFallback.current = user;
  }, [user]);

  // Synchronize profile data with API or Auth Context
  const loadProfile = useCallback(async () => {
    if (!token) {
      setProfileError('Your authentication session is unavailable. Please sign in again.');
      setIsProfileLoading(false);
      return;
    }
    try {
      setIsProfileLoading(true);
      setProfileError('');
      const res = await usersApi.getMyProfile(token);
      if (res?.data?.user) {
        setProfile(res.data.user);
      } else {
        throw new Error('The profile service returned no user information.');
      }
    } catch (err) {
      setProfileError(err.message || 'Unable to load your profile from the server.');
      if (profileFallback.current) setProfile(profileFallback.current);
    } finally {
      setIsProfileLoading(false);
    }
  }, [token]);

  // Fetch real registered vehicles
  const loadVehicles = useCallback(async () => {
    if (!token) {
      setVehiclesError('Your authentication session is unavailable. Please sign in again.');
      setIsVehiclesLoading(false);
      return;
    }
    try {
      setIsVehiclesLoading(true);
      setVehiclesError('');
      const res = await vehiclesApi.getMyVehicles(token);
      if (res?.data?.vehicles) {
        setVehicles(res.data.vehicles);
      } else {
        throw new Error('The vehicle service returned no vehicle list.');
      }
    } catch (err) {
      setVehiclesError(err.message || 'Failed to load vehicles from server.');
    } finally {
      setIsVehiclesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
    loadVehicles();
  }, [loadProfile, loadVehicles]);

  // Open Edit Profile Modal
  const handleOpenEditProfile = () => {
    setEditFullName(profile?.fullName || '');
    setEditPhone(profile?.phone || '');
    setProfileError('');
    setIsEditProfileOpen(true);
  };

  // Submit Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFullName || editFullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileError('');
      const res = await usersApi.updateMyProfile(
        { fullName: editFullName.trim(), phone: editPhone.trim() || null },
        token
      );
      if (res?.data?.user) {
        setProfile(res.data.user);
        login(token, res.data.user);
      }
      setIsEditProfileOpen(false);
      addToast({
        title: 'Profile Updated',
        message: 'Your personal information was updated successfully.',
        type: 'success',
      });
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Add Vehicle Modal
  const handleOpenAddVehicle = () => {
    setNewPlate('');
    setNewType('STANDARD_CAR');
    setNewModel('');
    setAddVehicleError('');
    setIsAddVehicleOpen(true);
  };

  // Submit Add Vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const cleanPlate = newPlate.trim().toUpperCase();
    if (!cleanPlate || cleanPlate.length < 2) {
      setAddVehicleError('Valid license plate number is required.');
      return;
    }

    try {
      setIsSubmittingVehicle(true);
      setAddVehicleError('');
      const res = await vehiclesApi.createVehicle(
        {
          plateNumber: cleanPlate,
          vehicleType: newType,
          makeModel: newModel.trim() || null,
        },
        token
      );

      if (res?.data?.vehicle) {
        setVehicles((prev) => [res.data.vehicle, ...prev]);
      }
      setIsAddVehicleOpen(false);
      addToast({
        title: 'Vehicle Registered',
        message: `Vehicle ${cleanPlate} added to your account.`,
        type: 'success',
      });
    } catch (err) {
      setAddVehicleError(err.message || 'Failed to register vehicle.');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  // Open Edit Vehicle Modal
  const handleOpenEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditPlate(vehicle.plateNumber || '');
    setEditType(vehicle.vehicleType || 'STANDARD_CAR');
    setEditModel(vehicle.makeModel || '');
    setEditVehicleError('');
  };

  // Submit Edit Vehicle
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    const cleanPlate = editPlate.trim().toUpperCase();
    if (!cleanPlate || cleanPlate.length < 2) {
      setEditVehicleError('Valid license plate number is required.');
      return;
    }

    try {
      setIsUpdatingVehicle(true);
      setEditVehicleError('');
      const res = await vehiclesApi.updateVehicle(
        editingVehicle.id,
        {
          plateNumber: cleanPlate,
          vehicleType: editType,
          makeModel: editModel.trim() || null,
        },
        token
      );

      if (res?.data?.vehicle) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? res.data.vehicle : v))
        );
      }
      setEditingVehicle(null);
      addToast({
        title: 'Vehicle Updated',
        message: `Vehicle ${cleanPlate} updated successfully.`,
        type: 'success',
      });
    } catch (err) {
      setEditVehicleError(err.message || 'Failed to update vehicle.');
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  // Confirm Delete Vehicle
  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;

    try {
      setIsDeletingVehicle(true);
      setDeleteVehicleError('');
      await vehiclesApi.deleteVehicle(deletingVehicle.id, token);

      setVehicles((prev) => prev.filter((v) => v.id !== deletingVehicle.id));
      const plate = deletingVehicle.plateNumber;
      setDeletingVehicle(null);
      addToast({
        title: 'Vehicle Removed',
        message: `Vehicle ${plate} has been removed from your garage.`,
        type: 'success',
      });
    } catch (err) {
      setDeleteVehicleError(
        err.message || 'Cannot delete vehicle: active booking or session in progress.'
      );
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  // Get User Initials
  const getInitials = (name) => {
    if (!name) return 'CU';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="park-page-heading">
        <h1 className="park-page-title">
          Customer Profile & Vehicles
        </h1>
        <p className="park-page-description">
          Manage your personal details and registered vehicles, and review your reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card
            title="Personal Information"
            subtitle="Authenticated Customer Account"
            headerAction={
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={handleOpenEditProfile}
              >
                Edit
              </Button>
            }
          >
            {isProfileLoading ? (
              <div className="space-y-5" role="status" aria-label="Loading customer profile">
                <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
                  <div className="h-12 w-12 rounded-full bg-surface-raised animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-sm bg-surface-raised animate-pulse" />
                    <div className="h-3 w-1/2 rounded-sm bg-surface-raised animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-1/3 rounded-sm bg-surface-raised animate-pulse" />
                  <div className="h-4 w-2/3 rounded-sm bg-surface-raised animate-pulse" />
                  <div className="h-3 w-1/4 rounded-sm bg-surface-raised animate-pulse" />
                  <div className="h-4 w-1/2 rounded-sm bg-surface-raised animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Avatar and Name */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
                <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center font-bold text-base text-brand">
                  {getInitials(profile?.fullName)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text leading-tight">
                    {profile?.fullName || 'Customer'}
                  </h3>
                  <span className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                    Customer account
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
                <span className="font-semibold text-text break-all block pl-5">
                  {profile?.email || 'Not available'}
                </span>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
                <span className="font-semibold text-text block pl-5">
                  {profile?.phone || 'Not provided'}
                </span>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <span className="text-text-muted block mb-1">Account Role</span>
                <Badge variant="brand">{profile?.role || 'CUSTOMER'}</Badge>
              </div>

              {/* Member Since */}
              {profile?.createdAt && (
                <div className="pt-3 border-t border-border/60 text-[11px] text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            )}
            {profileError && !isProfileLoading && (
            <div
              className="mt-4 flex flex-col gap-2 rounded-input border border-status-occupied/30 bg-status-occupied/10 p-3 text-xs text-status-occupied sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <span>{profileError} Showing the saved account details where available.</span>
              <Button variant="outline" size="sm" onClick={loadProfile}>
                Retry
              </Button>
            </div>
            )}
          </Card>
        </div>

        {/* Vehicles Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text">
                Registered Vehicles ({vehicles.length})
              </h2>
              <p className="text-xs text-text-muted">
                Registered to your account for use in reservation requests.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddVehicle}
            >
              Add Vehicle
            </Button>
          </div>

          {vehiclesError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{vehiclesError}</span>
            </div>
          )}

          {isVehiclesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="border border-dashed border-border rounded-card p-8 text-center space-y-3 bg-surface/50">
              <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mx-auto">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text">No Registered Vehicles</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                You haven't added any vehicles yet. Register your license plate to reserve compatible parking slots.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddVehicle}
                className="mt-2"
              >
                Register First Vehicle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => {
                const config = VEHICLE_TYPE_CONFIG[v.vehicleType] || VEHICLE_TYPE_CONFIG.STANDARD_CAR;
                const TypeIcon = config.icon;

                return (
                  <Card
                    key={v.id}
                    title={v.plateNumber}
                    subtitle={v.makeModel || 'Standard Vehicle'}
                    badge={<Badge variant={config.variant}>{config.label}</Badge>}
                    headerAction={
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVehicle(v)}
                          className="p-1 rounded text-text-muted hover:text-brand hover:bg-surface-raised transition-colors"
                          title="Edit vehicle"
                          aria-label={`Edit vehicle ${v.plateNumber}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteVehicleError('');
                            setDeletingVehicle(v);
                          }}
                          className="p-1 rounded text-text-muted hover:text-status-occupied hover:bg-surface-raised transition-colors"
                          title="Remove vehicle"
                          aria-label={`Remove vehicle ${v.plateNumber}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    }
                  >
                    <div className="text-xs text-text-muted space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <TypeIcon className="w-3.5 h-3.5 text-brand" />
                          <span>Type:</span>
                        </span>
                        <span className="font-semibold text-text">{config.label}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Status:</span>
                        <span className="text-text-muted font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Registered
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Account summary */}
          <div className="pt-6 border-t border-border/60 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold tracking-tight text-text">
                Account overview
              </h2>
              <Link to="/reservations">
                <Button variant="outline" size="sm" icon={Calendar}>
                  View reservations
                </Button>
              </Link>
            </div>
            <div className="park-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="space-y-1">
                <div className="font-semibold text-text">Registered vehicles</div>
                <div className="text-text-muted">
                  {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} linked to your account.
                </div>
              </div>
              <Badge variant="neutral">Account</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Customer Profile"
        description="Update your contact information. Email and role are managed securely."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied text-xs">
              {profileError}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Shahariar Ahammad Fahim"
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +880 1712-345678"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            helperText="Include country code if applicable for SMS parking updates."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Vehicle Modal */}
      <Dialog
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Register New Vehicle"
        description="Add a vehicle license plate and vehicle class for parking slot compatibility."
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          {addVehicleError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied text-xs">
              {addVehicleError}
            </div>
          )}

          <Input
            label="License Plate Number"
            placeholder="e.g. DHK-METRO-GA-1122"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
            required
            helperText="Standard license plate number (alphanumeric and hyphens)."
          />

          <div className="space-y-1.5 font-mono">
            <label className="block text-xs font-medium text-text-muted select-none">
              Vehicle Type <span className="text-status-occupied">*</span>
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full bg-surface-raised text-text text-sm font-mono border border-border rounded-input px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="STANDARD_CAR">Standard Car (Sedan, Hatchback)</option>
              <option value="SUV">SUV / Crossover</option>
              <option value="MOTORCYCLE">Motorcycle / Two-Wheeler</option>
              <option value="VAN">Van / Minivan</option>
              <option value="TRUCK">Truck / Commercial</option>
            </select>
          </div>

          <Input
            label="Make / Model"
            placeholder="e.g. Toyota Corolla"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            helperText="Optional manufacturer and model description."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddVehicleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingVehicle}
            >
              Register Vehicle
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog
        isOpen={Boolean(editingVehicle)}
        onClose={() => setEditingVehicle(null)}
        title="Update Vehicle Details"
        description="Modify vehicle classification or license plate details."
      >
        <form onSubmit={handleUpdateVehicle} className="space-y-4">
          {editVehicleError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied text-xs">
              {editVehicleError}
            </div>
          )}

          <Input
            label="License Plate Number"
            value={editPlate}
            onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
            required
          />

          <div className="space-y-1.5 font-mono">
            <label className="block text-xs font-medium text-text-muted select-none">
              Vehicle Type <span className="text-status-occupied">*</span>
            </label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="w-full bg-surface-raised text-text text-sm font-mono border border-border rounded-input px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="STANDARD_CAR">Standard Car (Sedan, Hatchback)</option>
              <option value="SUV">SUV / Crossover</option>
              <option value="MOTORCYCLE">Motorcycle / Two-Wheeler</option>
              <option value="VAN">Van / Minivan</option>
              <option value="TRUCK">Truck / Commercial</option>
            </select>
          </div>

          <Input
            label="Make / Model"
            value={editModel}
            onChange={(e) => setEditModel(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingVehicle(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingVehicle}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Vehicle Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        title="Confirm Vehicle Deletion"
        description="Are you sure you want to remove this vehicle from your account?"
      >
        <div className="space-y-4">
          {deleteVehicleError && (
            <div className="p-3 rounded-input bg-status-occupied/10 border border-status-occupied/30 text-status-occupied text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteVehicleError}</span>
            </div>
          )}

          <div className="p-3 rounded-input bg-surface border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">License Plate:</span>
              <span className="font-bold text-text">{deletingVehicle?.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Type:</span>
              <span className="text-text">{deletingVehicle?.vehicleType}</span>
            </div>
            {deletingVehicle?.makeModel && (
              <div className="flex justify-between">
                <span className="text-text-muted">Make / Model:</span>
                <span className="text-text">{deletingVehicle.makeModel}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Safety Protection: If this vehicle is currently tied to an active or confirmed reservation, or an ongoing parking session, deletion will be blocked by the server to protect data integrity.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingVehicle(null)}
              disabled={isDeletingVehicle}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              isLoading={isDeletingVehicle}
              onClick={handleConfirmDelete}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
