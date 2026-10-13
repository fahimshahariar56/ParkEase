import React from 'react';
import {
  TrendingUp,
  Car,
  CalendarCheck,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';

export const AdminDashboard = () => {
  const metrics = [
    { title: 'Total Lots / Slots', value: '4 / 120', change: '+2 new lots', icon: Car },
    { title: 'Occupancy Rate', value: '78.3%', change: 'Normal load', icon: TrendingUp },
    { title: 'Active Reservations', value: '34', change: '8 arriving soon', icon: CalendarCheck },
    { title: 'Demo Revenue (Today)', value: '$524.00', change: 'Simulated total', icon: DollarSign },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-card bg-surface-raised border border-brand/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-brand">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">Operational Status: All 4 Parking Facilities Active & Operational</span>
        </div>
        <Badge variant="brand">LIVE MONITOR</Badge>
      </div>

      {/* Metrics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} variant="raised">
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-medium">{m.title}</span>
                <Icon className="w-4 h-4 text-brand" />
              </div>
              <div className="text-2xl font-bold text-text tracking-tight">{m.value}</div>
              <div className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
                <span className="text-brand">●</span>
                <span>{m.change}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Parking Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Live Entry & Exit Feed" subtitle="Real-time session updates">
          <div className="space-y-3 text-xs">
            {[
              { time: '15:20', plate: 'DHK-METRO-GA-1122', action: 'Entry Recorded', slot: 'A-102', status: 'available' },
              { time: '15:08', plate: 'DHK-METRO-HA-8877', action: 'Exit Completed', slot: 'B-205', status: 'occupied' },
              { time: '14:45', plate: 'DHK-METRO-KA-4411', action: 'Entry Recorded', slot: 'C-301', status: 'available' },
            ].map((feed, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-input bg-surface-raised border border-border/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-text">{feed.plate}</div>
                  <div className="text-text-muted text-[11px]">{feed.action} • Slot {feed.slot}</div>
                </div>
                <span className="text-text-muted text-[11px]">{feed.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Simulated Financial Overview" subtitle="Notice: Demo revenue calculation only">
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-input bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Payments are simulated for demonstration only. No real banking credentials or gateways are active.</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Total Demo Transactions:</span>
                <span className="font-bold">142</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Average Parking Duration:</span>
                <span className="font-bold">2.4 hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Peak Occupancy Slot:</span>
                <span className="font-bold">Slot #A-102</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
