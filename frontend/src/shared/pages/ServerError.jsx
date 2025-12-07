import { Link } from 'react-router-dom';
import { MdHome, MdRefresh, MdBugReport, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO';

const ServerError = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEO 
        title="Server Error - 500"
        description="Something went wrong on our end."
      />
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', sans-serif',
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? '#0a0a0a' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Animated Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(251, 146, 60, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'float 25s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }} />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            zIndex: 10
          }}
        >
          {isDark ? <MdLightMode size={24} color="#fff" /> : <MdDarkMode size={24} color="#000" />}
        </button>

        <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* 500 Number */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '100px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}>
              500
            </h1>
          </div>

          {/* Error Message */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#37352f',
              marginBottom: '12px',
              letterSpacing: '-0.01em'
            }}>
              Server Error
            </h2>
            <p style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.65)',
              lineHeight: '1.6',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              Something went wrong on our end. We're working to fix the issue. Please try again in a few moments.
            </p>
          </div>

          {/* Action Buttons - Homepage Style */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                border: 'none',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <MdRefresh size={18} />
              Try Again
            </button>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <MdHome size={18} />
              Go to Homepage
            </Link>
          </div>

          {/* Support Card - Compact */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '8px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '12px'
            }}>
              <MdBugReport size={16} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'} />
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#ffffff' : '#37352f',
                margin: 0
              }}>
                Error persists?
              </h3>
            </div>
            <p style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              If this error continues, please contact our support team.
            </p>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '3px',
                fontSize: '13px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
        `}</style>
      </div>
    </>
  );
};

export default ServerError;
