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

// Supervisor & Admin
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard.jsx';
import AdminApproval from './pages/admin/AdminApproval.jsx';

// Route Guard
import ProtectedRoute from './pages/components/ProtectedRoute.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* Admin Routes */}
        <Route
          path="/admin/approval"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApproval />
            </ProtectedRoute>
          }
        />

        {/* Supervisor Routes */}
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Protected Routes */}
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
          path="/history"
          element={
            <ProtectedRoute>
              <History />
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

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </>
  );
}

export default App;
