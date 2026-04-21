import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * A component to protect routes based on authentication status and user roles.
 * @param {object} props
 * @param {React.ReactNode} props.children The component to render if the user is authorized.
 * @param {string} [props.role] The required role to access the route (e.g., 'admin').
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    // Show a loading spinner or a blank page while checking auth status
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if the user has that role (case-insensitive)
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    // Redirect them to a "not authorized" page or the home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
