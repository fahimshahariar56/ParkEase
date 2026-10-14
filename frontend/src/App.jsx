import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ConstellationGrid } from './components/ui/constellation-grid';
import { RouteTransition } from './components/ui/RouteTransition';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FindParkingPage } from './pages/FindParkingPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { ReservationsPage } from './pages/ReservationsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import {
  AdminLotsPage,
  AdminSlotsPage,
  AdminReservationsPage,
  AdminSessionsPage,
  AdminPaymentsPage,
  AdminCustomersPage,
  AdminPricingPage,
  AdminReportsPage,
} from './pages/AdminSubPages';

function AppRoutes() {
  const location = useLocation();
  const { pathname } = location;
  const isLandingPage = pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/admin/login'].includes(pathname);
  const density = isLandingPage ? 0.9 : isAdminPage ? 0.42 : isAuthPage ? 0.5 : 0.65;
  const intensity = isLandingPage ? 0.8 : isAdminPage ? 0.32 : isAuthPage ? 0.38 : 0.52;

  return (
    <>
      <ConstellationGrid density={density} intensity={intensity} />
      <div className="relative z-10 min-h-screen">
        <Routes location={location}>
          {/* Public Customer / Landing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dedicated Public Admin Login Route */}
          <Route
            path="/admin/login"
            element={
              <RouteTransition transitionKey={location.pathname}>
                <AdminLoginPage />
              </RouteTransition>
            }
          />

          {/* Protected Customer Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/parking" element={<FindParkingPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="lots" element={<AdminLotsPage />} />
            <Route path="slots" element={<AdminSlotsPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="pricing" element={<AdminPricingPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          {/* 404 / Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
