/**
 * Main App Component
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth';

// Layouts
import MainLayout from './shared/layouts/MainLayout';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage } from './features/auth';

// Feature Pages
import { ClientsPage } from './features/clients';
import { ProjectsPage } from './features/projects';

// Shared Components
import { LoadingSpinner } from './shared/components';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<div>Dashboard</div>} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<div>Tasks</div>} />
          <Route path="invoices" element={<div>Invoices</div>} />
          <Route path="reports" element={<div>Reports</div>} />
          <Route path="profile" element={<div>Profile</div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
