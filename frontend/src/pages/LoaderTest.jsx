import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import LogoLoader from '../components/LogoLoader';
import FullPageLoader from '../components/FullPageLoader';

const LoaderTest = () => {
  const { isDark } = useTheme();
  const [showFullPage, setShowFullPage] = useState(false);

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '4px' }}>🎨 Logo Loader Test Page</h1>
        <p className="page-subtitle">
          Admin Only - Test all loader variations
        </p>
      </div>

      {/* Full Page Loader Demo */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          Full Page Loader
        </h2>
        <p style={{ marginBottom: '16px', opacity: 0.7 }}>
          Click to see the full-page overlay loader
        </p>
        <button 
          onClick={() => setShowFullPage(!showFullPage)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {showFullPage ? 'Hide' : 'Show'} Full Page Loader
        </button>
        {showFullPage && <FullPageLoader text="Loading your workspace..." />}
      </div>

      {/* Size Variations */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          Size Variations
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
          marginTop: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>Small (40px)</p>
            <LogoLoader size={40} text="Small" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>Medium (60px)</p>
            <LogoLoader size={60} text="Medium" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>Large (80px)</p>
            <LogoLoader size={80} text="Large" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>Extra Large (120px)</p>
            <LogoLoader size={120} text="Extra Large" />
          </div>
        </div>
      </div>

      {/* Text Variations */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          Text Variations
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginTop: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <LogoLoader size={80} text="Loading..." />
          </div>
          <div style={{ textAlign: 'center' }}>
            <LogoLoader size={80} text="Fetching data..." />
          </div>
          <div style={{ textAlign: 'center' }}>
            <LogoLoader size={80} text="Please wait..." />
          </div>
          <div style={{ textAlign: 'center' }}>
            <LogoLoader size={80} text="" />
            <p style={{ marginTop: '8px', fontSize: '14px', opacity: 0.7 }}>No text</p>
          </div>
        </div>
      </div>

      {/* In Card Example */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          In Card / Section
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#2d2d44' : '#f8f9fa',
            borderRadius: '12px',
            padding: '40px',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LogoLoader size={70} text="Loading clients..." />
          </div>
          <div style={{
            backgroundColor: isDark ? '#2d2d44' : '#f8f9fa',
            borderRadius: '12px',
            padding: '40px',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LogoLoader size={70} text="Loading projects..." />
          </div>
          <div style={{
            backgroundColor: isDark ? '#2d2d44' : '#f8f9fa',
            borderRadius: '12px',
            padding: '40px',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LogoLoader size={70} text="Loading invoices..." />
          </div>
        </div>
      </div>

      {/* Animation Showcase */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          Animation Effects
        </h2>
        <p style={{ marginBottom: '24px', opacity: 0.7 }}>
          Watch the animations: rotating ring, pulsing outer ring, floating logo, color changes, and bouncing dots
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          padding: '60px 20px',
          backgroundColor: isDark ? '#2d2d44' : '#f8f9fa',
          borderRadius: '12px'
        }}>
          <LogoLoader size={120} text="All animations active!" />
        </div>
      </div>

      {/* Usage Code Examples */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          Usage Examples
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Basic Usage:
          </h3>
          <pre style={{
            backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
{`import LogoLoader from './components/LogoLoader';

// Simple loader
<LogoLoader size={80} text="Loading..." />

// No text
<LogoLoader size={60} text="" />

// Custom size
<LogoLoader size={120} text="Please wait..." />`}
          </pre>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Full Page Loader:
          </h3>
          <pre style={{
            backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
{`import FullPageLoader from './components/FullPageLoader';

// Full page overlay
{loading && <FullPageLoader text="Loading..." />}`}
          </pre>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            In Component:
          </h3>
          <pre style={{
            backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
{`const MyComponent = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LogoLoader size={80} text="Loading data..." />
      </div>
    );
  }

  return <div>Your content here</div>;
}`}
          </pre>
        </div>
      </div>

      {/* Features List */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
          ✨ Features
        </h2>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}>
          <li style={{ padding: '8px 0' }}>✅ Rotating ring animation</li>
          <li style={{ padding: '8px 0' }}>✅ Pulsing outer ring</li>
          <li style={{ padding: '8px 0' }}>✅ Color-changing effect</li>
          <li style={{ padding: '8px 0' }}>✅ Floating logo animation</li>
          <li style={{ padding: '8px 0' }}>✅ Bouncing dots indicator</li>
          <li style={{ padding: '8px 0' }}>✅ Dark/Light theme support</li>
          <li style={{ padding: '8px 0' }}>✅ Customizable size</li>
          <li style={{ padding: '8px 0' }}>✅ Customizable text</li>
          <li style={{ padding: '8px 0' }}>✅ Smooth transitions</li>
          <li style={{ padding: '8px 0' }}>✅ Professional animations</li>
        </ul>
      </div>
    </div>
  );
};

export default LoaderTest;
