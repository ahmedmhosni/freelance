import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LogoLoader = ({ size = 80, text = '' }) => {
  const { isDark } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '20px'
    }}>
      {/* Pulsing Logo */}
      <div style={{
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <img 
          src="/Asset 7.svg" 
          alt="Roastify Logo" 
          style={{ 
            height: size,
            width: 'auto',
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none'
          }}
        />
      </div>

      {/* Animated Dots */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'center' 
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#fff' : '#000',
              animation: `dot 1.4s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>

      {/* Minimal Loading Text */}
      {text && (
        <div style={{
          fontSize: '13px',
          fontWeight: '400',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
          letterSpacing: '0.3px'
        }}>
          {text}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.05);
          }
        }

        @keyframes dot {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
