import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    logger.error('Error caught by boundary:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/app/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const isDark = document.body.classList.contains('dark-mode');
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 20px',
          background: isDark ? '#0a0a0a' : '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '80px',
              marginBottom: '24px'
            }}>
              😕
            </div>

            {/* Error Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '16px'
            }}>
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
              Please try refreshing the page or go back to the dashboard.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '32px',
                padding: '16px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '12px', fontWeight: '600' }}>
                  Error Details (Development Mode)
                </summary>
                <pre style={{
                  overflow: 'auto',
                  padding: '12px',
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: '#37352f',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2f2e2a';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#37352f';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔄 Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#37352f',
                  background: 'transparent',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🏠 Go to Dashboard
              </button>
            </div>

            {/* Help Text */}
            <p style={{
              marginTop: '32px',
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              If the problem persists, please contact support at{' '}
              <a
                href="mailto:support@roastify.com"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#37352f',
                  textDecoration: 'underline'
                }}
              >
                support@roastify.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
