import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme, PublicHeader, PublicFooter, SEO } from '../../../shared';
import { logger } from '../../../shared/utils/logger';

const Announcements = () => {
  const { isDark } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchVersion();
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      // Ensure we always set an array
      const data = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(data);
    } catch (error) {
      logger.error('Error fetching announcements:', error);
      setAnnouncements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchVersion = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/changelog/current-version`);
      setVersion(response.data);
    } catch (error) {
      logger.error('Failed to fetch version:', error);
      setVersion({ version: '1.0.0' });
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
        {/* Subtle Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          opacity: isDark ? 0.15 : 0.25,
          pointerEvents: 'none',
          background: isDark 
            ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)'
        }} />

        <PublicHeader isLoggedIn={isLoggedIn} />

        {/* Hero Header */}
        <div style={{
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
          padding: '100px 40px 60px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
              border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6366f1',
              marginBottom: '24px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#6366f1'
              }} />
              Latest Updates
            </div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              color: isDark ? '#ffffff' : '#000000',
              letterSpacing: '-0.02em'
            }}>
              Announcements
            </h1>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
              margin: 0,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Stay updated with our latest news, features, and important updates
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '60px 40px 80px',
          position: 'relative',
          zIndex: 1
        }}>

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

        <PublicFooter version={version} />
      </div>
    </>
  );
};

export default Announcements;
