import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

// Protected Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import ViolationSearchPage from './pages/Violations/ViolationSearchPage';
import ViolationDetailsPage from './pages/Violations/ViolationDetailsPage';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentHistoryPage from './pages/Payment/PaymentHistoryPage';
import ProfilePage from './pages/Profile/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminViolationsPage from './pages/Admin/AdminViolationsPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminReportsPage from './pages/Admin/AdminReportsPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';

// Loading and Error Components
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Inner component that uses useLocation (must be inside Router)
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      
      <div className="flex">
        {user && <Sidebar />}
        
        <main className={`flex-1 ${isLandingPage ? '' : 'mx-5'}`}>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/violations/search" element={
                <ProtectedRoute>
                  <ViolationSearchPage />
                </ProtectedRoute>
              } />
              
              <Route path="/violations/:id" element={
                <ProtectedRoute>
                  <ViolationDetailsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/payment/:violationId" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              
              <Route path="/payment/success/:paymentId" element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/violations" element={
                <ProtectedRoute adminOnly>
                  <AdminViolationsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/reports" element={
                <ProtectedRoute adminOnly>
                  <AdminReportsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute adminOnly>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  // * Determine basename based on environment
  // * Use basename only when deployed to GitHub Pages, not on localhost
  const getBasename = () => {
    // * Check if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '';
    }
    // * Check if deployed to GitHub Pages (vengeth.github.io domain)
    if (window.location.hostname.includes('github.io')) {
      return '/Traffic-Management-System';
    }
    // * Default: no basename for other deployments
    return '';
  };

  return (
    <Router basename={getBasename()}>
      <AppLayout />
    </Router>
  );
};

// Root App Component with Providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaymentProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </PaymentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;



