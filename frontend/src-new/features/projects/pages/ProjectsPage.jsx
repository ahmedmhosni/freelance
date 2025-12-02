/**
 * Projects Page
 */

import { useProjects } from '../hooks/useProjects';
import { LoadingSpinner, ErrorMessage } from '../../../shared/components';

const ProjectsPage = () => {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button>Add Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p>Client: {project.client_name}</p>
              <span className={`status-badge status-${project.status}`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
