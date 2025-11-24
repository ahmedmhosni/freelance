import React from 'react';
import { useTheme } from '../context/ThemeContext';
import LogoLoader from './LogoLoader';

const FullPageLoader = ({ text = 'Loading...' }) => {
  const { isDark } = useTheme();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
      zIndex: 9999,
      transition: 'background-color 0.3s ease'
    }}>
      <LogoLoader size={100} text={text} />
    </div>
  );
};

export default FullPageLoader;
