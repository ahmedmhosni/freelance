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
      gap: '16px',
      padding: '20px'
    }}>
      {/* Simple Jumping Logo */}
      <div style={{
        animation: 'bounce 1.5s ease-in-out infinite'
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
        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
