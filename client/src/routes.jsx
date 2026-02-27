import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Import critical components directly for faster loading
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';

// Lazy load only heavy components
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Clubs = lazy(() => import('./pages/Clubs'));
const ClubDetails = lazy(() => import('./components/clubs/ClubDetailsPage'));
const Chapters = lazy(() => import('./pages/Chapters'));
const ChapterDetail = lazy(() => import('./pages/ChapterDetail'));
const ChapterJoinRequests = lazy(() => import('./pages/ChapterJoinRequests'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
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
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/club-admin/login" element={<ClubAdminLoginForm />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/club-admin/dashboard" element={<ClubAdminDashboard />} />
      </Route>

      {/* Public Routes with Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Home />} />
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
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/chapters/:id" element={<ChapterDetail />} />
        <Route path="/chapters/:id/requests" element={<ProtectedRoute><ChapterJoinRequests /></ProtectedRoute>} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>
);

export default RouterConfig;
