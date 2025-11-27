import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Terms = () => {
  const { isDark } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/legal/terms');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#191919' : '#ffffff'
      }}>
        <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)' }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#191919' : '#ffffff',
      padding: '80px 20px 60px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          <Link to="/" style={{
            display: 'inline-block',
            marginBottom: '32px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Back to home
          </Link>
          
          <h1 style={{
            fontSize: '40px',
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#37352f',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Terms and Conditions
          </h1>
          
          {content?.lastUpdated && (
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              Last updated: {new Date(content.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{
          background: isDark ? '#202020' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          borderRadius: '6px',
          padding: '48px',
          lineHeight: '1.7'
        }}>
          <div 
            style={{
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
              fontSize: '15px'
            }}
            dangerouslySetInnerHTML={{ __html: content?.content || '' }}
          />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
        }}>
          <p>
            Questions about our terms?{' '}
            <a href="mailto:support@roastify.com" style={{
              color: '#6366f1',
              textDecoration: 'none'
            }}>
              Contact us
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .terms-content h2 {
          font-size: 24px;
          font-weight: 600;
          margin-top: 32px;
          margin-bottom: 16px;
          color: ${isDark ? '#ffffff' : '#37352f'};
        }
        
        .terms-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'};
        }
        
        .terms-content p {
          margin-bottom: 16px;
        }
        
        .terms-content ul, .terms-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        
        .terms-content li {
          margin-bottom: 8px;
        }
        
        .terms-content a {
          color: #6366f1;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Terms;
