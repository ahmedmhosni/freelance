import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LogoLoader = ({ size = 40, text = '' }) => {
  const { isDark } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '12px'
    }}>
      {/* Minimal Spinner */}
      <div style={{
        width: size,
        height: size,
        border: '2px solid rgba(55, 53, 47, 0.1)',
        borderTop: `2px solid ${isDark ? '#fff' : '#37352f'}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />

      {/* Minimal Loading Text */}
      {text && (
        <div style={{
          fontSize: '12px',
          fontWeight: '400',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
        }}>
          {text}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LogoLoader;
