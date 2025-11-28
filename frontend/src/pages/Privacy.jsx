import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import logger from '../utils/logger';

const Privacy = () => {
  const { isDark } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacy();
  }, []);

  const fetchPrivacy = async () => {
    try {
      const response = await api.get('/api/legal/privacy');
      setContent(response.data);
    } catch (error) {
      logger.error('Error fetching privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="legal-page">
        <div className="legal-container">
          <p style={{ textAlign: 'center', padding: '48px' }}>Loading...</p>
        </div>
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
            Privacy Policy
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
            Questions about privacy?{' '}
            <a href="mailto:support@roastify.com">
              Contact us
            </a>
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/public-status">System Status</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
