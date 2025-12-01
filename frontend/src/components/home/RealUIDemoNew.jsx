import { useState, useEffect } from 'react';
import { MdAccessTime as _MdAccessTime } from 'react-icons/md';

// Real Time Tracking Page Demo (from TimeTracking.jsx)
export const TimeTrackingDemo = ({ isDark }) => {
  const sampleEntries = [
    {
      id: 1,
      date: 'Dec 15, 2024',
      description: 'Client Website Redesign',
      task: 'Homepage Design',
      project: 'Website Redesign',
      client: 'Design Studio Co',
      start: '09:00 AM',
      end: '11:30 AM',
      duration: '2h 30m',
      status: 'completed',
    },
    {
      id: 2,
      date: 'Dec 15, 2024',
      description: 'API Integration',
      task: 'Backend Development',
      project: 'Mobile App',
      client: 'Tech Corp',
      start: '02:00 PM',
      end: '04:45 PM',
      duration: '2h 45m',
      status: 'completed',
    },
    {
      id: 3,
      date: 'Dec 16, 2024',
      description: 'Logo Design Iterations',
      project: 'Brand Identity',
      client: 'Creative Agency',
      start: '10:15 AM',
      end: null,
      duration: '1h 23m',
      status: 'running',
    },
  ];

  return (
    <div
      style={{
        background: isDark ? '#191919' : '#ffffff',
        borderRadius: '6px',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(55, 53, 47, 0.16)',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          padding: '20px',
          borderBottom: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(55, 53, 47, 0.09)',
        }}
      >
        <div
          style={{
            padding: '16px',
            background: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(55, 53, 47, 0.03)',
            borderRadius: '3px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(55, 53, 47, 0.09)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              marginBottom: '8px',
              fontWeight: '600',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            TOTAL HOURS
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '4px',
              color: isDark ? '#fff' : '#37352f',
            }}
          >
            42h 15m
          </div>
          <div
            style={{
              fontSize: '12px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
            }}
          >
            All time tracked
          </div>
        </div>
        <div
          style={{
            padding: '16px',
            background: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(55, 53, 47, 0.03)',
            borderRadius: '3px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(55, 53, 47, 0.09)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              marginBottom: '8px',
              fontWeight: '600',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            TOTAL ENTRIES
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '4px',
              color: isDark ? '#fff' : '#37352f',
            }}
          >
            18
          </div>
          <div
            style={{
              fontSize: '12px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
            }}
          >
            Time sessions
          </div>
        </div>
        <div
          style={{
            padding: '16px',
            background: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(55, 53, 47, 0.03)',
            borderRadius: '3px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(55, 53, 47, 0.09)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              marginBottom: '8px',
              fontWeight: '600',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            STATUS
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '4px',
              color: '#10b981',
            }}
          >
            Running
          </div>
          <div
            style={{
              fontSize: '12px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
            }}
          >
            Timer active
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              margin: 0,
              color: isDark ? '#fff' : '#37352f',
            }}
          >
            Time Entries
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                color: isDark ? '#191919' : '#ffffff',
                border: 'none',
                borderRadius: '3px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              All Entries
            </button>
            <button
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                background: 'transparent',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(55, 53, 47, 0.6)',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(55, 53, 47, 0.2)',
                borderRadius: '3px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              By Task
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: isDark
                    ? '2px solid rgba(255, 255, 255, 0.1)'
                    : '2px solid rgba(55, 53, 47, 0.1)',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  DATE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  DESCRIPTION
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  START
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  END
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  DURATION
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleEntries.map((entry) => (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: isDark
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : '1px solid rgba(55, 53, 47, 0.05)',
                  }}
                >
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {entry.date}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div
                      style={{
                        fontWeight: '500',
                        color: isDark ? '#fff' : '#37352f',
                        marginBottom: '2px',
                      }}
                    >
                      {entry.description}
                    </div>
                    {entry.task && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: isDark
                            ? 'rgba(255, 255, 255, 0.5)'
                            : 'rgba(55, 53, 47, 0.5)',
                        }}
                      >
                        Task: {entry.task}
                      </div>
                    )}
                    {entry.project && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: isDark
                            ? 'rgba(255, 255, 255, 0.5)'
                            : 'rgba(55, 53, 47, 0.5)',
                        }}
                      >
                        Project: {entry.project} • {entry.client}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {entry.start}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {entry.end || '-'}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      fontWeight: '600',
                      color: isDark ? '#fff' : '#37352f',
                    }}
                  >
                    {entry.duration}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {entry.status === 'running' ? (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          borderRadius: '3px',
                          fontWeight: '500',
                        }}
                      >
                        Running
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          background: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(55, 53, 47, 0.05)',
                          color: isDark
                            ? 'rgba(255, 255, 255, 0.6)'
                            : 'rgba(55, 53, 47, 0.6)',
                          borderRadius: '3px',
                          fontWeight: '500',
                        }}
                      >
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Real Project/Task Management Demo (from Projects.jsx & Tasks.jsx)
export const ProjectManagementDemo = ({ isDark }) => {
  const [currentView, setCurrentView] = useState(0);
  const views = ['kanban', 'list']; // Only Kanban and List, no calendar

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 4000); // Change view every 4 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewName = views[currentView];
  const sampleTasks = [
    {
      id: 1,
      title: 'Homepage Design',
      description: 'Create mockups for new homepage layout',
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Dec 20, 2024',
    },
    {
      id: 2,
      title: 'API Integration',
      description: 'Connect frontend to backend services',
      priority: 'urgent',
      status: 'todo',
      dueDate: 'Dec 18, 2024',
    },
    {
      id: 3,
      title: 'User Testing',
      description: 'Conduct usability tests with 5 users',
      priority: 'medium',
      status: 'review',
      dueDate: 'Dec 22, 2024',
    },
    {
      id: 4,
      title: 'Documentation',
      description: 'Write technical documentation',
      priority: 'low',
      status: 'done',
      dueDate: 'Dec 15, 2024',
    },
  ];

  const columns = {
    todo: {
      title: 'To Do',
      tasks: sampleTasks.filter((t) => t.status === 'todo'),
    },
    'in-progress': {
      title: 'In Progress',
      tasks: sampleTasks.filter((t) => t.status === 'in-progress'),
    },
    review: {
      title: 'Review',
      tasks: sampleTasks.filter((t) => t.status === 'review'),
    },
    done: {
      title: 'Done',
      tasks: sampleTasks.filter((t) => t.status === 'done'),
    },
  };

  const priorityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    urgent: '#dc3545',
  };

  return (
    <div
      style={{
        background: isDark ? '#191919' : '#ffffff',
        borderRadius: '6px',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(55, 53, 47, 0.16)',
        padding: '20px',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            margin: 0,
            color: isDark ? '#fff' : '#37352f',
          }}
        >
          Task Board
        </h3>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '4px',
              background: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(55, 53, 47, 0.05)',
              borderRadius: '4px',
            }}
          >
            {['Kanban', 'List'].map((view, idx) => (
              <div
                key={view}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  background:
                    idx === currentView
                      ? isDark
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(55, 53, 47, 0.15)'
                      : 'transparent',
                  color:
                    idx === currentView
                      ? isDark
                        ? '#fff'
                        : '#37352f'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(55, 53, 47, 0.5)',
                  borderRadius: '3px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
              >
                {view}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewName === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          {Object.entries(columns).map(([status, { title, tasks }]) => (
            <div
              key={status}
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(55, 53, 47, 0.02)',
                borderRadius: '4px',
                padding: '12px',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : '1px solid rgba(55, 53, 47, 0.09)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(55, 53, 47, 0.09)',
                }}
              >
                <h4
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: 0,
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.8)'
                      : 'rgba(55, 53, 47, 0.8)',
                  }}
                >
                  {title}
                </h4>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(55, 53, 47, 0.1)',
                    borderRadius: '3px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.6)'
                      : 'rgba(55, 53, 47, 0.6)',
                    fontWeight: '600',
                  }}
                >
                  {tasks.length}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '200px',
                }}
              >
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px',
                      background: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : '#ffffff',
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(55, 53, 47, 0.09)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                        : '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '6px',
                      }}
                    >
                      <strong
                        style={{
                          flex: 1,
                          fontSize: '12px',
                          color: isDark ? '#fff' : '#37352f',
                          lineHeight: '1.4',
                        }}
                      >
                        {task.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '2px 5px',
                          background: `${priorityColors[task.priority]}15`,
                          color: priorityColors[task.priority],
                          borderRadius: '2px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          marginLeft: '6px',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '11px',
                        color: isDark
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(55, 53, 47, 0.5)',
                        marginBottom: '6px',
                        lineHeight: '1.4',
                      }}
                    >
                      {task.description}
                    </p>

                    <p
                      style={{
                        fontSize: '10px',
                        color: isDark
                          ? 'rgba(255, 255, 255, 0.4)'
                          : 'rgba(55, 53, 47, 0.4)',
                        margin: 0,
                      }}
                    >
                      {task.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewName === 'list' && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: isDark
                    ? '2px solid rgba(255, 255, 255, 0.1)'
                    : '2px solid rgba(55, 53, 47, 0.1)',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  TASK
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  PRIORITY
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  DUE DATE
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleTasks.map((task) => (
                <tr
                  key={task.id}
                  style={{
                    borderBottom: isDark
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : '1px solid rgba(55, 53, 47, 0.05)',
                  }}
                >
                  <td style={{ padding: '10px 8px' }}>
                    <div
                      style={{
                        fontWeight: '500',
                        color: isDark ? '#fff' : '#37352f',
                        marginBottom: '2px',
                      }}
                    >
                      {task.title}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: isDark
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(55, 53, 47, 0.5)',
                      }}
                    >
                      {task.description}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '3px 6px',
                        background: `${priorityColors[task.priority]}15`,
                        color: priorityColors[task.priority],
                        borderRadius: '3px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {task.status.replace('-', ' ')}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Real Reports/Analytics Demo (from Reports.jsx)
export const ReportsDemo = ({ isDark }) => {
  const timeByProject = [
    {
      project: 'Website Redesign',
      client: 'Design Studio Co',
      tasks: 8,
      sessions: 15,
      hours: '24.5',
    },
    {
      project: 'Mobile App',
      client: 'Tech Corp',
      tasks: 5,
      sessions: 12,
      hours: '18.2',
    },
    {
      project: 'Brand Identity',
      client: 'Creative Agency',
      tasks: 3,
      sessions: 8,
      hours: '12.8',
    },
  ];

  return (
    <div
      style={{
        background: isDark ? '#191919' : '#ffffff',
        borderRadius: '6px',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(55, 53, 47, 0.16)',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '20px',
          borderBottom: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(55, 53, 47, 0.09)',
        }}
      >
        {[
          {
            label: 'TOTAL REVENUE',
            value: '$24,680',
            desc: 'Paid invoices',
            color: '#10b981',
          },
          {
            label: 'PENDING',
            value: '$5,420',
            desc: 'Awaiting payment',
            color: '#ffc107',
          },
          {
            label: 'OVERDUE',
            value: '$1,200',
            desc: 'Past due date',
            color: '#dc3545',
          },
          {
            label: 'TOTAL INVOICES',
            value: '42',
            desc: 'All time',
            color: '#3b82f6',
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(55, 53, 47, 0.03)',
              borderRadius: '3px',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(55, 53, 47, 0.09)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                marginBottom: '8px',
                fontWeight: '600',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
                letterSpacing: '0.5px',
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '4px',
                color: stat.color,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
              }}
            >
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Time by Project Table */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              margin: 0,
              color: isDark ? '#fff' : '#37352f',
            }}
          >
            Time by Project
          </h3>
          <button
            style={{
              fontSize: '11px',
              padding: '5px 12px',
              background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              color: isDark ? '#191919' : '#ffffff',
              border: 'none',
              borderRadius: '3px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: isDark
                    ? '2px solid rgba(255, 255, 255, 0.1)'
                    : '2px solid rgba(55, 53, 47, 0.1)',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  PROJECT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  CLIENT
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  TASKS
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  SESSIONS
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '10px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  TOTAL HOURS
                </th>
              </tr>
            </thead>
            <tbody>
              {timeByProject.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: isDark
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : '1px solid rgba(55, 53, 47, 0.05)',
                  }}
                >
                  <td
                    style={{
                      padding: '10px 8px',
                      fontWeight: '500',
                      color: isDark ? '#fff' : '#37352f',
                    }}
                  >
                    {item.project}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {item.client}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {item.tasks}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(55, 53, 47, 0.7)',
                    }}
                  >
                    {item.sessions}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: isDark ? '#fff' : '#37352f',
                    }}
                  >
                    {item.hours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Keep the existing ClientManagementDemo
export { ClientManagementDemo } from './RealUIDemo';
