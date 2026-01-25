import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
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
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allowed → render page
  return children;
};

export default ProtectedRoute;
