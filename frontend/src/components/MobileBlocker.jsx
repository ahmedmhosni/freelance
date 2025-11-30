import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdDesktopWindows, MdPhoneIphone } from 'react-icons/md';

const MobileBlocker = () => {
  const { isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark ? '#0a0a0a' : '#ffffff',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
            border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1'
          }}>
            <MdDesktopWindows size={40} />
          </div>
        </div>

        {/* Logo */}
        <img 
          src="/Asset 7.svg" 
          alt="Roastify" 
          style={{ 
            height: '32px',
            marginBottom: '24px',
            filter: isDark ? 'brightness(0) invert(1)' : 'none'
          }} 
        />

        {/* Message */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 16px 0',
          color: isDark ? '#ffffff' : '#000000',
          lineHeight: '1.3'
        }}>
          Desktop Experience Required
        </h1>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
          margin: '0 0 24px 0'
        }}>
          We're still perfecting our mobile experience. For the best experience, please visit Roastify from your desktop or laptop computer.
        </p>

        {/* Info Box */}
        <div style={{
          background: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.05)',
          border: isDark ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6366f1',
            fontWeight: '500'
          }}>
            <MdPhoneIphone size={18} />
            <span>Mobile app coming soon!</span>
          </div>
        </div>

        {/* Back Button */}
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            color: isDark ? '#191919' : '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Back to Home
        </a>

        {/* Footer Note */}
        <p style={{
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
          margin: '24px 0 0 0'
        }}>
          Thank you for your understanding 💙
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;
