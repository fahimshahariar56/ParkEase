import React, { useState } from 'react';
import { User, Car, Plus, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, Badge, Dialog } from '../components/ui';

export const CustomerProfilePage = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: 'DHK-METRO-GA-1122', type: 'Standard Car', model: 'Toyota Corolla' },
    { id: 2, plate: 'DHK-METRO-HA-3344', type: 'SUV / Van', model: 'Honda CR-V' },
  ]);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newPlate) return;
    setVehicles((prev) => [
      ...prev,
      { id: Date.now(), plate: newPlate, model: newModel || 'Vehicle', type: 'Standard Car' },
    ]);
    setNewPlate('');
    setNewModel('');
    setIsAddVehicleOpen(false);
  };

  const handleDeleteVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-10 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">Customer Profile & Vehicles</h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal details, registered vehicles, and reservation activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card title="Personal Information" subtitle="Authenticated Customer Account">
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-text-muted block mb-1">Full Name</span>
                <span className="font-bold text-sm text-text">Shahariar Ahammad Fahim</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Email Address</span>
                <span className="font-bold text-sm text-text">fahim.shahariar.cse@gmail.com</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Role</span>
                <Badge variant="brand">CUSTOMER</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicles Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Registered Vehicles ({vehicles.length})</h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddVehicleOpen(true)}
            >
              Add Vehicle
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <Card
                key={v.id}
                title={v.plate}
                subtitle={`${v.model} • ${v.type}`}
                headerAction={
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-1 rounded text-text-muted hover:text-status-occupied"
                    title="Remove vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                }
              >
                <div className="text-xs text-text-muted space-y-1">
                  <p>Status: <span className="text-status-available font-semibold">Active</span></p>
                  <p>Registered: Today</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Reservations */}
          <div className="pt-6 border-t border-border/60 space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Recent Reservations</h2>
            <div className="park-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-sm text-text">Slot #A-102 (Central Plaza Lot)</div>
                <div className="text-text-muted">Vehicle: DHK-METRO-GA-1122 • 2026-10-14 10:00 - 12:00</div>
              </div>
              <Badge variant="pending">Active Booking</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Dialog
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Register New Vehicle"
        description="Add a vehicle plate number for parking slot compatibility."
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <Input
            label="License Plate Number"
            placeholder="e.g. DHK-METRO-GA-9988"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
            required
          />
          <Input
            label="Make / Model"
            placeholder="e.g. Toyota Aqua"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddVehicleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Vehicle
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
