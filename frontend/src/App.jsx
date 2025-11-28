import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import ErrorBoundary from './components/ErrorBoundary';
import FullPageLoader from './components/FullPageLoader';
import PageTransition from './components/PageTransition';
import './styles/responsive-fixes.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicStatus from './pages/PublicStatus';
import AdminStatus from './pages/Status';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import TimeTracking from './pages/TimeTracking';
import AdminPanel from './pages/AdminPanel';
import AdminGDPR from './pages/AdminGDPR';
import LoaderTest from './pages/LoaderTest';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Changelog from './pages/Changelog';
import Layout from './components/Layout';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullPageLoader text="" />;
  }
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/app/dashboard" />;
  
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <MaintenanceProvider>
              <PageTransition>
                <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#28a745',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#dc3545',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/public-status" element={<PublicStatus />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              
              {/* Protected Routes */}
              <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/app/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="projects" element={<Projects />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="reports" element={<Reports />} />
                <Route path="time-tracking" element={<TimeTracking />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
                <Route path="admin/status" element={<PrivateRoute adminOnly><AdminStatus /></PrivateRoute>} />
                <Route path="admin/gdpr" element={<PrivateRoute adminOnly><AdminGDPR /></PrivateRoute>} />
                <Route path="loader-test" element={<PrivateRoute adminOnly><LoaderTest /></PrivateRoute>} />
              </Route>
              
              {/* Legacy redirects for backward compatibility */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/status" element={<Navigate to="/public-status" replace />} />
              <Route path="/admin/status" element={<Navigate to="/app/admin/status" replace />} />
            </Routes>
              </PageTransition>
            </MaintenanceProvider>
          </BrowserRouter>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
