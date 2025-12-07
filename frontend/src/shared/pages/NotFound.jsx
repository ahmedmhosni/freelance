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

        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* 404 Number */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '140px',
              fontWeight: '700',
              background: isDark
                ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
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
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#0a0a0a',
              marginBottom: '16px',
              letterSpacing: '-0.01em'
            }}>
              Page Not Found
            </h2>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              marginBottom: '8px',
              lineHeight: '1.6'
            }}>
              Oops! The page you're looking for doesn't exist.
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
              lineHeight: '1.6'
            }}>
              It might have been moved or deleted, or you may have mistyped the URL.
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
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 4px 20px rgba(99, 102, 241, 0.3)'
                  : '0 4px 20px rgba(99, 102, 241, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = isDark
                  ? '0 6px 25px rgba(99, 102, 241, 0.4)'
                  : '0 6px 25px rgba(99, 102, 241, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isDark
                  ? '0 4px 20px rgba(99, 102, 241, 0.3)'
                  : '0 4px 20px rgba(99, 102, 241, 0.25)';
              }}
            >
              <MdHome size={20} />
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
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
              <MdArrowBack size={20} />
              Go Back
            </button>
          </div>

          {/* Quick Links Card */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}>
              <MdSearch size={20} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} />
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDark ? '#ffffff' : '#0a0a0a',
                margin: 0
              }}>
                Looking for something?
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
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
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    e.target.style.color = isDark ? '#ffffff' : '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
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
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'
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
