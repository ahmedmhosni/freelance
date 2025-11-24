import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode, MdArrowBack } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#0a0a0a' : '#ffffff',
      padding: window.innerWidth <= 768 ? '20px' : '0'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
        animation: 'wave 20s ease-in-out infinite',
        pointerEvents: 'none',
        opacity: isDark ? 0.6 : 1
      }} />

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
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <div style={{ 
        width: '100%', 
        maxWidth: '360px', 
        padding: window.innerWidth <= 768 ? '16px' : '20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Back to Login */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)';
          }}
        >
          <MdArrowBack size={16} />
          Back to login
        </Link>

        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: '40px', 
              marginBottom: '16px',
              filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%)'
            }} 
          />
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '8px'
          }}>
            Reset your password
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            {emailSent 
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive reset instructions'
            }
          </p>
        </div>

        {emailSent ? (
          <div style={{
            padding: '20px',
            background: isDark ? 'rgba(46, 170, 220, 0.1)' : 'rgba(46, 170, 220, 0.05)',
            border: isDark ? '1px solid rgba(46, 170, 220, 0.3)' : '1px solid rgba(46, 170, 220, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '8px'
            }}>
              Email sent!
            </h3>
            <p style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p style={{
              fontSize: '12px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.55)',
              marginBottom: '20px'
            }}>
              You can use either the link or the 6-digit code to reset your password.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Send another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
                marginBottom: '6px'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="name@work-email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
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
                  ? (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)')
                  : (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'),
                border: 'none',
                borderRadius: '3px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '6px',
          fontSize: '12px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> You'll receive an email with two options:
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Click the reset link to set a new password</li>
            <li>Or use the 6-digit code on the reset page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
