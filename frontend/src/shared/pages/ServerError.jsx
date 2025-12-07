import { Link } from 'react-router-dom';
import { MdHome, MdRefresh, MdBugReport } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO';

const ServerError = () => {
  const { isDark } = useTheme();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <SEO 
        title="Server Error - 500"
        description="Something went wrong on our end."
      />
      
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <h1 className={`text-9xl font-bold ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>500</h1>
          </div>

          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Server Error
            </h2>
            <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Oops! Something went wrong on our end.
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              We're working to fix the issue. Please try again in a few moments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MdRefresh className="text-xl" />
              Try Again
            </button>

            <Link
              to="/"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <MdHome className="text-xl" />
              Go to Homepage
            </Link>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MdBugReport className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Error persists?
              </h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              If this error continues, please contact our support team.
            </p>
            <Link
              to="/contact"
              className={`inline-block px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;
