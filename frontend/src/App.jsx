import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/responsive-fixes.css';

// Shared imports (not lazy loaded - needed immediately)
import { 
  AuthProvider, 
  useAuth,
  ThemeProvider,
  SocketProvider,
  MaintenanceProvider,
  ErrorBoundary,
  FullPageLoader,
  PageTransition,
  Layout
} from './shared';

// Lazy load feature modules
const Home = lazy(() => import('./features/home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./features/auth').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./features/auth').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('./features/auth').then(m => ({ default: m.VerifyEmail })));
const ResendVerification = lazy(() => import('./features/auth').then(m => ({ default: m.ResendVerification })));
const ForgotPassword = lazy(() => import('./features/auth').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./features/auth').then(m => ({ default: m.ResetPassword })));
const PublicStatus = lazy(() => import('./features/status').then(m => ({ default: m.PublicStatus })));
const AdminStatus = lazy(() => import('./features/status').then(m => ({ default: m.Status })));
const Dashboard = lazy(() => import('./features/dashboard').then(m => ({ default: m.Dashboard })));
const Clients = lazy(() => import('./features/clients').then(m => ({ default: m.Clients })));
const ClientDetail = lazy(() => import('./features/clients').then(m => ({ default: m.ClientDetail })));
const Projects = lazy(() => import('./features/projects').then(m => ({ default: m.Projects })));
const Tasks = lazy(() => import('./features/tasks').then(m => ({ default: m.Tasks })));
const Invoices = lazy(() => import('./features/invoices').then(m => ({ default: m.Invoices })));
const Reports = lazy(() => import('./features/reports').then(m => ({ default: m.Reports })));
const TimeTracking = lazy(() => import('./features/time-tracking').then(m => ({ default: m.TimeTracking })));
const AdminPanel = lazy(() => import('./features/admin').then(m => ({ default: m.AdminPanel })));
const AdminGDPR = lazy(() => import('./features/admin').then(m => ({ default: m.AdminGDPR })));
const Profile = lazy(() => import('./features/profile').then(m => ({ default: m.Profile })));
const PublicProfile = lazy(() => import('./features/profile').then(m => ({ default: m.PublicProfile })));
const Terms = lazy(() => import('./features/legal').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./features/legal').then(m => ({ default: m.Privacy })));
const RefundPolicy = lazy(() => import('./features/legal').then(m => ({ default: m.RefundPolicy })));
const Contact = lazy(() => import('./features/legal').then(m => ({ default: m.Contact })));
const Changelog = lazy(() => import('./features/changelog').then(m => ({ default: m.Changelog })));
const Announcements = lazy(() => import('./features/announcements').then(m => ({ default: m.Announcements })));
const AnnouncementDetail = lazy(() => import('./features/announcements').then(m => ({ default: m.AnnouncementDetail })));

// Utility pages (moved to shared)
import ComingSoon from './shared/pages/ComingSoon';
import LoaderTest from './shared/pages/LoaderTest';

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
            <Suspense fallback={<FullPageLoader text="Loading..." />}>
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
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/announcements/:id" element={<AnnouncementDetail />} />
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
            </Suspense>
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
