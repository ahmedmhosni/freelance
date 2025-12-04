import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

const HeroSection = ({ isDark }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: window.innerWidth <= 768 ? '100px 20px 80px' : '160px 40px 100px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.1)',
        borderRadius: '24px',
        fontSize: '14px',
        fontWeight: '500',
        color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
        marginBottom: '32px',
        animation: 'fadeInDown 0.8s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Shimmer effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          animation: 'shimmer 3s infinite'
        }} />
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#10b981',
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          position: 'relative',
          zIndex: 1
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>
          🔥 Early Access • We're Just Getting Started
        </span>
      </div>

      {/* Main Headline */}
      <h1 style={{
        fontSize: window.innerWidth <= 768 ? '56px' : '96px',
        fontWeight: '700',
        marginBottom: '24px',
        lineHeight: '1.05',
        letterSpacing: '-0.04em',
        animation: 'fadeInUp 0.8s ease 0.2s both',
        color: isDark ? '#ffffff' : '#37352f',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Roasting{' '}
        <span style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block'
        }}>
          Complexity
        </span>
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: window.innerWidth <= 768 ? '20px' : '28px',
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
        lineHeight: '1.5',
        maxWidth: '800px',
        margin: '0 auto 56px',
        animation: 'fadeInUp 0.8s ease 0.4s both',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '500'
      }}>
        Every brilliant idea needs to be roasted.
      </p>

      {/* CTA */}
      <div style={{
        animation: 'fadeInUp 0.8s ease 0.5s both'
      }}>
        <Link
          to="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '20px 48px',
            fontSize: '19px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            border: 'none',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.35)';
          }}
        >
          🔥 Get Early Access
          <MdArrowForward size={24} />
        </Link>
        
        <p style={{
          fontSize: '15px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
          marginTop: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Free • No credit card • Built by freelancers
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
