import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = ['student', 'clubHead', 'admin'];

/**
 * Protects routes for authenticated users. Optionally restrict by role.
 * @param {React.ReactNode} children
 * @param {string[]} [allowedRoles] - If provided, user.role must be in this list.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && Array.isArray(allowedRoles)) {
    const userRole = user?.role && ROLES.includes(user.role) ? user.role : null;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/feed" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
