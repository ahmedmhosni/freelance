import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import logger from '../utils/logger';

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
      logger.error('Error fetching terms:', error);
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
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>
          
          <h1 className="legal-title">
            Terms and Conditions
          </h1>
          
          {content?.lastUpdated && (
            <p className="legal-date">
              Last updated: {new Date(content.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="legal-content card">
          <div 
            className="terms-content"
            dangerouslySetInnerHTML={{ __html: content?.content || '' }}
          />
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            Questions about our terms?{' '}
            <a href="mailto:support@roastify.com">
              Contact us
            </a>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Terms;
