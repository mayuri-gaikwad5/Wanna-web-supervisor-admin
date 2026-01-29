import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import Header from './pages/header/Header.jsx';

// Auth
import Signup from './pages/auth/signup/Signup.jsx';
import Login from './pages/auth/login/Login.jsx';
import LogoutPage from './pages/auth/logout/logout.jsx';

// Pages
import Home from './pages/Home/Home.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Currentstatus from './pages/Currentstatus/CurrentStatusf.jsx';
import History from './pages/History/Historyf.jsx';
import AdminLogs from './pages/admin/AdminLogs.jsx';

// Supervisor & Admin
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard.jsx';
import AdminApproval from './pages/admin/AdminApproval.jsx';

// NEW: Lifecycle Pages for Supervisors
import CompleteProfile from './pages/supervisor/CompleteProfile.jsx'; 
import PendingApproval from './pages/supervisor/PendingApproval.jsx'; 

// Route Guard
import ProtectedRoute from './pages/components/ProtectedRoute.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* --- Supervisor Lifecycle Routes --- */}
        {/* These routes are accessed via ProtectedRoute but don't require "isApproved" yet */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <CompleteProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <PendingApproval />
            </ProtectedRoute>
          }
        />

        {/* --- Fully Protected Supervisor Routes --- */}
        {/* ProtectedRoute will now check if profile is complete AND approved */}
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supervisor/history"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <History />
            </ProtectedRoute>
          }
        />

        {/* --- Admin Routes --- */}
        <Route
          path="/admin/approval"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLogs />
            </ProtectedRoute>
          }
        />

        {/* --- Shared / User Routes --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/currentstatus"
          element={
            <ProtectedRoute>
              <Currentstatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <LogoutPage />
            </ProtectedRoute>
          }
        />

        {/* --- Fallbacks --- */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </>
  );
}

export default App;