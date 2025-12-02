/**
 * Projects Feature Module
 */

// Pages
export { default as ProjectsPage } from './pages/ProjectsPage';
export { default as ProjectDetailPage } from './pages/ProjectDetailPage';

// Components
export { default as ProjectList } from './components/ProjectList';
export { default as ProjectCard } from './components/ProjectCard';
export { default as ProjectForm } from './components/ProjectForm';
export { default as ProjectStatusBadge } from './components/ProjectStatusBadge';

// Hooks
export { useProjects } from './hooks/useProjects';
export { useProject } from './hooks/useProject';

// Services
export * from './services/projects.service';
