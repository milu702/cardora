import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Protected Route for Dashboard & Sub-pages
const ProtectedDashboard = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Navigate to="/auth?mode=login" replace />;
};

// Auth Route Redirector (if already logged in, go to dashboard)
const AuthRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />;
};

const MainContent = () => {
  const { toastMessage } = useAuth();

  return (
    <div className="relative">
      {/* Global Brand Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-full bg-[#1F5E3B] text-white font-extrabold text-xs shadow-2xl border border-[#5C8D4E] animate-bounce flex items-center gap-2">
          <span>🌿</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Authentication Routes */}
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/login" element={<AuthRoute />} />
        <Route path="/signup" element={<AuthRoute />} />
        <Route path="/forgot-password" element={<AuthRoute />} />

        {/* Main Application Dashboard & Sub-page routes */}
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/plantation" element={<ProtectedDashboard />} />
        <Route path="/recommendations" element={<ProtectedDashboard />} />
        <Route path="/community" element={<ProtectedDashboard />} />
        <Route path="/marketplace" element={<ProtectedDashboard />} />
        <Route path="/profile" element={<ProtectedDashboard />} />

        {/* 404 Page Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </Router>
  );
}

export default App;