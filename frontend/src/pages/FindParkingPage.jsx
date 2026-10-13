import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, Car, MapPin, Check } from 'lucide-react';
import { Button, Input, Card, Badge, Dialog } from '../components/ui';

export const FindParkingPage = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const mockSlots = [
    { id: 'A-101', lot: 'Central Plaza Lot', floor: 'L1', type: 'Compact Car', rate: 3.50, status: 'available' },
    { id: 'A-102', lot: 'Central Plaza Lot', floor: 'L1', type: 'Standard Car', rate: 4.00, status: 'available' },
    { id: 'A-103', lot: 'Central Plaza Lot', floor: 'L1', type: 'SUV / Van', rate: 5.00, status: 'pending' },
    { id: 'A-104', lot: 'Central Plaza Lot', floor: 'L1', type: 'Standard Car', rate: 4.00, status: 'occupied' },
    { id: 'B-201', lot: 'North Terminal Lot', floor: 'L2', type: 'Motorcycle', rate: 2.00, status: 'available' },
    { id: 'B-202', lot: 'North Terminal Lot', floor: 'L2', type: 'Standard Car', rate: 4.50, status: 'maintenance' },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">Find & Reserve Parking</h1>
          <p className="text-xs text-text-muted mt-1">
            Browse available slots, filter by vehicle type, and reserve your parking interval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="available">4 Available</Badge>
          <Badge variant="occupied">1 Occupied</Badge>
          <Badge variant="maintenance">1 Maintenance</Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="park-card p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Parking Location"
          placeholder="All Parking Lots"
          icon={MapPin}
          defaultValue="Central Plaza Lot"
        />
        <Input
          label="Vehicle Type"
          placeholder="Any Vehicle"
          icon={Car}
          defaultValue="Standard Car"
        />
        <Input
          label="Date"
          type="date"
          icon={Calendar}
          defaultValue="2026-10-14"
        />
        <div className="flex items-end">
          <Button variant="primary" fullWidth icon={Search}>
            Filter Slots
          </Button>
        </div>
      </div>

      {/* Parking Slots Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Available Slots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSlots.map((slot) => (
            <Card
              key={slot.id}
              variant={slot.status === 'available' ? 'interactive' : 'default'}
              title={`Slot #${slot.id}`}
              subtitle={`${slot.lot} • ${slot.floor}`}
              headerAction={<Badge variant={slot.status}>{slot.status}</Badge>}
              footer={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-text">${slot.rate.toFixed(2)}/hr</span>
                  <Button
                    variant={slot.status === 'available' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={slot.status !== 'available'}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.status === 'available' ? 'Reserve Slot' : 'Unavailable'}
                  </Button>
                </div>
              }
            >
              <div className="space-y-1.5 text-xs text-text-muted">
                <p>Compatibility: <span className="text-text font-medium">{slot.type}</span></p>
                <p>Access Level: Ground Clearance 2.4m</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog
        isOpen={Boolean(selectedSlot)}
        onClose={() => {
          setSelectedSlot(null);
          setBookingSuccess(false);
        }}
        title={`Reserve Slot #${selectedSlot?.id}`}
        description="Verify reservation details before confirming."
        footer={
          !bookingSuccess ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBookingSuccess(true)}
              >
                Confirm Reservation
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setSelectedSlot(null)}>
              Done
            </Button>
          )
        }
      >
        {!bookingSuccess ? (
          <div className="space-y-3 text-xs text-text">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Location:</span>
              <span className="font-bold">{selectedSlot?.lot}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-muted">Hourly Rate:</span>
              <span className="font-bold">${selectedSlot?.rate.toFixed(2)} / hr</span>
            </div>
            <div className="p-3 rounded-input bg-brand/10 border border-brand/20 text-brand text-[11px]">
              DEMO PAYMENT — NO REAL MONEY CHARGED
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-status-available/15 text-status-available border border-status-available/30 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-text">Reservation Successful</h3>
            <p className="text-xs text-text-muted">
              Slot #{selectedSlot?.id} has been reserved. You can review it in your profile.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
};
