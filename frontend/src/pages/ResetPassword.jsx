import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="reset-password-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? '#0a0a0a' : '#ffffff',
        padding: window.innerWidth <= 768 ? '20px' : '0',
      }}
    >
      {/* Stripe-like Animated Gradient Mesh */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: isDark
            ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          animation: 'wave 20s ease-in-out infinite',
          pointerEvents: 'none',
          opacity: isDark ? 0.6 : 1,
        }}
      />

      {/* Large Floating Orb - Blue/Indigo */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(59, 130, 246, 0.25) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Large Floating Orb - Purple/Pink */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.12) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'float 25s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Accent Orb - Cyan */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'float 18s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(55, 53, 47, 0.16)',
          background: isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.8)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 1)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'scale(1)';
        }}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: window.innerWidth <= 768 ? '16px' : '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <img
            src="/Asset 7.svg"
            alt="Roastify Logo"
            style={{
              height: '40px',
              marginBottom: '16px',
              filter: isDark
                ? 'brightness(0) invert(1)'
                : 'brightness(0) saturate(100%)',
            }}
          />
          <h1
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '8px',
            }}
          >
            Create New Password
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.6)'
                : 'rgba(55, 53, 47, 0.65)',
            }}
          >
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(55, 53, 47, 0.65)',
                marginBottom: '6px',
              }}
            >
              New Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                outline: 'none',
                transition: 'all 0.15s ease',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(55, 53, 47, 0.65)',
                marginBottom: '6px',
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                outline: 'none',
                transition: 'all 0.15s ease',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: isLoading
                ? isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)'
                : isDark
                  ? 'rgba(255, 255, 255, 0.9)'
                  : '#37352f',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '16px',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = isDark ? '#ffffff' : '#2f2e2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = isDark
                  ? 'rgba(255, 255, 255, 0.9)'
                  : '#37352f';
              }
            }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(55, 53, 47, 0.09)',
          }}
        >
          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(55, 53, 47, 0.65)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = isDark
                ? 'rgba(255, 255, 255, 0.9)'
                : '#37352f';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = isDark
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(55, 53, 47, 0.65)';
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
