import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import logger from '../utils/logger';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isDark } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#eb5757',
      high: '#ffa344',
      medium: '#ffd426',
      low: '#2eaadc'
    };
    return colors[priority] || 'rgba(55, 53, 47, 0.3)';
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#37352f',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
          padding: '8px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '16px',
          transition: 'all 0.15s ease',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 53, 47, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)';
        }}
      >
        ◉
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#eb5757',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown" style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          background: isDark ? '#202020' : 'white',
          borderRadius: '3px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          width: '320px',
          maxWidth: 'calc(100vw - 40px)',
          zIndex: 1000,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto'
        }}>
          <div className="notification-header" style={{
            padding: '12px 16px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
            }}>Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
              fontSize: '13px'
            }}>
              No notifications
            </div>
          ) : (
            notifications.map((notif, index) => (
              <div 
                key={index} 
                className="notification-item" 
                style={{
                  padding: '12px 16px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: getPriorityColor(notif.priority),
                    marginTop: '6px',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ 
                      fontSize: '13px', 
                      color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                      fontWeight: '500'
                    }}>
                      {notif.title}
                    </strong>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '12px', 
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                      lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </p>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '11px', 
                      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.5)'
                    }}>
                      {new Date(notif.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
