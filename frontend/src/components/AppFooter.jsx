import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const AppFooter = () => {
  const { isDark } = useTheme();
  const [version, setVersion] = useState(null);

  useEffect(() => {
    fetchVersion();
  }, []);

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
    <footer style={{
      borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
      padding: '20px',
      marginTop: '60px',
      textAlign: 'center',
      fontSize: '13px',
      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px', 
          marginBottom: '12px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Link 
            to="/terms" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)';
            }}
          >
            Terms
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/privacy" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)';
            }}
          >
            Privacy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/public-status" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)';
            }}
          >
            Status
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/changelog" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)';
            }}
          >
            Changelog
          </Link>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          © {new Date().getFullYear()} Roastify. All rights reserved.
        </div>
        
        <div style={{ 
          fontSize: '11px',
          color: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(55, 53, 47, 0.35)',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/changelog"
            style={{ 
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(55, 53, 47, 0.35)';
            }}
            title="View changelog"
          >
            v{version?.version || '1.0.0'}
            {version?.release_date && ` • ${new Date(version.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
