import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    role: null,
    isProfileComplete: false,
    isApproved: false,
  });
  
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          
          // 🔥 CRITICAL CHANGE: Use /auth/status/ instead of /supervisor/status/
          // This ensures the backend checks the Admin collection too.
          const response = await fetch(`http://localhost:3000/auth/status/${user.uid}`, {
            headers: { 
              'Authorization': `Bearer ${token}` 
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUserState({
              isAuthenticated: true,
              role: data.role, // Will now correctly return "admin" or "supervisor"
              isProfileComplete: !!data.region, 
              isApproved: data.isApproved === true,
            });
          } else {
            // Handle if user is in Firebase but not MongoDB yet
            setUserState({ 
              isAuthenticated: true, 
              role: null, 
              isProfileComplete: false, 
              isApproved: false 
            });
          }
        } catch (error) {
          console.error("Error syncing with MongoDB:", error);
          setUserState({ isAuthenticated: false });
        }
      } else {
        setUserState({ isAuthenticated: false });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verifying Authorization...</span>
        </div>
      </div>
    );
  }

  // 1️⃣ GATE 1: Authentication
  if (!userState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2️⃣ GATE 2: Role Verification
  // If the page requires "admin" and userState.role is "supervisor", they get kicked to home.
  if (allowedRole && userState.role !== allowedRole) {
    return <Navigate to="/home" replace />;
  }

  // 3️⃣ GATE 3: Lifecycle Checks (Specific to Supervisors)
  if (userState.role === "supervisor") {
    if (!userState.isProfileComplete && location.pathname !== "/complete-profile") {
      return <Navigate to="/complete-profile" replace />;
    }

    if (userState.isProfileComplete && !userState.isApproved && location.pathname !== "/pending-approval") {
      return <Navigate to="/pending-approval" replace />;
    }

    const restrictedPages = ["/complete-profile", "/pending-approval"];
    if (userState.isApproved && restrictedPages.includes(location.pathname)) {
      return <Navigate to="/supervisor/dashboard" replace />;
    }
  }

  // ✅ ALL GATES PASSED (Admins pass through here to /admin/approval)
  return children;
};

export default ProtectedRoute;