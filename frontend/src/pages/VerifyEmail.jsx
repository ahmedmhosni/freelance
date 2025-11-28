import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdCheckCircle, MdError, MdMail } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [method, setMethod] = useState('code'); // 'code' or 'link'
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Auto-verify if token in URL, or pre-fill email from URL
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (token && !isVerifying && verificationStatus === null) {
      verifyByToken(token);
    }
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const verifyByToken = async (token) => {
    setIsVerifying(true);
    try {
      const response = await api.get(`/api/auth/verify-email/${token}`);
      setVerificationStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      toast.success(response.data.message || 'Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Verification failed';
      setVerificationStatus('error');
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== '') && email) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs[5].current?.focus();
      
      // Auto-submit if email is filled
      if (email) {
        handleVerifyCode(pastedData);
      }
    }
  };

  const handleVerifyCode = async (codeString = code.join('')) => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (codeString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await api.post('/api/auth/verify-code', {
        email,
        code: codeString
      });
      setVerificationStatus('success');
      setMessage(response.data.message);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.error || 'Invalid code');
      toast.error(error.response?.data?.error || 'Invalid code');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Effects - Match website theme */}
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
        
        {/* Floating Orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'float 25s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }}>
            <MdCheckCircle />
          </div>
          <h2 style={{ 
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f', 
            marginBottom: '10px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Email Verified!
          </h2>
          <p style={{ 
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)', 
            marginBottom: '20px',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            {message}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)' 
          }}>
            Redirecting to login...
          </p>
        </div>

        <style>{`
          @keyframes wave {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container" style={{
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
      {/* Stripe-like Animated Gradient Mesh */}
      <div style={{
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
        opacity: isDark ? 0.6 : 1
      }} />
      
      {/* Large Floating Orb - Blue/Indigo */}
      <div style={{
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
        pointerEvents: 'none'
      }} />
      
      {/* Large Floating Orb - Purple/Pink */}
      <div style={{
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
        pointerEvents: 'none'
      }} />
      
      {/* Accent Orb - Cyan */}
      <div style={{
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
        pointerEvents: 'none'
      }} />

      <div style={{ 
        width: '100%', 
        maxWidth: '450px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
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
            Verify Your Email
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Check your email for the verification code
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {/* Email Input */}
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

          {/* Code Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              Verification Code
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  style={{
                    width: '48px',
                    height: '56px',
                    fontSize: '22px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '3px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2eaadc';
                    e.target.select();
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 53, 47, 0.16)';
                  }}
                />
              ))}
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              textAlign: 'center'
            }}>
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Error Message */}
          {verificationStatus === 'error' && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(235, 87, 87, 0.1)',
              border: '1px solid rgba(235, 87, 87, 0.3)',
              borderRadius: '4px',
              color: '#eb5757',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MdError />
              {message}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyCode()}
            disabled={isVerifying || code.some(d => !d) || !email}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: (isVerifying || code.some(d => !d) || !email)
                ? (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)')
                : (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'),
              border: 'none',
              borderRadius: '3px',
              cursor: (isVerifying || code.some(d => !d) || !email) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '16px',
              opacity: (isVerifying || code.some(d => !d) || !email) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isVerifying && !code.some(d => !d) && email) {
                e.target.style.background = isDark ? '#ffffff' : '#2f2e2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isVerifying && !code.some(d => !d) && email) {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
              }
            }}
          >
            {isVerifying ? 'Verifying...' : 'Continue'}
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Didn't receive the code?{' '}
            <Link
              to="/resend-verification"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                textDecoration: 'none',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(55, 53, 47, 0.3)'
              }}
            >
              Resend
            </Link>
          </div>
        </div>

        {/* Back to Login */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
          textAlign: 'center',
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
        }}>
          <Link
            to="/login"
            style={{
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              textDecoration: 'none',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(55, 53, 47, 0.3)'
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
