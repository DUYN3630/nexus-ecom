import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';

/**
 * A component to protect routes based on authentication status and user roles.
 * @param {object} props
 * @param {React.ReactNode} props.children The component to render if the user is authorized.
 * @param {string} [props.role] The required role to access the route (e.g., 'admin').
 */
const ProtectedRoute = ({ children, role }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  // The Redux store is initialized synchronously from localStorage, 
  // so a dedicated 'isAuthLoading' state is no longer necessary.
  // The first render will have the correct `isAuthenticated` value.

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if the user has that role (case-insensitive)
  if (role) {
    const userRole = user?.role?.toLowerCase();
    const requiredRole = role.toLowerCase();

    // Special logic for admin routes: allow both Admin and Expert
    if (requiredRole === 'admin') {
      if (userRole !== 'admin' && userRole !== 'expert') {
        return <Navigate to="/" replace />;
      }
    } else if (userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
