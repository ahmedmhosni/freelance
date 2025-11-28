import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMaintenanceMode } from '../context/MaintenanceContext';
import NotificationBell from './NotificationBell';
import TimerWidget from './TimerWidget';
import MaintenanceBanner from './MaintenanceBanner';
import FeedbackWidget from './FeedbackWidget';
import { 
  MdDashboard, 
  MdPeople, 
  MdFolder, 
  MdCheckCircle, 
  MdReceipt, 
  MdAccessTime, 
  MdBarChart,
  MdPerson,
  MdAdminPanelSettings,
  MdChevronLeft,
  MdChevronRight,
  MdLightMode,
  MdDarkMode,
  MdLogout
} from 'react-icons/md';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isMaintenanceMode } = useMaintenanceMode();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/app/clients', label: 'Clients', icon: MdPeople },
    { path: '/app/projects', label: 'Projects', icon: MdFolder },
    { path: '/app/tasks', label: 'Tasks', icon: MdCheckCircle },
    { path: '/app/invoices', label: 'Invoices', icon: MdReceipt },
    { path: '/app/time-tracking', label: 'Time', icon: MdAccessTime },
    { path: '/app/reports', label: 'Reports', icon: MdBarChart },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/app/admin', label: 'Admin', icon: MdAdminPanelSettings });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Show maintenance banner for admins */}
      {isMaintenanceMode && user?.role === 'admin' && <MaintenanceBanner />}
      
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{
        marginTop: isMaintenanceMode && user?.role === 'admin' ? '48px' : '0'
      }}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            background: 'transparent',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
            transition: 'all 0.15s ease',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isCollapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
        </button>

        <div className="sidebar-header">
          {!isCollapsed ? (
            <>
              <img 
                src="/Asset 7.svg" 
                alt="Logo" 
                style={{ 
                  height: '28px', 
                  marginBottom: '12px',
                  filter: isDark ? 'brightness(0) invert(1)' : 'none',
                  display: 'block'
                }} 
              />
              <div style={{
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '4px',
                fontWeight: '400'
              }}>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return 'Good morning';
                  if (hour < 18) return 'Good afternoon';
                  return 'Good evening';
                })()}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                {user?.name}
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%'
            }}>
              <img 
                src="/Asset 7.svg" 
                alt="Logo" 
                style={{ 
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: isDark ? 'brightness(0) invert(1)' : 'none'
                }} 
              />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path} style={{ marginBottom: '2px' }}>
                  <Link 
                    to={item.path} 
                    title={isCollapsed ? item.label : ''}
                    style={{ 
                      color: isActive 
                        ? (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f')
                        : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'),
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '6px 12px', 
                      borderRadius: '3px',
                      background: isActive 
                        ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)')
                        : 'transparent',
                      transition: 'all 0.15s ease',
                      fontSize: '14px',
                      fontWeight: isActive ? '500' : '400',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.04)';
                        e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'transparent';
                        e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)';
                      }
                    }}
                  >
                    <span className="nav-item-icon" style={{ 
                      fontSize: '18px',
                      opacity: isActive ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Icon />
                    </span>
                    {!isCollapsed && (
                      <span className="nav-item-text" style={{ marginLeft: '10px' }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ 
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          paddingTop: '12px',
          marginTop: '12px'
        }}>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (isDark ? 'Light mode' : 'Dark mode') : ''}
            style={{
              width: '100%',
              background: 'transparent',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              padding: '6px 12px',
              marginBottom: '8px',
              borderRadius: '3px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.15s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span className="nav-item-icon" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
              {isDark ? <MdLightMode /> : <MdDarkMode />}
            </span>
            {!isCollapsed && (
              <span className="nav-item-text">{isDark ? 'Light' : 'Dark'}</span>
            )}
          </button>
          
          <Link
            to="/app/profile"
            title={isCollapsed ? 'Profile' : ''}
            style={{
              width: '100%',
              background: 'transparent',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              padding: '6px 12px',
              marginBottom: '8px',
              borderRadius: '3px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.15s ease',
              overflow: 'hidden',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span className="nav-item-icon" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
              <MdPerson />
            </span>
            {!isCollapsed && (
              <span className="nav-item-text">{user?.name || 'Profile'}</span>
            )}
          </Link>
          
          <button 
            onClick={logout}
            title={isCollapsed ? 'Sign out' : ''}
            className="btn-signout"
          >
            <span className="nav-item-icon" style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
              <MdLogout />
            </span>
            {!isCollapsed && (
              <span className="nav-item-text">Sign out</span>
            )}
          </button>

          {/* Footer Links - Compact */}
          {!isCollapsed && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '11px'
            }}>
              <a
                href="/public-status"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)';
                }}
              >
                Status
              </a>
              <span style={{ color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)' }}>•</span>
              <Link
                to="/terms"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)';
                }}
              >
                Terms
              </Link>
              <span style={{ color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)' }}>•</span>
              <Link
                to="/privacy"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)';
                }}
              >
                Privacy
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        position: 'relative',
        marginTop: isMaintenanceMode && user?.role === 'admin' ? '48px' : '0',
        background: isDark 
          ? 'radial-gradient(circle at 20% 20%, rgba(46, 170, 220, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(46, 170, 220, 0.02) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 20%, rgba(46, 170, 220, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(46, 170, 220, 0.015) 0%, transparent 50%)'
      }}>
        <div style={{ 
          position: 'fixed', 
          top: isMaintenanceMode && user?.role === 'admin' ? '68px' : '20px',
          right: '20px', 
          zIndex: 100,
          display: 'flex',
          gap: '8px'
        }}>
          <TimerWidget />
          <NotificationBell />
        </div>
        <Outlet />
      </main>
      
      {/* Feedback Widget - appears on all pages */}
      <FeedbackWidget />
    </div>
  );
};

export default Layout;
