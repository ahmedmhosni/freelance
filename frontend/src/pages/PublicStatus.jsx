import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  MdCheckCircle,
  MdError,
  MdWarning,
  MdRefresh,
  MdHistory,
} from 'react-icons/md';
import logger from '../utils/logger';
import LogoLoader from '../components/LogoLoader';

const PublicStatus = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { isDark } = useTheme();

  const fetchStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${apiUrl}/api/status`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStatus(data);

      try {
        const historyResponse = await fetch(`${apiUrl}/api/status/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData.history || {});
        }
      } catch (histError) {
        logger.debug('History not available:', histError);
      }

      setLastUpdate(new Date());
    } catch (error) {
      logger.error('Failed to fetch status:', error);
      setStatus({ status: 'error', services: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'error':
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
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
        return 'Checking Status...';
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: isDark ? '#0f172a' : '#f8fafc',
        }}
      >
        <LogoLoader size={80} text="" />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: isDark ? '#0f172a' : '#f8fafc',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '48px',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '12px',
              }}
            >
              Roastify Status
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(55, 53, 47, 0.65)',
              }}
            >
              Current system status
            </p>
          </div>

          {/* Overall Status */}
          <div
            style={{
              background: isDark ? '#1a1a1a' : '#ffffff',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(55, 53, 47, 0.09)',
              borderRadius: '12px',
              padding: '48px 32px',
              marginBottom: '32px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                color: getStatusColor(status?.status),
                marginBottom: '16px',
              }}
            >
              {getStatusIcon(status?.status)}
            </div>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '12px',
              }}
            >
              {getStatusText(status?.status)}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '24px',
              }}
            >
              Last checked: {lastUpdate.toLocaleTimeString()}
            </p>
            <button
              onClick={fetchStatus}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(55, 53, 47, 0.2)',
                borderRadius: '6px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(55, 53, 47, 0.7)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(55, 53, 47, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <MdRefresh /> Refresh Status
            </button>
          </div>

          {/* Services */}
          <div
            style={{
              background: isDark ? '#1a1a1a' : '#ffffff',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(55, 53, 47, 0.09)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '24px',
              }}
            >
              Service Status
            </h3>

            {status?.services &&
              Object.entries(status.services).map(([name, service]) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: isDark
                      ? '1px solid rgba(255, 255, 255, 0.05)'
                      : '1px solid rgba(55, 53, 47, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '24px',
                        color: getStatusColor(service.status),
                      }}
                    >
                      {getStatusIcon(service.status)}
                    </div>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                        textTransform: 'capitalize',
                      }}
                    >
                      {name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      background: `${getStatusColor(service.status)}15`,
                      fontSize: '13px',
                      fontWeight: '500',
                      color: getStatusColor(service.status),
                      textTransform: 'capitalize',
                    }}
                  >
                    {service.status}
                  </div>
                </div>
              ))}
          </div>

          {/* Uptime History */}
          {Object.keys(history).length > 0 && (
            <div
              style={{
                marginTop: '32px',
                background: isDark ? '#1a1a1a' : '#ffffff',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(55, 53, 47, 0.09)',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                <MdHistory
                  style={{
                    fontSize: '24px',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(55, 53, 47, 0.7)',
                  }}
                />
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  }}
                >
                  Uptime History
                </h3>
              </div>

              {Object.entries(history).map(([serviceName, serviceHistory]) => {
                const avgUptime =
                  serviceHistory.length > 0
                    ? (
                        serviceHistory.reduce(
                          (sum, h) => sum + parseFloat(h.uptime),
                          0
                        ) / serviceHistory.length
                      ).toFixed(2)
                    : 100;

                return (
                  <div key={serviceName} style={{ marginBottom: '32px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: isDark
                            ? 'rgba(255, 255, 255, 0.9)'
                            : '#37352f',
                          textTransform: 'capitalize',
                        }}
                      >
                        {serviceName}
                      </h4>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color:
                            avgUptime >= 99
                              ? '#28a745'
                              : avgUptime >= 95
                                ? '#ffc107'
                                : '#dc3545',
                        }}
                      >
                        {avgUptime}% uptime
                      </div>
                    </div>

                    {/* 90-day uptime bars */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(90, 1fr)',
                        gap: '3px',
                        marginBottom: '8px',
                      }}
                    >
                      {[...Array(90)].map((_, index) => {
                        // Calculate the date for this bar (90 days ago to today)
                        const targetDate = new Date();
                        targetDate.setDate(targetDate.getDate() - (89 - index));
                        targetDate.setHours(0, 0, 0, 0);

                        // Find data for this specific day
                        const dayData = serviceHistory.find((h) => {
                          const historyDate = new Date(h.hour);
                          historyDate.setHours(0, 0, 0, 0);
                          return historyDate.getTime() === targetDate.getTime();
                        });

                        const uptime = dayData
                          ? parseFloat(dayData.uptime)
                          : null;
                        const hasData = uptime !== null;

                        // Format date for tooltip
                        const dateStr = targetDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        let barColor;
                        if (!hasData) {
                          barColor = isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(55, 53, 47, 0.08)';
                        } else if (uptime >= 99.5) {
                          barColor = '#10b981'; // Green - excellent
                        } else if (uptime >= 95) {
                          barColor = '#fbbf24'; // Yellow - degraded
                        } else {
                          barColor = '#ef4444'; // Red - down
                        }

                        return (
                          <div
                            key={index}
                            title={
                              hasData
                                ? `${dateStr}\n${uptime}% uptime\n${dayData.checks} checks`
                                : `${dateStr}\nNo data`
                            }
                            style={{
                              height: '34px',
                              background: barColor,
                              borderRadius: '2px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: hasData
                                ? 'none'
                                : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.1)'}`,
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scaleY(1.15)';
                              e.currentTarget.style.filter = 'brightness(1.1)';
                              e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scaleY(1)';
                              e.currentTarget.style.filter = 'brightness(1)';
                              e.currentTarget.style.zIndex = '1';
                            }}
                          />
                        );
                      })}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: isDark
                          ? 'rgba(255, 255, 255, 0.4)'
                          : 'rgba(55, 53, 47, 0.4)',
                      }}
                    >
                      <span>90 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(55, 53, 47, 0.05)',
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(55, 53, 47, 0.6)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      background: '#10b981',
                      borderRadius: '2px',
                    }}
                  />
                  <span>Operational (≥99.5%)</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      background: '#fbbf24',
                      borderRadius: '2px',
                    }}
                  />
                  <span>Degraded (95-99.5%)</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      background: '#ef4444',
                      borderRadius: '2px',
                    }}
                  />
                  <span>Down (&lt;95%)</span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      background: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(55, 53, 47, 0.08)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.1)'}`,
                      borderRadius: '2px',
                    }}
                  />
                  <span>No data</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '48px',
              padding: '24px',
              borderTop: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(55, 53, 47, 0.09)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '8px',
              }}
            >
              Status updates every 60 seconds
            </p>
            <p
              style={{
                fontSize: '12px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(55, 53, 47, 0.4)',
              }}
            >
              For support, contact{' '}
              <a
                href="mailto:support@roastify.com"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#37352f',
                  textDecoration: 'underline',
                }}
              >
                support@roastify.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PublicStatus;
