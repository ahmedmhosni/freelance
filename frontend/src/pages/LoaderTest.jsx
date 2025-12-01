import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const LoaderTest = () => {
  const { isDark } = useTheme();
  const [selectedLoader, setSelectedLoader] = useState(null);

  // Loader Variation 1: Simple Bounce
  const Loader1 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'bounce1 1.5s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes bounce1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 2: Pulse Scale
  const Loader2 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'pulse2 1.5s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes pulse2 {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );

  // Loader Variation 3: Rotate
  const Loader3 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'rotate3 2s linear infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes rotate3 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 4: Fade In/Out
  const Loader4 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'fade4 2s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes fade4 {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Loader Variation 5: Bounce + Rotate
  const Loader5 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'bounceRotate5 2s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes bounceRotate5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          75% { transform: translateY(-15px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 6: Swing
  const Loader6 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'swing6 1.5s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes swing6 {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 7: Bounce with Spinner Ring
  const Loader7 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size + 30,
            height: size + 30,
            border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderTop: `2px solid ${isDark ? '#fff' : '#000'}`,
            borderRadius: '50%',
            animation: 'spin7 1s linear infinite',
          }}
        />
        <div style={{ animation: 'bounce7 1.5s ease-in-out infinite' }}>
          <img
            src="/Asset 7.svg"
            alt="Logo"
            style={{
              height: size,
              filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes spin7 {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bounce7 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 8: Pulse with Dots
  const Loader8 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div
        style={{
          animation: 'pulse8 1.5s ease-in-out infinite',
          marginBottom: '20px',
        }}
      >
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#fff' : '#000',
              animation: `dot8 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse8 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes dot8 {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Loader Variation 9: Float Smooth
  const Loader9 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'float9 3s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes float9 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );

  // Loader Variation 10: Heartbeat
  const Loader10 = ({ size = 80 }) => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ animation: 'heartbeat10 1.5s ease-in-out infinite' }}>
        <img
          src="/Asset 7.svg"
          alt="Logo"
          style={{
            height: size,
            filter: isDark ? 'invert(1) brightness(1.2)' : 'none',
          }}
        />
      </div>
      <style>{`
        @keyframes heartbeat10 {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(1.1); }
          20% { transform: scale(1); }
          30% { transform: scale(1.1); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );

  const loaders = [
    {
      id: 1,
      name: 'Simple Bounce',
      component: Loader1,
      description: 'Clean up and down bounce',
    },
    {
      id: 2,
      name: 'Pulse Scale',
      component: Loader2,
      description: 'Gentle scale pulse',
    },
    {
      id: 3,
      name: 'Rotate',
      component: Loader3,
      description: 'Continuous rotation',
    },
    { id: 4, name: 'Fade', component: Loader4, description: 'Fade in and out' },
    {
      id: 5,
      name: 'Bounce + Tilt',
      component: Loader5,
      description: 'Bounce with slight rotation',
    },
    {
      id: 6,
      name: 'Swing',
      component: Loader6,
      description: 'Pendulum swing motion',
    },
    {
      id: 7,
      name: 'Bounce + Ring',
      component: Loader7,
      description: 'Bounce with spinning ring',
    },
    {
      id: 8,
      name: 'Pulse + Dots',
      component: Loader8,
      description: 'Pulse with animated dots',
    },
    {
      id: 9,
      name: 'Float Smooth',
      component: Loader9,
      description: 'Smooth floating motion',
    },
    {
      id: 10,
      name: 'Heartbeat',
      component: Loader10,
      description: 'Double pulse heartbeat',
    },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '4px' }}>🎨 Loader Variations Test</h1>
        <p className="page-subtitle">Choose your favorite loader animation</p>
      </div>

      {/* Full Page Preview */}
      {selectedLoader && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {React.createElement(selectedLoader.component, { size: 100 })}
          <button
            onClick={() => setSelectedLoader(null)}
            style={{
              padding: '12px 24px',
              backgroundColor: isDark ? '#fff' : '#000',
              color: isDark ? '#000' : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Close Preview
          </button>
        </div>
      )}

      {/* Loader Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {loaders.map((loader) => (
          <div
            key={loader.id}
            className="card"
            style={{
              padding: '24px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              ':hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => setSelectedLoader(loader)}
          >
            <div
              style={{
                backgroundColor: isDark ? '#2d2d44' : '#f8f9fa',
                borderRadius: '12px',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              {React.createElement(loader.component, { size: 70 })}
            </div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              {loader.name}
            </h3>
            <p
              style={{
                fontSize: '13px',
                opacity: 0.7,
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              {loader.description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLoader(loader);
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isDark ? '#8b5cf6' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Preview Full Screen
            </button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="card" style={{ padding: '24px' }}>
        <h2
          style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}
        >
          📝 Instructions
        </h2>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <li style={{ padding: '8px 0' }}>
            1️⃣ Click on any card to preview the loader in full screen
          </li>
          <li style={{ padding: '8px 0' }}>
            2️⃣ Test in both light and dark modes
          </li>
          <li style={{ padding: '8px 0' }}>
            3️⃣ Choose your favorite and let me know the number
          </li>
          <li style={{ padding: '8px 0' }}>
            4️⃣ I'll implement it across your app
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoaderTest;
