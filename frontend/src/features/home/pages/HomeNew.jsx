import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, SEO } from '../../../shared';
import { 
  MdLightMode, 
  MdDarkMode, 
  MdDashboard,
  MdPeople,
  MdWork,
  MdCheckCircle,
  MdTimer,
  MdReceipt,
  MdBarChart,
  MdSettings,
  MdArrowForward,
  MdRocketLaunch
} from 'react-icons/md';
import axios from 'axios';
import { logger } from '../../../shared/utils/logger';

const HomeNew = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [version, setVersion] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchVersion();
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchVersion = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/changelog/current-version`);
      setVersion(response.data);
    } catch (error) {
      logger.error('Failed to fetch version:', error);
      setVersion({ version: '1.5.0' });
    }
  };

  const features = [
    {
      icon: <MdDashboard size={32} />,
      title: 'Dashboard',
      description: 'Overview of your business at a glance',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: isLoggedIn ? '/app/dashboard' : '/register'
    },
    {
      icon: <MdPeople size={32} />,
      title: 'Clients',
      description: 'Manage your client relationships',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      path: isLoggedIn ? '/app/clients' : '/register'
    },
    {
      icon: <MdWork size={32} />,
      title: 'Projects',
      description: 'Track all your active projects',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      path: isLoggedIn ? '/app/projects' : '/register'
    },
    {
      icon: <MdCheckCircle size={32} />,
      title: 'Tasks',
      description: 'Organize and complete your tasks',
      color: '#f43f5e',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
      path: isLoggedIn ? '/app/tasks' : '/register'
    },
    {
      icon: <MdTimer size={32} />,
      title: 'Time Tracking',
      description: 'Track billable hours effortlessly',
      color: '#fb923c',
      gradient: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',
      path: isLoggedIn ? '/app/time-tracking' : '/register'
    },
    {
      icon: <MdReceipt size={32} />,
      title: 'Invoices',
      description: 'Create and send professional invoices',
      color: '#fbbf24',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #84cc16 100%)',
      path: isLoggedIn ? '/app/invoices' : '/register'
    },
    {
      icon: <MdBarChart size={32} />,
      title: 'Reports',
      description: 'Analyze your business performance',
      color: '#84cc16',
      gradient: 'linear-gradient(135deg, #84cc16 0%, #22c55e 100%)',
      path: isLoggedIn ? '/app/reports' : '/register'
    },
    {
      icon: <MdSettings size={32} />,
      title: 'Settings',
      description: 'Customize your workspace',
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
      path: isLoggedIn ? '/app/profile' : '/register'
    }
  ];

  return (
    <>
      <SEO 
        title="Roastify - Modern Freelancer Management Platform"
        description="Everything you need to run your freelance business. Manage clients, track time, create invoices, and get paid faster."
        keywords="freelancer management, time tracking, invoicing, client management, project management"
        url="https://roastify.online"
      />
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', sans-serif',
        background: isDark ? '#0a0a0a' : '#fafafa',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Gradient */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <img 
              src="/Asset 7.svg" 
              alt="Roastify" 
              style={{ 
                height: '32px',
                filter: isDark ? 'brightness(0) invert(1)' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
              </button>
              
              {isLoggedIn ? (
                <Link
                  to="/app/dashboard"
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    display: 'inline-block'
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                      background: 'transparent',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                  >
                    Sign in
                  </Link>
                  
                  <Link
                    to="/register"
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 40px 80px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#6366f1',
              marginBottom: '32px'
            }}>
              <MdRocketLaunch size={16} />
              Everything you need in one place
            </div>

            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '48px' : '72px',
              fontWeight: '800',
              color: isDark ? '#ffffff' : '#0a0a0a',
              marginBottom: '24px',
              lineHeight: '1.1',
              letterSpacing: '-0.04em'
            }}>
              Your freelance{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                command center
              </span>
            </h1>

            <p style={{
              fontSize: '20px',
              fontWeight: '400',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.6'
            }}>
              Manage clients, track time, create invoices, and grow your business — all from one beautiful dashboard
            </p>

            {!isLoggedIn && (
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                }}
              >
                Start for free
                <MdArrowForward size={20} />
              </Link>
            )}
          </div>

          {/* Feature Grid - App-like Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : window.innerWidth <= 1024 
                ? 'repeat(3, 1fr)' 
                : 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '80px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.path)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  border: hoveredCard === index 
                    ? `2px solid ${feature.color}`
                    : isDark 
                      ? '2px solid rgba(255, 255, 255, 0.08)' 
                      : '2px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '24px',
                  padding: '32px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === index 
                    ? `0 20px 40px ${feature.color}40`
                    : isDark 
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Gradient Background on Hover */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: feature.gradient,
                  opacity: hoveredCard === index ? 0.1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }} />

                {/* Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: hoveredCard === index 
                    ? feature.gradient
                    : isDark 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: hoveredCard === index ? '#ffffff' : feature.color,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: isDark ? '#ffffff' : '#0a0a0a',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                    lineHeight: '1.5'
                  }}>
                    {feature.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '24px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: hoveredCard === index 
                    ? feature.gradient
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: hoveredCard === index ? '#ffffff' : feature.color,
                  opacity: hoveredCard === index ? 1 : 0,
                  transform: hoveredCard === index ? 'translateX(0)' : 'translateX(-8px)',
                  transition: 'all 0.3s ease',
                  zIndex: 2
                }}>
                  <MdArrowForward size={18} />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          {!isLoggedIn && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
              borderRadius: '32px',
              border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)'
            }}>
              <h2 style={{
                fontSize: window.innerWidth <= 768 ? '32px' : '48px',
                fontWeight: '700',
                color: isDark ? '#ffffff' : '#0a0a0a',
                marginBottom: '16px',
                letterSpacing: '-0.03em'
              }}>
                Ready to get started?
              </h2>
              <p style={{
                fontSize: '18px',
                fontWeight: '400',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px'
              }}>
                Join thousands of freelancers managing their business with Roastify
              </p>
              <Link
                to="/register"
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                }}
              >
                Get started for free
                <MdArrowForward size={20} />
              </Link>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          background: isDark ? 'rgba(10, 10, 10, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              marginBottom: '16px'
            }}>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
              <span>•</span>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
              <span>•</span>
              <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
              <span>•</span>
              <Link to="/changelog" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</Link>
            </div>
            
            <div style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
            }}>
              © {new Date().getFullYear()} Roastify. All rights reserved.
              {version && ` • v${version.version}`}
            </div>
          </div>
        </footer>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HomeNew;
