import React from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from '../components/ui';

export { AdminLotsPage } from './AdminLotsPage';
export { AdminSlotsPage } from './AdminSlotsPage';
export { AdminReservationsPage } from './AdminReservationsPage';
export { AdminSessionsPage } from './AdminSessionsPage';
export { AdminPaymentsPage } from './AdminPaymentsPage';
export { AdminPricingPage } from './AdminPricingPage';
export { AdminReportsPage } from './AdminReportsPage';

export const AdminCustomersPage = () => (
  <div className="space-y-6 font-sans">
    <div className="park-page-heading">
      <h1 className="park-page-title">Registered Customers</h1>
      <p className="park-page-description">
        Customer directory is not connected to a list endpoint in the current frontend.
      </p>
    </div>
    <EmptyState
      icon={Users}
      title="Customer records are unavailable"
      description="No customer list is shown here because this page is not connected to a customer-directory API."
    />
  </div>
);
