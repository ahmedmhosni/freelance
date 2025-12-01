import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LogoLoader = ({ size = 40, text = '' }) => {
  const { isDark } = useTheme();
  const dotColor = isDark
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(55, 53, 47, 0.8)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '12px',
      }}
    >
      {/* Logo SVG */}
      <div
        style={{
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'brightness(0) invert(1)' : 'none',
            display: 'block',
          }}
        />
      </div>

      {/* Animated Dots */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            animation: 'bounce 1.4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            animation: 'bounce 1.4s ease-in-out 0.2s infinite',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            animation: 'bounce 1.4s ease-in-out 0.4s infinite',
          }}
        />
      </div>

      {/* Loading Text */}
      {text && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: '400',
            color: isDark
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(55, 53, 47, 0.6)',
            marginTop: '4px',
          }}
        >
          {text}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(0.95);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 1;
          }
          40% { 
            transform: translateY(-10px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
