import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared';
import { 
  MdCheckCircle, 
  MdError, 
  MdWarning, 
  MdRefresh, 
  MdStorage, 
  MdCloud, 
  MdSpeed,
  MdTimer,
  MdTrendingUp,
  MdLock
} from 'react-icons/md';

const AdminStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isDark } = useTheme();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
  }, [navigate]);

  const fetchStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      // Fetch current status
      const statusResponse = await fetch(`${apiUrl}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`);
      }
      const statusData = await statusResponse.json();
      setStatus(statusData);
      
      // Fetch history
      try {
        const historyResponse = await fetch(`${apiUrl}/status/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData.history || {});
        }
      } catch (histError) {
        console.log('History not available:', histError);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setStatus({ status: 'error', services: {}, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

  const getServiceIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'database':
        return <MdStorage />;
      case 'api':
        return <MdCloud />;
      case 'email':
        return <MdSpeed />;
      default:
        return <MdCheckCircle />;
    }
  };

  const getResponseTimeColor = (ms) => {
    if (ms < 100) return '#28a745';
    if (ms < 300) return '#ffc107';
    return '#dc3545';
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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <MdLock style={{ color: '#ffc107' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#ffc107'
            }}>
              Admin Only
            </span>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '12px'
          }}>
            System Status Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Detailed real-time monitoring and history
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
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MdTrendingUp /> Service Health
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {status?.services && Object.entries(status.services).map(([name, service]) => (
              <div
                key={name}
                style={{
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Status indicator bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: getStatusColor(service.status)
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '32px',
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
                    }}>
                      {getServiceIcon(name)}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                        textTransform: 'capitalize',
                        marginBottom: '4px'
                      }}>
                        {name}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: `${getStatusColor(service.status)}15`,
                        fontSize: '12px',
                        fontWeight: '500',
                        color: getStatusColor(service.status),
                        textTransform: 'capitalize'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(service.status),
                          animation: service.status === 'operational' ? 'pulse 2s ease-in-out infinite' : 'none'
                        }} />
                        {service.status}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '28px',
                    color: getStatusColor(service.status)
                  }}>
                    {getStatusIcon(service.status)}
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
                }}>
                  {service.responseTime !== undefined && (
                    <div>
                      <div style={{
                        fontSize: '11px',
                        color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MdTimer style={{ fontSize: '14px' }} /> Response
                      </div>
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        color: getResponseTimeColor(service.responseTime)
                      }}>
                        {service.responseTime}ms
                      </div>
                    </div>
                  )}
                  {service.connections !== undefined && (
                    <div>
                      <div style={{
                        fontSize: '11px',
                        color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Connections
                      </div>
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                      }}>
                        {service.connections}
                      </div>
                    </div>
                  )}
                  {service.message && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                        fontStyle: 'italic'
                      }}>
                        {service.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime History */}
        {Object.keys(history).length > 0 && (
          <div style={{
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MdTimer /> Uptime History (Last 24 Hours)
            </h2>
            <div style={{
              background: isDark ? '#1a1a1a' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              {Object.entries(history).map(([serviceName, serviceHistory]) => {
                const avgUptime = serviceHistory.length > 0
                  ? (serviceHistory.reduce((sum, h) => sum + parseFloat(h.uptime), 0) / serviceHistory.length).toFixed(2)
                  : 100;
                
                return (
                  <div key={serviceName} style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                        textTransform: 'capitalize'
                      }}>
                        {serviceName}
                      </h3>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: avgUptime >= 99 ? '#28a745' : avgUptime >= 95 ? '#ffc107' : '#dc3545'
                      }}>
                        {avgUptime}% uptime
                      </div>
                    </div>
                    
                    {/* Uptime bars */}
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      height: '40px',
                      alignItems: 'flex-end'
                    }}>
                      {[...Array(24)].map((_, index) => {
                        const hourData = serviceHistory.find(h => {
                          const hourDiff = Math.floor((new Date() - new Date(h.hour)) / (1000 * 60 * 60));
                          return hourDiff === (23 - index);
                        });
                        
                        const uptime = hourData ? parseFloat(hourData.uptime) : null;
                        const hasData = uptime !== null;
                        
                        let barColor;
                        if (!hasData) {
                          barColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)';
                        } else if (uptime >= 99) {
                          barColor = '#28a745';
                        } else if (uptime >= 90) {
                          barColor = '#ffc107';
                        } else {
                          barColor = '#dc3545';
                        }
                        
                        return (
                          <div
                            key={index}
                            title={hasData ? `${uptime}% uptime (${hourData.checks} checks)` : 'No data'}
                            style={{
                              flex: 1,
                              height: hasData ? `${Math.max(uptime, 10)}%` : '20%',
                              background: barColor,
                              borderRadius: '2px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: hasData ? 1 : 0.3
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                              e.currentTarget.style.transform = 'scaleY(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = hasData ? '1' : '0.3';
                              e.currentTarget.style.transform = 'scaleY(1)';
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '11px',
                      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
                    }}>
                      <span>24 hours ago</span>
                      <span>Now</span>
                    </div>
                  </div>
                );
              })}
              
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)',
                fontSize: '12px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#28a745', borderRadius: '2px' }} />
                  <span>Operational (≥99%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#ffc107', borderRadius: '2px' }} />
                  <span>Degraded (90-99%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#dc3545', borderRadius: '2px' }} />
                  <span>Down (&lt;90%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)', borderRadius: '2px' }} />
                  <span>No data</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div style={{
          background: isDark ? '#1a1a1a' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MdSpeed /> System Metrics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            <div style={{
              padding: '20px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              borderRadius: '8px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
            }}>
              <div style={{ 
                fontSize: '11px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '500'
              }}>
                System Uptime
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700',
                color: '#28a745',
                marginBottom: '4px'
              }}>
                {status?.uptime ? formatUptime(status.uptime) : 'N/A'}
              </div>
              <div style={{
                fontSize: '12px',
                color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
              }}>
                Running smoothly
              </div>
            </div>
            
            <div style={{
              padding: '20px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              borderRadius: '8px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
            }}>
              <div style={{ 
                fontSize: '11px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '500'
              }}>
                Version
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '4px'
              }}>
                {status?.version || 'N/A'}
              </div>
              <div style={{
                fontSize: '12px',
                color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
              }}>
                Latest stable
              </div>
            </div>
            
            <div style={{
              padding: '20px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              borderRadius: '8px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
            }}>
              <div style={{ 
                fontSize: '11px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '500'
              }}>
                Environment
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700',
                color: status?.environment === 'production' ? '#007bff' : '#ffc107',
                marginBottom: '4px',
                textTransform: 'capitalize'
              }}>
                {status?.environment || 'N/A'}
              </div>
              <div style={{
                fontSize: '12px',
                color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
              }}>
                {status?.environment === 'production' ? 'Live system' : 'Test environment'}
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStatus;
