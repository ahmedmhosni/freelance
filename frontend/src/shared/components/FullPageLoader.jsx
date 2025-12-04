import React from 'react';
import { useTheme } from '../context/ThemeContext';
import LogoLoader from './LogoLoader';

const FullPageLoader = ({ text = '' }) => {
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
      backgroundColor: isDark ? '#191919' : '#ffffff',
      zIndex: 9999,
      transition: 'background-color 0.3s ease'
    }}>
      <LogoLoader size={32} text={text} />
    </div>
  );
};

export default FullPageLoader;
