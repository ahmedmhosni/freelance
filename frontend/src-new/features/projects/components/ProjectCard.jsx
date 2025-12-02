/**
 * Project Card Component
 */

const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <span className={`status-badge status-${project.status}`}>
          {project.status}
        </span>
      </div>
      
      <div className="project-card-body">
        <p>{project.description}</p>
        {project.client_name && (
          <p><strong>Client:</strong> {project.client_name}</p>
        )}
        {project.budget && (
          <p><strong>Budget:</strong> ${project.budget}</p>
        )}
      </div>
      
      <div className="project-card-actions">
        <button onClick={() => onEdit(project)}>Edit</button>
        <button onClick={() => onDelete(project.id)} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
