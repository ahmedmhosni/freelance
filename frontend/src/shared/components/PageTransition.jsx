import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LogoLoader from './LogoLoader';
import { useTheme } from '../context/ThemeContext';

const PageTransition = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFullLoader, setShowFullLoader] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();
  const { isDark } = useTheme();
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const isFromHome = previousPath.current === '/';
    const isToHome = location.pathname === '/';
    
    // Show full loader only when navigating FROM home page to another page
    if (isFromHome && !isToHome) {
      setShowFullLoader(true);
      
      const timer = setTimeout(() => {
        setShowFullLoader(false);
        setDisplayChildren(children);
        previousPath.current = location.pathname;
      }, 2000); // 2 seconds - enough time to see and appreciate the logo
      
      return () => clearTimeout(timer);
    }
    
    // Use smooth transition for all other navigation
    setIsTransitioning(true);
    
    const timer1 = setTimeout(() => {
      setDisplayChildren(children);
    }, 150);

    const timer2 = setTimeout(() => {
      setIsTransitioning(false);
      previousPath.current = location.pathname;
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, children]);

  // Full page loader for home -> app transitions
  if (showFullLoader) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? '#191919' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease'
      }}>
        <LogoLoader size={40} />
      </div>
    );
  }

  return (
    <>
      {/* Subtle top loading bar for in-app navigation */}
      {isTransitioning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          zIndex: 10000,
          animation: 'slideIn 0.3s ease'
        }} />
      )}
      
      {/* Content with smooth fade - no transform to avoid distortion */}
      <div style={{
        opacity: isTransitioning ? 0.85 : 1,
        transition: 'opacity 0.15s ease'
      }}>
        {displayChildren}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default PageTransition;
