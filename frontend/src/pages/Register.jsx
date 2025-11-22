import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/register', formData);
      setSuccess('Account created successfully');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '20px' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: '40px', 
              marginBottom: '16px',
              filter: 'brightness(0) saturate(100%)' 
            }} 
          />
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#37352f',
            marginBottom: '8px'
          }}>
            Create an account
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(55, 53, 47, 0.65)' }}>
            Get started for free
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(235, 87, 87, 0.1)',
            border: '1px solid rgba(235, 87, 87, 0.3)',
            borderRadius: '3px',
            color: '#eb5757',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(46, 170, 220, 0.1)',
            border: '1px solid rgba(46, 170, 220, 0.3)',
            borderRadius: '3px',
            color: '#2eaadc',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                outline: 'none',
                transition: 'all 0.15s ease',
                background: '#ffffff'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="name@work-email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                outline: 'none',
                transition: 'all 0.15s ease',
                background: '#ffffff'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: 'rgba(55, 53, 47, 0.65)',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                outline: 'none',
                transition: 'all 0.15s ease',
                background: '#ffffff'
              }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '4px' }}>
              At least 6 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              background: isLoading ? 'rgba(55, 53, 47, 0.4)' : '#37352f',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '16px'
            }}
          >
            {isLoading ? 'Creating account...' : 'Continue'}
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'rgba(55, 53, 47, 0.65)'
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#37352f',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(55, 53, 47, 0.3)'
              }}
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
