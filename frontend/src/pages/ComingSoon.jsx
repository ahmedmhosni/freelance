import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import api from '../utils/api';
import logger from '../utils/logger';

const ComingSoon = () => {
  const { isDark, toggleTheme } = useTheme();
  const [content, setContent] = useState({
    title: 'Brilliant ideas take time to be roasted',
    subtitle: 'Roastify is coming soon',
    message: 'We\'re crafting something extraordinary. Great things take time, and we\'re roasting the perfect experience for you.',
    launch_date: null
  });

  useEffect(() => {
    fetchMaintenanceContent();
  }, []);

  const fetchMaintenanceContent = async () => {
    try {
      const response = await api.get('/api/maintenance');
      if (response.data) {
        setContent(response.data);
      }
    } catch (err) {
      logger.log('Using default content');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#0a0a0a' : '#ffffff'
    }}>
      {/* Animated Gradient Mesh */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        animation: 'wave 20s ease-in-out infinite',
        pointerEvents: 'none',
        opacity: isDark ? 0.6 : 1
      }} />
      
      {/* Large Floating Orb - Blue/Indigo */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(59, 130, 246, 0.25) 40%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      {/* Large Floating Orb - Purple/Pink */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.12) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'float 25s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      
      {/* Accent Orb - Cyan */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '15%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'float 18s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'scale(1)';
        }}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      {/* Main Content */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '60px' }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: '60px',
              filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%)',
              animation: 'pulse 3s ease-in-out infinite'
            }} 
          />
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#37352f',
          marginBottom: '16px',
          lineHeight: '1.3',
          letterSpacing: '-0.01em'
        }}>
          {content.title}
        </h1>

        {/* Subtitle */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: '500',
          background: isDark
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 1))'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 1))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '24px'
        }}>
          {content.subtitle}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.7)',
          lineHeight: '1.6',
          marginBottom: '32px',
          maxWidth: '480px',
          margin: '0 auto 32px'
        }}>
          {content.message}
        </p>

        {/* Launch Date (if set) */}
        {content.launch_date && (
          <div style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.1)',
            borderRadius: '6px',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '11px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.5)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Expected Launch
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.95)' : '#37352f'
            }}>
              {new Date(content.launch_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        )}

        {/* Coffee Bean Icon */}
        <div style={{
          marginTop: '32px',
          marginBottom: '32px',
          animation: 'pulse 3s ease-in-out infinite'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 7 9.5 8 11C9 12.5 10.5 13.5 12 14C13.5 13.5 15 12.5 16 11C17 9.5 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" 
                  fill={isDark ? 'rgba(168, 85, 247, 0.8)' : 'rgba(99, 102, 241, 0.8)'}/>
            <path d="M12 14C10.5 14.5 9 15.5 8 17C7 18.5 6.5 20.5 7 22.5C7.5 24.5 9.5 26 12 26C14.5 26 16.5 24.5 17 22.5C17.5 20.5 17 18.5 16 17C15 15.5 13.5 14.5 12 14Z" 
                  fill={isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(168, 85, 247, 0.8)'}/>
            <ellipse cx="12" cy="10" rx="2" ry="3" 
                     fill={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'}/>
            <ellipse cx="12" cy="18" rx="2" ry="3" 
                     fill={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'}/>
          </svg>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <p style={{
            fontSize: '12px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.5)'
          }}>
            © 2024 Roastify. All rights reserved.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5%, -5%) rotate(1deg); }
          50% { transform: translate(-5%, 5%) rotate(-1deg); }
          75% { transform: translate(5%, 5%) rotate(1deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes steam {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
