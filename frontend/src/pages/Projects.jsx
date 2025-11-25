import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { MdFolder } from 'react-icons/md';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, projectId: null });
  const [formData, setFormData] = useState({
    title: '', description: '', client_id: '', status: 'active', deadline: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/projects');
      const data = response.data.data || response.data;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      const data = response.data.data || response.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform formData to match backend expectations
      const projectData = {
        name: formData.title,
        description: formData.description,
        client_id: formData.client_id || null,
        status: formData.status,
        end_date: formData.deadline || null,
        start_date: formData.start_date || null
      };
      
      if (editingProject) {
        await api.put(`/api/projects/${editingProject.id}`, projectData);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/api/projects', projectData);
        toast.success('Project created successfully!');
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '', client_id: '', status: 'active', deadline: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    // Map backend fields to frontend form fields
    setFormData({
      title: project.name,
      description: project.description,
      client_id: project.client_id,
      status: project.status,
      deadline: project.end_date,
      start_date: project.start_date
    });
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, projectId: id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/projects/${deleteDialog.projectId}`);
      toast.success('Project deleted successfully!');
      setDeleteDialog({ isOpen: false, projectId: null });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
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
            <input 
              placeholder="Project Title *" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              style={{ marginBottom: '10px' }} 
            />
            <textarea 
              placeholder="Description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              style={{ marginBottom: '10px', minHeight: '80px' }} 
            />
            <select 
              value={formData.client_id} 
              onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
              style={{ marginBottom: '10px' }}
            >
              <option value="">Select Client (Optional)</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})} 
              style={{ marginBottom: '10px' }}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input 
              type="date" 
              placeholder="Deadline" 
              value={formData.deadline} 
              onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
              style={{ marginBottom: '10px' }} 
            />
            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
                {editingProject ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); setFormData({ title: '', description: '', client_id: '', status: 'active', deadline: '' }); }}>
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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 
            ? '1fr' 
            : 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {projects.map(project => (
            <div key={project.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, flex: 1, fontSize: '16px' }}>{project.title}</h3>
                <span className={`status-badge status-${project.status}`} style={{ marginLeft: '10px' }}>
                  {project.status}
                </span>
              </div>
              <p style={{ color: 'rgba(55, 53, 47, 0.65)', marginBottom: '15px', minHeight: '40px', fontSize: '14px' }}>{project.description || 'No description'}</p>
              {project.deadline && (
                <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginBottom: '15px' }}>
                  {new Date(project.deadline).toLocaleDateString()}
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
