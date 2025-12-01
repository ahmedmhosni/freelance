import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PublicFooter = ({ version }) => {
  const { isDark } = useTheme();

  return (
    <footer
      style={{
        borderTop: isDark
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(55, 53, 47, 0.08)',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: isDark
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(55, 53, 47, 0.5)',
            marginBottom: '12px',
          }}
        >
          <Link
            to="/terms"
            style={{
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Terms
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link
            to="/privacy"
            style={{
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Privacy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link
            to="/public-status"
            style={{
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            Status
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link
            to="/changelog"
            style={{
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Changelog
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link
            to="/announcements"
            style={{
              color: isDark ? '#ffffff' : '#000000',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Announcements
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <a
            href="https://instagram.com/roastify.online"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.5,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            aria-label="Follow us on Instagram"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>

        <div
          style={{
            fontSize: '13px',
            color: isDark
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(55, 53, 47, 0.5)',
            marginBottom: '12px',
          }}
        >
          © {new Date().getFullYear()} Roastify. All rights reserved.
        </div>

        {version && (
          <div
            style={{
              fontSize: '11px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.35)'
                : 'rgba(55, 53, 47, 0.35)',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/changelog"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = isDark
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgba(55, 53, 47, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = isDark
                  ? 'rgba(255, 255, 255, 0.35)'
                  : 'rgba(55, 53, 47, 0.35)';
              }}
            >
              v{version.version}
            </Link>
            {version.version_name && (
              <>
                <span>•</span>
                <span>{version.version_name}</span>
              </>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default PublicFooter;
