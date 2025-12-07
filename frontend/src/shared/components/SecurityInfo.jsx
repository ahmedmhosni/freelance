import { useState, useEffect } from 'react';
import { MdSecurity, MdLock, MdVerifiedUser, MdShield } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

/**
 * Security Info Component
 * 
 * Displays security features and status
 * Can be used in settings or about pages
 */
const SecurityInfo = () => {
  const { isDark } = useTheme();
  const [securityInfo, setSecurityInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityInfo();
  }, []);

  const fetchSecurityInfo = async () => {
    try {
      const response = await api.get('/security-info');
      setSecurityInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch security info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!securityInfo) {
    return null;
  }

  const isSecure = window.location.protocol === 'https:';

  const features = [
    {
      icon: MdLock,
      title: 'HTTPS Encryption',
      status: securityInfo.https.enforced,
      description: securityInfo.https.message,
      active: isSecure
    },
    {
      icon: MdShield,
      title: 'HSTS Protection',
      status: securityInfo.https.hsts,
      description: 'HTTP Strict Transport Security ensures all connections use HTTPS.',
      active: isSecure && securityInfo.https.hsts
    },
    {
      icon: MdVerifiedUser,
      title: 'Secure Cookies',
      status: securityInfo.cookies.secure,
      description: securityInfo.cookies.message,
      active: securityInfo.cookies.secure
    },
    {
      icon: MdSecurity,
      title: 'Security Headers',
      status: true,
      description: 'Additional security headers protect against common web vulnerabilities.',
      active: true
    }
  ];

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-3 mb-6">
        <MdSecurity className={`text-3xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Security Features
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your connection and data are protected
          </p>
        </div>
      </div>

      {/* Current Connection Status */}
      <div 
        className={`mb-6 p-4 rounded-lg border ${
          isSecure
            ? isDark
              ? 'bg-green-900/20 border-green-700'
              : 'bg-green-50 border-green-200'
            : isDark
            ? 'bg-yellow-900/20 border-yellow-700'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <MdLock 
            className={`text-xl ${
              isSecure
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}
          />
          <span 
            className={`font-semibold ${
              isSecure
                ? isDark ? 'text-green-300' : 'text-green-800'
                : isDark ? 'text-yellow-300' : 'text-yellow-800'
            }`}
          >
            {isSecure ? 'Secure Connection' : 'Insecure Connection'}
          </span>
        </div>
        <p 
          className={`text-sm ${
            isSecure
              ? isDark ? 'text-green-200' : 'text-green-700'
              : isDark ? 'text-yellow-200' : 'text-yellow-700'
          }`}
        >
          {isSecure
            ? 'Your connection is encrypted with HTTPS. Your data is secure.'
            : 'Your connection is not encrypted. Switch to HTTPS for better security.'}
        </p>
      </div>

      {/* Security Features List */}
      <div className="space-y-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon 
                  className={`text-2xl mt-0.5 ${
                    feature.active
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        feature.active
                          ? isDark
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-green-100 text-green-700'
                          : isDark
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feature.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Environment Info */}
      <div 
        className={`mt-6 p-3 rounded-lg text-xs ${
          isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-600'
        }`}
      >
        <strong>Environment:</strong> {securityInfo.environment}
        {securityInfo.environment === 'development' && (
          <span className="ml-2">(Security features may be relaxed for development)</span>
        )}
      </div>
    </div>
  );
};

export default SecurityInfo;
