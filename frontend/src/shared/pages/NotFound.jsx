import { Link } from 'react-router-dom';
import { MdHome, MdArrowBack, MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO';

const NotFound = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <SEO 
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist."
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
          left: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
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
          {/* 404 Number */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '100px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}>
              404
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
              Page Not Found
            </h2>
            <p style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.65)',
              lineHeight: '1.6',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              The page you're looking for doesn't exist. It might have been moved or deleted.
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
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
              <MdHome size={18} />
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
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
              <MdArrowBack size={18} />
              Go Back
            </button>
          </div>

          {/* Quick Links Card - Compact */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '8px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '16px'
            }}>
              <MdSearch size={16} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'} />
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#ffffff' : '#37352f',
                margin: 0
              }}>
                Looking for something?
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {[
                { to: '/app/dashboard', label: 'Dashboard' },
                { to: '/app/clients', label: 'Clients' },
                { to: '/app/projects', label: 'Projects' },
                { to: '/app/invoices', label: 'Invoices' }
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '3px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    textAlign: 'center',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(55, 53, 47, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.05)';
                    e.target.style.color = isDark ? '#ffffff' : '#37352f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Link */}
          <div>
            <p style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              Need help?{' '}
              <Link
                to="/contact"
                style={{
                  color: isDark ? '#a78bfa' : '#8b5cf6',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Contact Support
              </Link>
            </p>
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

export default NotFound;
