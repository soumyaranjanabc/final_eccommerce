// client/src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protects routes that require authentication
 * Redirects to /login if user is not logged in
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Optional: show loader while auth state is resolving
  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  // Not logged in → redirect to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged in → allow access
  return children;
};

export default ProtectedRoute;
