import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loading from './components/ui/Loading';
import Navbar from './components/layout/Navbar';

// Import pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import LabTests from './pages/patient/LabTests';
import AdminDashboard from './pages/AdminDashboard';
import Doctors from './pages/Doctors';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route path="/doctors" element={<Doctors />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Role-specific Routes */}
      <Route 
        path="/doctor-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user', 'premium']}>
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctor-profile" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/book-appointment" 
        element={
          <ProtectedRoute allowedRoles={['user', 'premium']}>
            <BookAppointment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/lab-tests" 
        element={
          <ProtectedRoute allowedRoles={['user', 'premium']}>
            <LabTests />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Root App Component with AuthProvider
const AppWithAuth = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <AppContent />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppWithAuth />
      </Router>
    </AuthProvider>
  );
};

export default App;
