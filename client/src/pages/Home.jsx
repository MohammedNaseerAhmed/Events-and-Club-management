import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/layout/Hero';

export default function Home() {
  const { isAuthenticated, status } = useAuth();
  if (status === 'loading') return null;
  if (isAuthenticated) return <Navigate to="/feed" replace />;
  return <Hero />;
}
