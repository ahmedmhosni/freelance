import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoadingSkeleton, ConfirmDialog, api, logger } from '../../../shared';
import { MdArrowBack, MdEdit, MdDelete, MdBusiness, MdEmail, MdPhone, MdFolder, MdTask } from 'react-icons/md';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, type: null, itemId: null });

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [clientRes, projectsRes, tasksRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/projects?client_id=${id}`),
        api.get(`/tasks?client_id=${id}`)
      ]);
      
      setClient(clientRes.data);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data.data || []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.data || []);
    } catch (error) {
      logger.error('Error fetching client data:', error);
      toast.error('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${deleteDialog.itemId}`);
      toast.success('Project deleted successfully!');
      setDeleteDialog({ isOpen: false, type: null, itemId: null });
      fetchClientData();
    } catch (error) {
      logger.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete(`/tasks/${deleteDialog.itemId}`);
      toast.success('Task deleted successfully!');
      setDeleteDialog({ isOpen: false, type: null, itemId: null });
      fetchClientData();
    } catch (error) {
      logger.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'var(--status-active)',
      completed: 'var(--status-completed)',
      pending: 'var(--status-pending)',
      'in-progress': 'var(--status-in-progress)',
      'on-hold': 'var(--status-on-hold)'
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: statusColors[status] || 'var(--status-pending)',
        color: '#fff'
      }}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      high: 'var(--priority-high)',
      medium: 'var(--priority-medium)',
      low: 'var(--priority-low)'
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: priorityColors[priority] || 'var(--priority-medium)',
        color: '#fff'
      }}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSkeleton type="detail" count={1} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container">
        <div className="card">
          <p>Client not found</p>
          <button onClick={() => navigate('/app/clients')} className="btn-primary">
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/app/clients')} 
          className="btn-edit"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          <MdArrowBack size={18} />
          Back to Clients
        </button>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdBusiness size={32} style={{ color: 'var(--primary-color)' }} />
                {client.name}
              </h1>
              {client.company && (
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {client.company}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {client.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdEmail size={18} style={{ color: 'var(--primary-color)' }} />
                    <a href={`mailto:${client.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdPhone size={18} style={{ color: 'var(--primary-color)' }} />
                    <a href={`tel:${client.phone}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {client.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-edit" onClick={() => navigate(`/app/clients/edit/${client.id}`)}>
                <MdEdit size={16} /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'overview' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'projects' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'projects' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MdFolder size={18} />
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'tasks' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'tasks' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'tasks' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MdTask size={18} />
            Tasks ({tasks.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--card-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Projects</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--primary-color)' }}>{projects.length}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--card-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Tasks</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--primary-color)' }}>{tasks.length}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--card-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Active Projects</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--status-active)' }}>
                  {projects.filter(p => p.status === 'active').length}
                </div>
              </div>
            </div>
            
            {client.notes && (
              <div>
                <h3 style={{ marginBottom: '12px' }}>Notes</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MdFolder /></div>
                <p>No projects for this client yet.</p>
                <button className="btn-primary" onClick={() => navigate('/projects')}>
                  Create Project
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projects.map(project => (
                  <div 
                    key={project.id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 
                          style={{ 
                            marginBottom: '4px', 
                            color: 'var(--primary-color)',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/app/projects`)}
                        >
                          {project.name}
                        </h4>
                        {project.description && (
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            {project.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/projects`);
                          }}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ isOpen: true, type: 'project', itemId: project.id });
                          }}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MdTask /></div>
                <p>No tasks for this client yet.</p>
                <button className="btn-primary" onClick={() => navigate('/tasks')}>
                  Create Task
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 
                          style={{ 
                            marginBottom: '4px',
                            color: 'var(--primary-color)',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/tasks`)}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {task.project_name && (
                            <span style={{ 
                              fontSize: '12px', 
                              color: 'var(--text-secondary)',
                              padding: '4px 8px',
                              background: 'var(--card-bg-secondary)',
                              borderRadius: '4px'
                            }}>
                              <MdFolder size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                              {task.project_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks`);
                          }}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ isOpen: true, type: 'task', itemId: task.id });
                          }}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete ${deleteDialog.type === 'project' ? 'Project' : 'Task'}`}
        message={`Are you sure you want to delete this ${deleteDialog.type}? This action cannot be undone.`}
        onConfirm={deleteDialog.type === 'project' ? handleDeleteProject : handleDeleteTask}
        onCancel={() => setDeleteDialog({ isOpen: false, type: null, itemId: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ClientDetail;
