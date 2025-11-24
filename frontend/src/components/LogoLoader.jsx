import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LogoLoader = ({ size = 80, text = 'Loading...' }) => {
  const { isDark } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '40px'
    }}>
      {/* Animated Logo Container */}
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Rotating Ring */}
        <div style={{
          position: 'absolute',
          width: size + 20,
          height: size + 20,
          border: `3px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
          borderTop: `3px solid ${isDark ? '#8b5cf6' : '#8b5cf6'}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        {/* Pulsing Ring */}
        <div style={{
          position: 'absolute',
          width: size + 40,
          height: size + 40,
          border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)'}`,
          borderRadius: '50%',
          animation: 'pulse 2s ease-in-out infinite'
        }} />

        {/* Logo with Color Animation */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          animation: 'colorChange 3s ease-in-out infinite'
        }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: size,
              width: 'auto',
              filter: isDark 
                ? 'brightness(1.2) drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' 
                : 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
              animation: 'float 3s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div style={{
          fontSize: '16px',
          fontWeight: '500',
          color: isDark ? '#a78bfa' : '#8b5cf6',
          animation: 'fadeInOut 2s ease-in-out infinite',
          letterSpacing: '0.5px'
        }}>
          {text}
        </div>
      )}

      {/* Animated Dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#8b5cf6' : '#8b5cf6',
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.1;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-10px);
          }
        }

        @keyframes colorChange {
          0%, 100% { 
            filter: brightness(1) hue-rotate(0deg);
          }
          25% { 
            filter: brightness(1.2) hue-rotate(10deg);
          }
          50% { 
            filter: brightness(1.3) hue-rotate(20deg);
          }
          75% { 
            filter: brightness(1.2) hue-rotate(10deg);
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.5;
          }
          40% { 
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
