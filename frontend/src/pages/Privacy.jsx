import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdArrowBack, MdLightMode, MdDarkMode } from 'react-icons/md';
import api from '../utils/api';

const Privacy = () => {
  const { isDark, toggleTheme } = useTheme();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await api.get('/api/legal/privacy');
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      setContent('<p>Privacy policy content is currently unavailable.</p>');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0a0a' : '#ffffff',
      color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: '32px',
              filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%)'
            }} 
          />
        </Link>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              padding: '8px',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px'
            }}
          >
            {isDark ? <MdLightMode /> : <MdDarkMode />}
          </button>
          
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              borderRadius: '3px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MdArrowBack /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Privacy Policy
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
          marginBottom: '40px'
        }}>
          Last updated: November 27, 2025
        </p>

        {isLoading ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Loading privacy policy...
          </div>
        ) : (
          <div 
            className="terms-content"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.9)'
            }}
          />
        )}

        {/* Footer Links */}
        <div style={{
          marginTop: '60px',
          paddingTop: '24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
          display: 'flex',
          gap: '20px',
          fontSize: '14px'
        }}>
          <Link 
            to="/terms" 
            style={{ 
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              textDecoration: 'none'
            }}
          >
            Terms & Conditions
          </Link>
          <Link 
            to="/public-status" 
            style={{ 
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              textDecoration: 'none'
            }}
          >
            System Status
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
