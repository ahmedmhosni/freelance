import { useState, useEffect } from 'react';
import { MdSecurity, MdClose, MdInfo } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';

/**
 * Security Notice Component
 * 
 * Displays information about HTTPS and security features
 * Shows a notice if user is on HTTP in production
 */
const SecurityNotice = () => {
  const { isDark } = useTheme();
  const [showNotice, setShowNotice] = useState(false);
  const [isHttps, setIsHttps] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we're on HTTPS
    const protocol = window.location.protocol;
    const isSecure = protocol === 'https:';
    setIsHttps(isSecure);

    // Check if user dismissed the notice
    const isDismissed = localStorage.getItem('security-notice-dismissed') === 'true';
    setDismissed(isDismissed);

    // Show notice if:
    // 1. Not on HTTPS
    // 2. Not dismissed
    // 3. Not localhost (development)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (!isSecure && !isDismissed && !isLocalhost) {
      setShowNotice(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowNotice(false);
    setDismissed(true);
    localStorage.setItem('security-notice-dismissed', 'true');
  };

  const handleUpgrade = () => {
    // Redirect to HTTPS version
    const httpsUrl = window.location.href.replace('http://', 'https://');
    window.location.href = httpsUrl;
  };

  if (!showNotice || dismissed) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDark ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
      } border-b shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <MdSecurity 
              className={`text-2xl mt-0.5 flex-shrink-0 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`} 
            />
            <div className="flex-1">
              <h3 
                className={`font-semibold mb-1 ${
                  isDark ? 'text-yellow-100' : 'text-yellow-900'
                }`}
              >
                🔒 Secure Connection Recommended
              </h3>
              <p 
                className={`text-sm mb-2 ${
                  isDark ? 'text-yellow-200' : 'text-yellow-800'
                }`}
              >
                You're currently using an insecure connection (HTTP). For your security and privacy, 
                we strongly recommend switching to a secure connection (HTTPS).
              </p>
              <div className="flex items-center gap-2 text-xs">
                <MdInfo className={isDark ? 'text-yellow-300' : 'text-yellow-700'} />
                <span className={isDark ? 'text-yellow-300' : 'text-yellow-700'}>
                  HTTPS encrypts your data and protects your passwords, personal information, and session.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isDark
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              Switch to HTTPS
            </button>
            <button
              onClick={handleDismiss}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-yellow-800 text-yellow-300'
                  : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              aria-label="Dismiss notice"
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;
