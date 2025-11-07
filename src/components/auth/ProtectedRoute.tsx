import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

// Helper to normalize role strings for comparison
const normalize = (role?: string) => role?.trim().toLowerCase() ?? "";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = "/login" 
}) => {
  const { user } = useAuthStore();
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  // If allowedRoles specified, check user role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = normalize(user.role);
    const normalizedAllowedRoles = allowedRoles.map(role => normalize(role));
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;