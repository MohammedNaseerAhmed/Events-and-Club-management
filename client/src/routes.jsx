import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Import critical components directly for faster loading
import Hero from './components/layout/Hero';
import StudentLoginForm from './components/auth/StudentLoginForm';
import RegisterForm from './components/auth/RegisterForm';
import NotFound from './pages/NotFound';

// Lazy load only heavy components
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Clubs = lazy(() => import('./pages/Clubs'));
const ClubDetails = lazy(() => import('./components/clubs/ClubDetailsPage'));
const AdminLoginForm = lazy(() => import('./components/auth/AdminLoginForm'));
const ClubAdminLoginForm = lazy(() => import('./components/auth/ClubAdminLoginForm'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClubAdminDashboard = lazy(() => import('./pages/ClubAdminDashboard'));
const Feed = lazy(() => import('./pages/Feed'));
const NetworkInvitations = lazy(() => import('./pages/NetworkInvitations'));
const Chats = lazy(() => import('./pages/Chats'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Documents = lazy(() => import('./pages/Documents'));
const Courses = lazy(() => import('./pages/Courses'));
const SettingsSection = lazy(() => import('./pages/SettingsSection'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

// Enhanced loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
      <p className="text-gray-500 text-sm mt-2">Please wait while we load the page</p>
    </div>
  </div>
);

const RouterConfig = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<StudentLoginForm />} />
      <Route path="/admin/login" element={<AdminLoginForm />} />
      <Route path="/club-admin/login" element={<ClubAdminLoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      
      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/club-admin/dashboard" element={<ClubAdminDashboard />} />
      </Route>

      {/* Public Routes with Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Hero />} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/network/invitations" element={<ProtectedRoute><NetworkInvitations /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/settings/:section" element={<ProtectedRoute><SettingsSection /></ProtectedRoute>} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);

export default RouterConfig;
