import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog, LoadingSkeleton, logger, Pagination } from '../../../shared';
import { MdFolder } from 'react-icons/md';
import { fetchProjects, createProject, updateProject, deleteProject } from '../services/projectApi';
import { fetchClients } from '../../clients/services/clientApi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, projectId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [formData, setFormData] = useState({
    title: '', description: '', client_id: '', status: 'active', deadline: ''
  });

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetchProjects();
      // Handle response structure: { success: true, data: actualData }
      const data = response.data.data || response.data || response;
      const projectsArray = Array.isArray(data) ? data : [];
      
      logger.info('Loaded projects:', projectsArray.length > 0 ? projectsArray[0] : 'No projects');
      
      setProjects(projectsArray);
    } catch (error) {
      logger.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetchClients();
      // Handle response structure: { success: true, data: actualData }
      const data = response.data.data || response.data || response;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform formData to match backend expectations
      const projectData = {
        name: formData.title,
        description: formData.description || '',
        status: formData.status
      };
      
      // Only include client_id if it has a value
      if (formData.client_id) {
        projectData.client_id = parseInt(formData.client_id);
      }
      
      // Only include dates if they have values
      if (formData.deadline) {
        projectData.end_date = formData.deadline;
      }
      
      if (formData.start_date) {
        projectData.start_date = formData.start_date;
      }
      
      logger.info('Submitting project data:', projectData);
      
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await createProject(projectData);
        toast.success('Project created successfully!');
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', client_id: '', status: 'active', deadline: '' });
      loadProjects();
    } catch (error) {
      logger.error('Error saving project:', error);
      if (error.response?.data) {
        logger.error('Backend error details:', error.response.data);
        toast.error(error.response.data.message || 'Failed to save project');
      } else {
        toast.error('Failed to save project');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    
    // Map invalid status values to valid ones
    const validStatuses = ['active', 'completed', 'on-hold', 'cancelled'];
    let status = project.status;
    if (!validStatuses.includes(status)) {
      // Map common invalid statuses
      if (status === 'in_progress' || status === 'in-progress') {
        status = 'active';
      } else {
        status = 'active'; // Default fallback
      }
      logger.warn(`Invalid status "${project.status}" mapped to "${status}"`);
    }
    
    // Format dates for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (e) {
        logger.error('Error formatting date:', e);
        return '';
      }
    };
    
    // Map backend fields to frontend form fields
    // Backend DTO uses camelCase, so check both formats
    const clientId = project.clientId || project.client_id || null;
    const endDate = project.endDate || project.end_date;
    const startDate = project.startDate || project.start_date;
    
    setFormData({
      title: project.name,
      description: project.description || '',
      client_id: clientId,
      status: status,
      deadline: formatDateForInput(endDate),
      start_date: formatDateForInput(startDate)
    });
    
    logger.info('Editing project:', {
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      client_id: project.client_id,
      endDate: project.endDate,
      end_date: project.end_date,
      resolved_client_id: clientId,
      resolved_end_date: endDate,
      formatted_deadline: formatDateForInput(endDate)
    });
    
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, projectId: id });
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteDialog.projectId);
      toast.success('Project deleted successfully!');
      setDeleteDialog({ isOpen: false, projectId: null });
      loadProjects();
    } catch (error) {
      logger.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const statusColors = {
    active: '#007bff', completed: '#28a745', 'on-hold': '#ffc107', cancelled: '#dc3545'
  };

  return (
    <div className="container">
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        gap: window.innerWidth <= 768 ? '16px' : '0'
      }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Projects</h1>
          <p className="page-subtitle">
            Track and manage your projects
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(true)}
          style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
        >
          Add Project
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}>
          <h3>{editingProject ? 'Edit Project' : 'New Project'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Project Title <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input 
                placeholder="Enter project title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Description
              </label>
              <textarea 
                placeholder="Enter project description" 
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                style={{ minHeight: '80px' }} 
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Client
              </label>
              <select 
                value={formData.client_id || ''} 
                onChange={(e) => setFormData({...formData, client_id: e.target.value ? parseInt(e.target.value) : null})}
              >
                <option value="">Select Client (Optional)</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Status
              </label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Start Date
              </label>
              <input 
                type="date" 
                value={formData.start_date || ''} 
                onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Deadline
              </label>
              <input 
                type="date" 
                value={formData.deadline || ''} 
                onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
                {editingProject ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); setFormData({ title: '', description: '', client_id: '', status: 'active', deadline: '', start_date: '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><MdFolder /></div>
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 
              ? '1fr' 
              : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(project => (
            <div key={project.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, flex: 1, fontSize: '16px' }}>{project.name}</h3>
                <span className={`status-badge status-${project.status}`} style={{ marginLeft: '10px' }}>
                  {project.status}
                </span>
              </div>
              <p style={{ color: 'rgba(55, 53, 47, 0.65)', marginBottom: '15px', minHeight: '40px', fontSize: '14px' }}>{project.description || 'No description'}</p>
              {(project.clientName || project.client_name) && (
                <p style={{ fontSize: '13px', color: 'var(--primary-color)', marginBottom: '8px', fontWeight: '500' }}>
                  Client: {project.clientName || project.client_name}
                </p>
              )}
              {(project.endDate || project.end_date) && (
                <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginBottom: '15px' }}>
                  Deadline: {new Date(project.endDate || project.end_date).toLocaleDateString()}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button 
                  onClick={() => handleEdit(project)}
                  className="btn-edit"
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => confirmDelete(project.id)}
                  className="btn-delete"
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
            </div>
            ))}
          </div>

          {Math.ceil(projects.length / itemsPerPage) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(projects.length / itemsPerPage)}
              totalItems={projects.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will also delete all associated tasks."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, projectId: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Projects;
