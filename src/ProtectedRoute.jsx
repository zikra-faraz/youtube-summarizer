import React from "react";
import { useAuthenticationStatus } from "@nhost/react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  // console.log(isAuthenticated);
  if (isLoading) {
    return <div>Loading...</div>; // Optional: Show a loader while checking auth status
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
