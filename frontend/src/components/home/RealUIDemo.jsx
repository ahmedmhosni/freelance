import { MdAccessTime, MdFolder, MdBarChart } from 'react-icons/md';

// Real Client Management Table (from Clients.jsx)
export const ClientManagementDemo = ({ isDark }) => {
  const sampleClients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.com',
      company: 'Design Studio Co',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael@techcorp.com',
      company: 'Tech Corp',
      phone: '+1 (555) 234-5678',
    },
    {
      id: 3,
      name: 'Emma Williams',
      email: 'emma@creative.io',
      company: 'Creative Agency',
      phone: '+1 (555) 345-6789',
    },
  ];

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
          opacity: 0.6,
        }}
      />

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(55, 53, 47, 0.7)',
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(55, 53, 47, 0.7)',
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(55, 53, 47, 0.7)',
                }}
              >
                Company
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(55, 53, 47, 0.7)',
                }}
              >
                Phone
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleClients.map((client) => (
              <tr
                key={client.id}
                style={{
                  borderBottom: isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(55, 53, 47, 0.05)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(55, 53, 47, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  }}
                >
                  {client.name}
                </td>
                <td
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(55, 53, 47, 0.7)',
                  }}
                >
                  {client.email}
                </td>
                <td
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(55, 53, 47, 0.7)',
                  }}
                >
                  {client.company}
                </td>
                <td
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(55, 53, 47, 0.7)',
                  }}
                >
                  {client.phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Real Time Tracking Widget (from TimerWidget.jsx style)
export const TimeTrackingDemo = ({ isDark }) => {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <MdAccessTime size={24} />
          </div>
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#10b981',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              02:34:18
            </div>
            <div
              style={{
                fontSize: '13px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(55, 53, 47, 0.6)',
              }}
            >
              Client Website Redesign
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              padding: '12px',
              background: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(55, 53, 47, 0.05)',
              borderRadius: '3px',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(55, 53, 47, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(55, 53, 47, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDark ? '#fff' : '#37352f',
              }}
            >
              8.5h
            </div>
            <div
              style={{
                fontSize: '12px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
              }}
            >
              Today
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: '12px',
              background: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(55, 53, 47, 0.05)',
              borderRadius: '3px',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(55, 53, 47, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(55, 53, 47, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDark ? '#fff' : '#37352f',
              }}
            >
              42h
            </div>
            <div
              style={{
                fontSize: '12px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
              }}
            >
              This Week
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Real Project Cards (from Projects.jsx style)
export const ProjectManagementDemo = ({ isDark }) => {
  const sampleProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      status: 'In Progress',
      progress: 65,
      color: '#3b82f6',
      client: 'Design Studio Co',
    },
    {
      id: 2,
      name: 'Mobile App',
      status: 'Planning',
      progress: 20,
      color: '#f59e0b',
      client: 'Tech Corp',
    },
    {
      id: 3,
      name: 'Brand Identity',
      status: 'Completed',
      progress: 100,
      color: '#10b981',
      client: 'Creative Agency',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {sampleProjects.map((project) => (
        <div
          key={project.id}
          className="card"
          style={{
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Colored accent bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              background: project.color,
              opacity: 0.8,
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              paddingLeft: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: `${project.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MdFolder size={18} style={{ color: project.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: isDark ? '#fff' : '#37352f',
                }}
              >
                {project.name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(55, 53, 47, 0.5)',
                }}
              >
                {project.client} • {project.status}
              </div>
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: project.color,
                padding: '4px 8px',
                background: `${project.color}15`,
                borderRadius: '4px',
              }}
            >
              {project.progress}%
            </div>
          </div>
          <div
            style={{
              height: '6px',
              background: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(55, 53, 47, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginLeft: '8px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${project.progress}%`,
                background: `linear-gradient(90deg, ${project.color}, ${project.color}dd)`,
                transition: 'width 0.3s ease',
                boxShadow: `0 0 8px ${project.color}50`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Real Analytics/Reports (from Dashboard.jsx style)
export const ReportsDemo = ({ isDark }) => {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <MdBarChart size={20} />
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#37352f',
            }}
          >
            Revenue Overview
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            {
              label: 'This Month',
              value: '$12,450',
              color: '#10b981',
              trend: '+35%',
            },
            {
              label: 'Last Month',
              value: '$9,230',
              color: '#3b82f6',
              trend: '+12%',
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '16px',
                background: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(55, 53, 47, 0.05)',
                borderRadius: '6px',
                border: `1px solid ${stat.color}20`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(55, 53, 47, 0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = `${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(55, 53, 47, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${stat.color}20`;
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: stat.color,
                  marginBottom: '4px',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(55, 53, 47, 0.5)',
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#10b981',
                    background: '#10b98115',
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'flex-end',
            height: '100px',
          }}
        >
          {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}%`,
                background: `linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)`,
                borderRadius: '3px 3px 0 0',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.transform = 'scaleY(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scaleY(1)';
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
};
