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

  // Auto-verify if token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyByToken(token);
    }
  }, [searchParams]);

  const verifyByToken = async (token) => {
    setIsVerifying(true);
    try {
      const response = await api.get(`/api/auth/verify-email/${token}`);
      setVerificationStatus('success');
      setMessage(response.data.message);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
      toast.error(error.response?.data?.error || 'Verification failed');
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
        background: isDark ? '#0a0a0a' : '#ffffff'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '64px', color: '#2eaadc', marginBottom: '20px' }}>
            <MdCheckCircle />
          </div>
          <h2 style={{ color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f', marginBottom: '10px' }}>
            Email Verified!
          </h2>
          <p style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)', marginBottom: '20px' }}>
            {message}
          </p>
          <p style={{ fontSize: '14px', color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)' }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: isDark ? '#0a0a0a' : '#ffffff',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', color: '#2eaadc', marginBottom: '16px' }}>
            <MdMail />
          </div>
          <h1 style={{
            fontSize: '24px',
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

        <div className="card" style={{ padding: '30px' }}>
          {/* Email Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '8px'
            }}>
              Your Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '4px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}
            />
          </div>

          {/* Code Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '8px'
            }}>
              Verification Code
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              marginBottom: '12px'
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
                    width: '50px',
                    height: '60px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '8px',
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
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: (isVerifying || code.some(d => !d) || !email)
                ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 53, 47, 0.3)')
                : (isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'),
              border: 'none',
              borderRadius: '4px',
              cursor: (isVerifying || code.some(d => !d) || !email) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend Link */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
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
          textAlign: 'center', 
          marginTop: '20px',
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
