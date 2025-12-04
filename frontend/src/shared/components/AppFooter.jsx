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
      const response = await axios.get(`${apiUrl}/changelog/current-version`);
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
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Terms
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/privacy" 
            style={{ 
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Privacy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/public-status" 
            style={{ 
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Status
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link 
            to="/changelog" 
            style={{ 
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
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
          color: isDark ? '#ffffff' : '#000000',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          opacity: 0.6
        }}>
          <Link 
            to="/changelog"
            style={{ 
              color: 'inherit',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
            title="View changelog"
          >
            v{version?.version || '1.0.0'}{version?.version_name && ` - ${version.version_name}`}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
