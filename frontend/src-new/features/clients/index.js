/**
 * Clients Feature Module
 */

// Pages
export { default as ClientsPage } from './pages/ClientsPage';
export { default as ClientDetailPage } from './pages/ClientDetailPage';

// Components
export { default as ClientList } from './components/ClientList';
export { default as ClientCard } from './components/ClientCard';
export { default as ClientForm } from './components/ClientForm';

// Hooks
export { useClients } from './hooks/useClients';
export { useClient } from './hooks/useClient';

// Services
export * from './services/clients.service';
