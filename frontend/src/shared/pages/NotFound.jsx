import { Link } from 'react-router-dom';
import { MdHome, MdArrowBack, MdSearch } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO';

/**
 * 404 Not Found Page
 * 
 * User-friendly error page with helpful navigation
 */
const NotFound = () => {
  const { isDark } = useTheme();

  return (
    <>
      <SEO 
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist."
      />
      
      <div 
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <h1 
              className={`text-9xl font-bold ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 
              className={`text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Page Not Found
            </h2>
            <p 
              className={`text-lg mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Oops! The page you're looking for doesn't exist.
            </p>
            <p 
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              It might have been moved or deleted, or you may have mistyped the URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <MdHome className="text-xl" />
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <MdArrowBack className="text-xl" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div 
            className={`p-6 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <MdSearch className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Looking for something?
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/dashboard"
                className={`p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/clients"
                className={`p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Clients
              </Link>
              <Link
                to="/projects"
                className={`p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Projects
              </Link>
              <Link
                to="/invoices"
                className={`p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Invoices
              </Link>
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-8">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Need help?{' '}
              <Link
                to="/contact"
                className={`underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
