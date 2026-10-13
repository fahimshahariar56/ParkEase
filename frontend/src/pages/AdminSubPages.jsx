import React from 'react';
import { Card, Badge, Button, Input } from '../components/ui';
import { Plus, Building2, Grid3X3, CalendarCheck, ArrowRightLeft, Users, DollarSign, BarChart3 } from 'lucide-react';

export { AdminLotsPage } from './AdminLotsPage';
export { AdminSlotsPage } from './AdminSlotsPage';
export { AdminReservationsPage } from './AdminReservationsPage';
export { AdminSessionsPage } from './AdminSessionsPage';
export { AdminPaymentsPage } from './AdminPaymentsPage';
export { AdminPricingPage } from './AdminPricingPage';
export { AdminReportsPage } from './AdminReportsPage';

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
