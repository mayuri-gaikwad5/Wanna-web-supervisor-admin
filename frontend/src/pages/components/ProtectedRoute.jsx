import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isApproved = localStorage.getItem("isApproved");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not approved
  if (isApproved !== "true") {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allowed → render page
  return children;
};

export default ProtectedRoute;
