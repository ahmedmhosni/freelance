import React, { useState } from 'react';
import LogoLoader from './LogoLoader';
import FullPageLoader from './FullPageLoader';
import { useTheme } from '../context/ThemeContext';

/**
 * LOADER USAGE EXAMPLES
 *
 * This file shows different ways to use the LogoLoader component
 */

// Example 1: Inline Loader (for cards, sections)
export const InlineLoaderExample = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <LogoLoader size={60} text="Loading data..." />
    </div>
  );
};

// Example 2: Full Page Loader (for page transitions)
export const FullPageLoaderExample = () => {
  const [showLoader, setShowLoader] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLoader(!showLoader)}>
        Toggle Full Page Loader
      </button>
      {showLoader && <FullPageLoader text="Loading your workspace..." />}
    </div>
  );
};

// Example 3: Card Loader (for loading states in cards)
export const CardLoader = () => {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        backgroundColor: isDark ? '#2d2d44' : '#fff',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: isDark
          ? '0 4px 6px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LogoLoader size={80} text="Loading..." />
    </div>
  );
};

// Example 4: Small Loader (for buttons, small sections)
export const SmallLoader = () => {
  return <LogoLoader size={40} text="" />;
};

// Example 5: Usage in a component with loading state
export const DataFetchingExample = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({ message: 'Data loaded!' });
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return <LogoLoader size={80} text="Fetching data..." />;
  }

  return <div>{data.message}</div>;
};

/**
 * HOW TO USE IN YOUR COMPONENTS:
 *
 * 1. Import the loader:
 *    import LogoLoader from './components/LogoLoader';
 *    import FullPageLoader from './components/FullPageLoader';
 *
 * 2. Use in loading states:
 *    {loading && <LogoLoader size={80} text="Loading..." />}
 *
 * 3. Full page loader:
 *    {loading && <FullPageLoader text="Loading your workspace..." />}
 *
 * 4. Inline loader:
 *    <div style={{ padding: '20px' }}>
 *      <LogoLoader size={60} text="Loading data..." />
 *    </div>
 *
 * 5. Props:
 *    - size: number (default: 80) - Size of the logo in pixels
 *    - text: string (default: 'Loading...') - Text to display below logo
 */

export default {
  InlineLoaderExample,
  FullPageLoaderExample,
  CardLoader,
  SmallLoader,
  DataFetchingExample,
};
