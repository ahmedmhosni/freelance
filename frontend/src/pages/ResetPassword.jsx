import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode, MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { validatePassword } from '../utils/passwordValidator';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useCode, setUseCode] = useState(!tokenFromUrl);
  const [passwordStrength, setPasswordStrength] = useState(null);
  
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength && !passwordStrength.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      if (useCode) {
        // Reset by code
        await api.post('/api/auth/reset-password-code', {
          email,
          code,
          password
        });
      } else {
        // Reset by token
        await api.post('/api/auth/reset-password', {
          token: tokenFromUrl,
          password
        });
      }

      toast.success('Password reset successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return 'transparent';
    if (passwordStrength.score >= 4) return '#28a745';
    if (passwordStrength.score >= 3) return '#ffc107';
    return '#dc3545';
  };

  const getStrengthText = () => {
    if (!passwordStrength) return '';
    if (passwordStrength.score >= 4) return 'Strong';
    if (passwordStrength.score >= 3) return 'Medium';
    return 'Weak';
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
        maxWidth: '400px', 
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
            Set new password
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            {useCode ? 'Enter your email and 6-digit code' : 'Enter your new password'}
          </p>
        </div>

        {/* Toggle between code and link */}
        {!tokenFromUrl && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            padding: '4px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
            borderRadius: '6px'
          }}>
            <button
              type="button"
              onClick={() => setUseCode(true)}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '13px',
                fontWeight: '500',
                color: useCode 
                  ? (isDark ? '#191919' : '#ffffff')
                  : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'),
                background: useCode 
                  ? (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f')
                  : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Use Code
            </button>
            <button
              type="button"
              onClick={() => setUseCode(false)}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '13px',
                fontWeight: '500',
                color: !useCode 
                  ? (isDark ? '#191919' : '#ffffff')
                  : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'),
                background: !useCode 
                  ? (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f')
                  : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Use Link
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {useCode && (
            <>
              <div style={{ marginBottom: '16px' }}>
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
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
                  marginBottom: '6px'
                }}>
                  6-Digit Code
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '18px',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '3px',
                    outline: 'none',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 40px 8px 10px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  outline: 'none',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
            {passwordStrength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '4px',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    background: getStrengthColor(),
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '11px'
                }}>
                  <span style={{ color: getStrengthColor(), fontWeight: '500' }}>
                    {getStrengthText()}
                  </span>
                  <span style={{ color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)' }}>
                    {passwordStrength.score}/5
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 40px 8px 10px',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  outline: 'none',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
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
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '6px',
          fontSize: '12px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
        }}>
          Password must be at least 8 characters long
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
