import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

const PublicHeader = ({ isLoggedIn }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: isDark
          ? 'rgba(10, 10, 10, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(55, 53, 47, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/">
          <img
            src="/Asset 7.svg"
            alt="Roastify"
            style={{
              height: '32px',
              filter: isDark ? 'brightness(0) invert(1)' : 'none',
            }}
          />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.15)'
                : '1px solid rgba(55, 53, 47, 0.16)',
              background: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              color: isDark
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(55, 53, 47, 0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </button>

          {isLoggedIn ? (
            <Link
              to="/app/dashboard"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#191919' : '#ffffff',
                background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                border: 'none',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                display: 'inline-block',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  background: 'transparent',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Sign in
              </Link>

              <Link
                to="/register"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? '#191919' : '#ffffff',
                  background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  border: 'none',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
