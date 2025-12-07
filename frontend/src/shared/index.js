// Shared module exports

// Components
export { default as ErrorBoundary } from './components/ErrorBoundary';
export { default as FullPageLoader } from './components/FullPageLoader';
export { default as LoadingSkeleton } from './components/LoadingSkeleton';
export { default as LogoLoader } from './components/LogoLoader';
export { default as PageTransition } from './components/PageTransition';
export { default as Pagination } from './components/Pagination';
export { default as ConfirmDialog } from './components/ConfirmDialog';
export { default as SEO } from './components/SEO';
export { default as AppFooter } from './components/AppFooter';
export { default as PublicHeader } from './components/PublicHeader';
export { default as PublicFooter } from './components/PublicFooter';
export { default as NotificationBell } from './components/NotificationBell';
export { default as MaintenanceBanner } from './components/MaintenanceBanner';
export { default as MobileBlocker } from './components/MobileBlocker';
export { default as FeedbackWidget } from './components/FeedbackWidget';
export { default as LoaderExamples } from './components/LoaderExamples';
export { default as SecurityNotice } from './components/SecurityNotice';
export { default as SecurityInfo } from './components/SecurityInfo';

// Layouts
export { default as Layout } from './layouts/Layout';

// Pages
export { default as NotFound } from './pages/NotFound';
export { default as ServerError } from './pages/ServerError';

// Context
export { AuthProvider, useAuth } from './context/AuthContext';
export { ThemeProvider, useTheme } from './context/ThemeContext';
export { SocketProvider, useSocket } from './context/SocketContext';
export { MaintenanceProvider, useMaintenanceMode } from './context/MaintenanceContext';

// Utils
export { default as api } from './utils/api';
export { default as logger } from './utils/logger';
export * from './utils/exportCSV';
export * from './utils/favicon';
export * from './utils/invoiceGenerator';
export * from './utils/passwordValidator';
