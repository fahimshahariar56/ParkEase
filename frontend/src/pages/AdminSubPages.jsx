import React from 'react';
import { Card, Badge, Button, Input } from '../components/ui';
import { Plus, Building2, Grid3X3, CalendarCheck, ArrowRightLeft, Users, DollarSign, BarChart3 } from 'lucide-react';

export { AdminLotsPage } from './AdminLotsPage';
export { AdminSlotsPage } from './AdminSlotsPage';
export { AdminReservationsPage } from './AdminReservationsPage';
export { AdminSessionsPage } from './AdminSessionsPage';

export const AdminCustomersPage = () => (
  <div className="space-y-6 font-mono">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Registered Customers</h1>
      <p className="text-xs text-text-muted mt-1">Customer accounts created through public registration.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Shahariar Ahammad Fahim" subtitle="fahim.shahariar.cse@gmail.com">
        <div className="text-xs text-text-muted space-y-1">
          <p>Role: <span className="text-brand font-bold">CUSTOMER</span></p>
          <p>Registered Vehicles: 2</p>
          <p>Total Reservations: 5</p>
        </div>
      </Card>
    </div>
  </div>
);

export const AdminPricingPage = () => (
  <div className="space-y-6 font-mono">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Rules</h1>
        <p className="text-xs text-text-muted mt-1">Configure hourly rates by slot type and vehicle category.</p>
      </div>
      <Button variant="primary" size="sm" icon={Plus}>New Rule</Button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Standard Car" subtitle="Hourly Rate">
        <div className="text-xl font-bold text-brand">$4.00 / hr</div>
      </Card>
      <Card title="SUV / Van" subtitle="Hourly Rate">
        <div className="text-xl font-bold text-brand">$5.00 / hr</div>
      </Card>
      <Card title="Motorcycle" subtitle="Hourly Rate">
        <div className="text-xl font-bold text-brand">$2.00 / hr</div>
      </Card>
    </div>
  </div>
);

export const AdminReportsPage = () => (
  <div className="space-y-6 font-mono">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Operational Reports</h1>
      <p className="text-xs text-text-muted mt-1">Occupancy metrics and clearly labelled Demo Revenue.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Occupancy Analysis" subtitle="Daily utilization rate">
        <div className="text-xs text-text-muted space-y-2">
          <p>Peak Hours: 09:00 - 11:30 &amp; 16:30 - 19:00</p>
          <p>Average Daily Utilization: 81.4%</p>
        </div>
      </Card>
      <Card title="Demo Revenue Summary" subtitle="Simulated totals only">
        <div className="text-xs text-text-muted space-y-2">
          <div className="text-lg font-bold text-brand">$3,420.00 Demo Total</div>
          <p className="text-amber-500">Notice: No real financial transactions exist.</p>
        </div>
      </Card>
    </div>
  </div>
);
