"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>; // Or a more sophisticated loading spinner
  }

  if (!user) {
    // User is not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;