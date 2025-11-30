/**
 * Main App Component
 * Root component with routing and layout
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudioPage from './pages/StudioPage';
import ProjectsPage from './pages/ProjectsPage';

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Public Route Component (redirects if authenticated)
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Layout Component
 */
const Layout = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Layout showNavbar={false}>
                <LoginPage />
              </Layout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Layout showNavbar={false}>
                <RegisterPage />
              </Layout>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <StudioPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/:projectId"
          element={
            <ProtectedRoute>
              <Layout showNavbar={false}>
                <StudioPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                  <a href="/" className="btn-primary mt-6 inline-block">
                    Go Home
                  </a>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
