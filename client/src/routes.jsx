import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load pages/components
const Hero = lazy(() => import('./components/layout/Hero'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Clubs = lazy(() => import('./pages/Clubs'));
const ClubDetails = lazy(() => import('./components/clubs/ClubDetailsPage'));
const StudentLoginForm = lazy(() => import('./components/auth/StudentLoginForm'));
const AdminLoginForm = lazy(() => import('./components/auth/AdminLoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouterConfig = () => (
  <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<StudentLoginForm />} />
      <Route path="/admin/login" element={<AdminLoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Public Routes with Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Hero />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);

export default RouterConfig;
