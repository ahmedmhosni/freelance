import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import SEO from '../components/SEO';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
    fetchVersion();
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`/api/announcements/${id}`);
      setAnnouncement(response.data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      setError('Announcement not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersion = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/changelog/current-version`);
      setVersion(response.data);
    } catch (error) {
      console.error('Failed to fetch version:', error);
      setVersion({ version: '1.0.0' });
    }
  };

  return (
    <>
      <SEO 
        title={announcement ? `${announcement.title} - Roastify` : 'Announcement - Roastify'}
        description={announcement ? announcement.content.substring(0, 160) : 'View announcement details'}
        image={announcement?.media_type === 'image' ? announcement.media_url : undefined}
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

        <PublicHeader isLoggedIn={isLoggedIn} />

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '120px 40px 80px',
          position: 'relative',
          zIndex: 1
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
            }}>
              Loading...
            </div>
          ) : error || !announcement ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 16px 0',
                color: isDark ? '#ffffff' : '#000000'
              }}>
                Announcement Not Found
              </h2>
              <p style={{
                fontSize: '16px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '24px'
              }}>
                The announcement you're looking for doesn't exist.
              </p>
              <Link 
                to="/announcements"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  color: isDark ? '#191919' : '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                ← Back to Announcements
              </Link>
            </div>
          ) : (
            <div>
              <Link 
                to="/announcements"
                style={{
                  display: 'inline-block',
                  marginBottom: '32px',
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#ffffff' : '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'}
              >
                ← Back to Announcements
              </Link>

              <div style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
                borderRadius: '12px',
                padding: '48px',
                position: 'relative'
              }}>
                {announcement.is_featured && (
                  <span style={{
                    position: 'absolute',
                    top: '32px',
                    right: '32px',
                    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    ⭐ Featured
                  </span>
                )}

                <h1 style={{
                  fontSize: '40px',
                  fontWeight: '700',
                  margin: '0 0 16px 0',
                  color: isDark ? '#ffffff' : '#000000',
                  lineHeight: '1.2'
                }}>
                  {announcement.title}
                </h1>

                <div style={{
                  marginBottom: '32px',
                  paddingBottom: '24px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
                  }}>
                    {new Date(announcement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {announcement.media_url && (
                  <div style={{
                    margin: '32px 0',
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
                          display: 'block'
                        }}
                      />
                    ) : (
                      <video 
                        controls
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      >
                        <source src={announcement.media_url} type="video/mp4" />
                        <source src={announcement.media_url} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}

                <div style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.9)'
                }}>
                  {announcement.content.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '16px' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <PublicFooter version={version} />
      </div>
    </>
  );
};

export default AnnouncementDetail;
