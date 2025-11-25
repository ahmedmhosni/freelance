import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdCheckCircle, MdError, MdWarning, MdRefresh } from 'react-icons/md';

const Status = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { isDark } = useTheme();

  const fetchStatus = async () => {
    try {
      // Use full API URL for production, relative for development
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setStatus({ status: 'error', services: {}, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return '#28a745';
      case 'degraded':
        return '#ffc107';
      case 'error':
      case 'down':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <MdCheckCircle />;
      case 'degraded':
        return <MdWarning />;
      case 'error':
      case 'down':
        return <MdError />;
      default:
        return <MdWarning />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Partial System Outage';
      case 'error':
      case 'down':
        return 'System Outage';
      default:
        return 'Unknown Status';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#ffffff'
      }}>
        <div style={{
          fontSize: '48px',
          animation: 'spin 1s linear infinite',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
        }}>
          ⚙️
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0a0a' : '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '12px'
          }}>
            Roastify System Status
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Real-time status of all services
          </p>
        </div>

        {/* Overall Status */}
        <div style={{
          background: isDark ? '#1a1a1a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            fontSize: '64px',
            color: getStatusColor(status?.status),
            marginBottom: '16px'
          }}>
            {getStatusIcon(status?.status)}
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '8px'
          }}>
            {getStatusText(status?.status)}
          </h2>
          <p style={{
            fontSize: '14px',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
          }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
          <button
            onClick={fetchStatus}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
              borderRadius: '6px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        {/* Services Status */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {status?.services && Object.entries(status.services).map(([name, service]) => (
            <div
              key={name}
              style={{
                background: isDark ? '#1a1a1a' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  textTransform: 'capitalize'
                }}>
                  {name}
                </h3>
                <div style={{
                  fontSize: '24px',
                  color: getStatusColor(service.status)
                }}>
                  {getStatusIcon(service.status)}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  Status: <span style={{ 
                    color: getStatusColor(service.status),
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {service.status}
                  </span>
                </div>
                {service.responseTime !== undefined && (
                  <div>
                    Response Time: <span style={{ fontWeight: '500' }}>
                      {service.responseTime}ms
                    </span>
                  </div>
                )}
                {service.connections !== undefined && (
                  <div>
                    Connections: <span style={{ fontWeight: '500' }}>
                      {service.connections}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Info */}
        <div style={{
          background: isDark ? '#1a1a1a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '16px'
          }}>
            System Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            <div>
              <div style={{ marginBottom: '4px', opacity: 0.7 }}>Uptime</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                {status?.uptime ? formatUptime(status.uptime) : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '4px', opacity: 0.7 }}>Version</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                {status?.version || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '4px', opacity: 0.7 }}>Environment</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                textTransform: 'capitalize'
              }}>
                {status?.environment || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <p style={{
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
            marginBottom: '8px'
          }}>
            Status updates every 30 seconds
          </p>
          <p style={{
            fontSize: '12px',
            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
          }}>
            For support, contact{' '}
            <a
              href="mailto:support@roastify.com"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#37352f',
                textDecoration: 'underline'
              }}
            >
              support@roastify.com
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Status;
