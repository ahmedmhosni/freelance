import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket, ConfirmDialog, logger } from '../../../shared';
import Calendar from 'react-calendar';
import TaskCalendar from '../components/TaskCalendar';
import TaskViewModal from '../components/TaskViewModal';
import 'react-calendar/dist/Calendar.css';
import { MdViewKanban, MdViewList, MdCalendarToday } from 'react-icons/md';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskApi';
import { fetchProjects } from '../../projects/services/projectApi';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, taskId: null });
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'todo', due_date: '', project_id: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetchProjects();
      const data = response.data || response;
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('task_created', (task) => {
        setTasks(prev => [...prev, task]);
      });

      socket.on('task_updated', (task) => {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      });

      socket.on('task_deleted', ({ id }) => {
        setTasks(prev => prev.filter(t => t.id !== id));
      });

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
      };
    }
  }, [socket]);

  const loadTasks = async () => {
    try {
      const response = await fetchTasks();
      const data = response.data || response;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        toast.success('Task updated successfully!');
      } else {
        await createTask(formData);
        toast.success('Task created successfully!');
      }
      setShowForm(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', project_id: null });
      loadTasks();
    } catch (error) {
      logger.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      ...task,
      description: task.description || '',
      project_id: task.project_id || ''
    });
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ isOpen: true, taskId: id });
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteDialog.taskId);
      toast.success('Task deleted successfully!');
      setDeleteDialog({ isOpen: false, taskId: null });
      loadTasks();
    } catch (error) {
      logger.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await updateTask(taskId, { ...task, status: newStatus });
      loadTasks();
    } catch (error) {
      logger.error('Error updating task:', error);
    }
  };

  const columns = {
    'todo': { title: 'To Do', color: '#6c757d' },
    'in-progress': { title: 'In Progress', color: '#007bff' },
    'review': { title: 'Review', color: '#ffc107' },
    'done': { title: 'Done', color: '#28a745' }
  };

  const priorityColors = {
    low: '#28a745', medium: '#ffc107', high: '#fd7e14', urgent: '#dc3545'
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length > 0) {
        return (
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            <span style={{ background: '#007bff', color: 'white', padding: '2px 4px', borderRadius: '3px' }}>
              {dayTasks.length}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="container">
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Tasks</h1>
          <p className="page-subtitle">
            Organize and track your work
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flex: window.innerWidth <= 768 ? '1 1 100%' : '0 0 auto'
          }}>
            <button 
              onClick={() => setView('kanban')} 
              className={`view-toggle ${view === 'kanban' ? 'active' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                flex: window.innerWidth <= 768 ? '1' : '0 0 auto',
                padding: window.innerWidth <= 768 ? '10px 12px' : '6px 12px'
              }}
            >
              <MdViewKanban size={16} />
              {window.innerWidth > 480 && <span>Kanban</span>}
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`view-toggle ${view === 'list' ? 'active' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                flex: window.innerWidth <= 768 ? '1' : '0 0 auto',
                padding: window.innerWidth <= 768 ? '10px 12px' : '6px 12px'
              }}
            >
              <MdViewList size={16} />
              {window.innerWidth > 480 && <span>List</span>}
            </button>
            <button 
              onClick={() => setView('calendar')} 
              className={`view-toggle ${view === 'calendar' ? 'active' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                flex: window.innerWidth <= 768 ? '1' : '0 0 auto',
                padding: window.innerWidth <= 768 ? '10px 12px' : '6px 12px'
              }}
            >
              <MdCalendarToday size={16} />
              {window.innerWidth > 480 && <span>Calendar</span>}
            </button>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-primary"
            style={{ 
              flex: window.innerWidth <= 768 ? '1 1 100%' : '0 0 auto',
              width: window.innerWidth <= 768 ? '100%' : 'auto'
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', animation: 'slideIn 0.2s ease-out' }}>
          <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Task Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ marginBottom: '10px' }} />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ marginBottom: '10px', minHeight: '60px' }} />
            <select value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} style={{ marginBottom: '10px' }}>
              <option value="">Select Project (Optional)</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name || project.title}</option>
              ))}
            </select>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ marginBottom: '10px' }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ marginBottom: '10px' }}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ marginBottom: '10px' }} />
            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '10px' }}>
                {editingTask ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); setFormData({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', project_id: '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'kanban' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 
            ? '1fr' 
            : window.innerWidth <= 1024 
              ? 'repeat(2, 1fr)' 
              : 'repeat(4, 1fr)', 
          gap: '15px',
          overflowX: window.innerWidth <= 768 ? 'auto' : 'visible'
        }}>
          {Object.entries(columns).map(([status, { title, color }]) => (
            <div 
              key={status} 
              className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(status);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('taskId'));
                updateTaskStatus(taskId, status);
                setDragOverColumn(null);
              }}
            >
              <div className="column-header">
                <h3 className="column-title">{title}</h3>
                <span className="column-count">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              
              <div style={{ minHeight: '350px' }}>
                {tasks.filter(t => t.status === status).length === 0 ? (
                  <div className="kanban-empty">
                    <p>Drop tasks here</p>
                  </div>
                ) : (
                  tasks.filter(t => t.status === status).map(task => (
                    <div 
                      key={task.id} 
                      className="card item-card" 
                      draggable
                      onClick={() => setViewingTask(task)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      style={{ 
                        marginBottom: '10px', 
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <strong style={{ flex: 1, fontSize: '14px' }}>{task.title}</strong>
                        <span className={`status-badge priority-${task.priority}`} style={{ marginLeft: '8px' }}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p style={{ 
                          fontSize: '13px', 
                          color: 'rgba(55, 53, 47, 0.65)', 
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {task.description}
                        </p>
                      )}
                      
                      {task.due_date && (
                        <p style={{ 
                          fontSize: '11px', 
                          color: new Date(task.due_date) < new Date() ? '#eb5757' : 'rgba(55, 53, 47, 0.5)', 
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {new Date(task.due_date).toLocaleDateString()}
                          {new Date(task.due_date) < new Date() && <span style={{ color: '#eb5757', fontWeight: 'bold' }}> • Overdue</span>}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(55, 53, 47, 0.09)' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleEdit(task); 
                          }} 
                          className="btn-edit"
                          style={{ flex: 1, fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            confirmDelete(task.id); 
                          }} 
                          className="btn-delete"
                          style={{ flex: 1, fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="card">
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: window.innerWidth <= 768 ? '700px' : 'auto' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Task</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Priority</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Due Date</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr 
                    key={task.id} 
                    style={{ 
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer'
                    }}
                    onClick={() => setViewingTask(task)}
                  >
                    <td style={{ padding: '12px' }}>
                      <strong>{task.title}</strong>
                      <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)', margin: '4px 0 0 0' }}>{task.description}</p>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge priority-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{columns[task.status]?.title}</td>
                    <td style={{ padding: '12px' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div className="table-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleEdit(task); 
                          }} 
                          className="btn-edit" 
                          style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', padding: window.innerWidth <= 768 ? '6px 8px' : '6px 12px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            confirmDelete(task.id); 
                          }} 
                          className="btn-delete"
                          style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', padding: window.innerWidth <= 768 ? '6px 8px' : '6px 12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <div className="card">
          <TaskCalendar 
            onTaskClick={(task) => {
              setViewingTask(task);
            }}
            onDateSelect={(date) => {
              setFormData({
                ...formData,
                due_date: date.toISOString().split('T')[0]
              });
              setShowForm(true);
            }}
          />
        </div>
      )}

      {viewingTask && (
        <TaskViewModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setEditingTask(viewingTask);
            setFormData(viewingTask);
            setViewingTask(null);
            setShowForm(true);
          }}
          onDelete={() => {
            setViewingTask(null);
            confirmDelete(viewingTask.id);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, taskId: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Tasks;
