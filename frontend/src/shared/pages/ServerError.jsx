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

        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* 500 Number */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '140px',
              fontWeight: '700',
              background: isDark
                ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
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
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em'
            }}>
              Server Error
            </h2>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              marginBottom: '8px',
              lineHeight: '1.6'
            }}>
              Oops! Something went wrong on our end.
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
              lineHeight: '1.6'
            }}>
              We're working to fix the issue. Please try again in a few moments.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                  : '0 4px 20px rgba(239, 68, 68, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = isDark
                  ? '0 6px 25px rgba(239, 68, 68, 0.4)'
                  : '0 6px 25px rgba(239, 68, 68, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isDark
                  ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                  : '0 4px 20px rgba(239, 68, 68, 0.25)';
              }}
            >
              <MdRefresh size={20} />
              Try Again
            </button>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#ffffff' : '#0a0a0a',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <MdHome size={20} />
              Go to Homepage
            </Link>
          </div>

          {/* Support Card */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <MdBugReport size={20} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} />
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDark ? '#ffffff' : '#0a0a0a',
                margin: 0
              }}>
                Error persists?
              </h3>
            </div>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              If this error continues, please contact our support team.
            </p>
            <Link
              to="/contact"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: isDark ? '#ffffff' : '#0a0a0a',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
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
