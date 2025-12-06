import { MdClose, MdEdit, MdDelete, MdAccessTime, MdFlag, MdFolder } from 'react-icons/md';
import { useTheme } from '../../../shared';

const TaskViewModal = ({ task, onClose, onEdit, onDelete }) => {
  const { isDark } = useTheme();

  if (!task) return null;

  const priorityColors = {
    low: '#2eaadc',
    medium: '#ffd426',
    high: '#ffa344',
    urgent: '#eb5757'
  };

  const statusLabels = {
    pending: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'start',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <h2 style={{ margin: 0, flex: 1, fontSize: '24px' }}>{task.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
            }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Status and Priority */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              fontWeight: '500'
            }}>
              STATUS
            </span>
            <span className={`status-badge status-${task.status}`}>
              {statusLabels[task.status] || task.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              fontWeight: '500'
            }}>
              PRIORITY
            </span>
            <span 
              className={`priority-${task.priority}`}
              style={{
                padding: '3px 8px',
                borderRadius: '2px',
                fontSize: '11px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: `${priorityColors[task.priority]}20`,
                color: priorityColors[task.priority]
              }}
            >
              <MdFlag size={12} />
              {task.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '8px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              DESCRIPTION
            </h3>
            <p style={{ 
              margin: 0, 
              lineHeight: '1.6',
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)'
            }}>
              {task.description}
            </p>
          </div>
        )}

        {/* Details */}
        <div style={{ 
          display: 'grid', 
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '4px'
        }}>
          {(task.due_date || task.dueDate) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdAccessTime size={18} style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)' }} />
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  marginBottom: '2px'
                }}>
                  Due Date
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {new Date(task.due_date || task.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          )}

          {(task.project_name || task.projectName) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdFolder size={18} style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)' }} />
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  marginBottom: '2px'
                }}>
                  Project
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {task.project_name || task.projectName}
                </div>
              </div>
            </div>
          )}

          {(task.created_at || task.createdAt) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdAccessTime size={18} style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)' }} />
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  marginBottom: '2px'
                }}>
                  Created
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {new Date(task.created_at || task.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onDelete}
            className="btn-delete"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <MdDelete size={18} />
            <span>Delete</span>
          </button>
          <button
            onClick={onEdit}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <MdEdit size={18} />
            <span>Edit Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;
