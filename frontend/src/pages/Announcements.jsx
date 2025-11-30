import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import SEO from '../components/SEO';

const Announcements = () => {
  const { isDark, toggleTheme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Announcements - Roastify"
        description="Stay updated with the latest news and announcements from Roastify"
      />
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', sans-serif',
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? '#0a0a0a' : '#ffffff'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isDark ? 0.4 : 0.6,
          pointerEvents: 'none',
          background: isDark 
            ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)'
        }} />

        {/* Header */}
        <header style={{
          padding: '16px 40px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link to="/" style={{
              fontSize: '20px',
              fontWeight: '700',
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Roastify
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
              </button>

              {isLoggedIn ? (
                <Link
                  to="/app/dashboard"
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: isDark ? '#ffffff' : '#000000',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '120px 40px 80px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              background: isDark 
                ? 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)'
                : 'linear-gradient(135deg, #000000 0%, rgba(0, 0, 0, 0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📢 Announcements
            </h1>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
              margin: 0
            }}>
              Stay updated with our latest news and updates
            </p>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
            }}>
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
            }}>
              <p style={{
                margin: 0,
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
              }}>
                No announcements at this time. Check back later!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  to={`/announcements/${announcement.id}`}
                  style={{
                    display: 'block',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
                    borderRadius: '12px',
                    padding: '32px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.08)';
                  }}
                >
                  {announcement.is_featured && (
                    <span style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      ⭐ Featured
                    </span>
                  )}
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    margin: '0 0 12px 0',
                    color: isDark ? '#ffffff' : '#000000'
                  }}>
                    {announcement.title}
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                    margin: '0 0 16px 0'
                  }}>
                    {announcement.content.substring(0, 200)}
                    {announcement.content.length > 200 && '...'}
                  </p>
                  {announcement.media_url && (
                    <div style={{
                      margin: '16px 0',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      {announcement.media_type === 'image' ? (
                        <img 
                          src={announcement.media_url} 
                          alt={announcement.title}
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div style={{
                          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
                          padding: '20px',
                          textAlign: 'center',
                          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                          fontSize: '14px'
                        }}>
                          🎥 Video attached
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
                    }}>
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#667eea',
                      fontWeight: '500'
                    }}>
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
          padding: '40px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            maxWidth: '1200px',
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
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              marginBottom: '12px'
            }}>
              <Link 
                to="/" 
                style={{ 
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Home
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link 
                to="/terms" 
                style={{ 
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Terms
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link 
                to="/privacy" 
                style={{ 
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Privacy
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link 
                to="/changelog" 
                style={{ 
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Changelog
              </Link>
            </div>
            <div style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
            }}>
              © 2024 Roastify. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Announcements;
