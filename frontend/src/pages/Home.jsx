import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode, MdArrowForward } from 'react-icons/md';
import FeatureSlider from '../components/home/FeatureSlider';

const Home = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#0a0a0a' : '#ffffff'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
        animation: 'wave 20s ease-in-out infinite',
        pointerEvents: 'none',
        opacity: isDark ? 0.6 : 1
      }} />
      
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'float 25s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify" 
            style={{ 
              height: '32px',
              filter: isDark ? 'brightness(0) invert(1)' : 'none'
            }} 
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
            </button>
            
            <Link
              to="/login"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                display: 'inline-block'
              }}
            >
              Sign in
            </Link>
            
            <Link
              to="/register"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#191919' : '#ffffff',
                background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                border: 'none',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                display: 'inline-block'
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '140px 40px 80px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#6366f1',
          marginBottom: '32px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#6366f1',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          Early Access • Limited spots available
        </div>

        <h1 style={{
          fontSize: window.innerWidth <= 768 ? '36px' : '48px',
          fontWeight: '600',
          color: isDark ? '#ffffff' : '#37352f',
          marginBottom: '16px',
          lineHeight: '1.2',
          letterSpacing: '-0.02em'
        }}>
          Every brilliant idea{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            needs to be roasted
          </span>
        </h1>

        <p style={{
          fontSize: '15px',
          color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.6)',
          maxWidth: '520px',
          margin: '0 auto 32px',
          lineHeight: '1.5'
        }}>
          Manage clients, track time, get paid. Simple tools for freelancers.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              border: 'none',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Get started free
            <MdArrowForward size={18} />
          </Link>
          
          <Link
            to="/login"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-block'
            }}
          >
            Sign in
          </Link>
        </div>

        <p style={{
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
          marginTop: '20px'
        }}>
          🔥 Early access • Free registration • Limited spots
        </p>
      </div>

      {/* Feature Carousel Section */}
      <div style={{
        background: isDark 
          ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)'
          : 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%)',
        borderTop: isDark ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid rgba(99, 102, 241, 0.08)',
        borderBottom: isDark ? '1px solid rgba(168, 85, 247, 0.1)' : '1px solid rgba(168, 85, 247, 0.08)',
        position: 'relative',
        zIndex: 1,
        marginTop: '40px'
      }}>
        <FeatureSlider isDark={isDark} />
      </div>

      {/* Role-Based Portrait Cards */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 40px 80px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#37352f',
            marginBottom: '8px',
            letterSpacing: '-0.01em'
          }}>
            Built for your role
          </h2>
          <p style={{
            fontSize: '14px',
            color: isDark ? 'rgba(255, 255, 255, 0.55)' : 'rgba(55, 53, 47, 0.55)',
            maxWidth: '480px',
            margin: '0 auto'
          }}>
            For every freelancer
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '24px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {[
            {
              role: 'Designers',
              image: '/roles/designer.jpg',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              description: 'Manage design projects, track revisions, and invoice clients seamlessly'
            },
            {
              role: 'Marketers',
              image: '/roles/marketer.jpg',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              description: 'Campaign tracking, client reporting, and performance analytics in one place'
            },
            {
              role: 'Consultants',
              image: '/roles/consultant.jpg',
              gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              description: 'Session scheduling, time billing, and professional client management'
            },
            {
              role: 'Account Managers',
              image: '/roles/account-manager.jpg',
              gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              description: 'Client relationship management, project oversight, and seamless communication'
            },
            {
              role: 'Cyber Security',
              image: '/roles/cybersecurity.jpg',
              gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              description: 'Security audits, compliance tracking, and client vulnerability assessments'
            },
            {
              role: 'Data Engineers',
              image: '/roles/data-engineer.jpg',
              gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              description: 'Pipeline projects, data analysis tracking, and technical documentation'
            }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)'
              }}
              onMouseEnter={(e) => {
                const overlay = e.currentTarget.querySelector('.role-overlay');
                if (overlay) overlay.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 12px 32px rgba(0, 0, 0, 0.4)' 
                  : '0 12px 32px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                const overlay = e.currentTarget.querySelector('.role-overlay');
                if (overlay) overlay.style.opacity = '0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Background Image or Gradient */}
              {item.image ? (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(20%)'
                }} />
              ) : (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: item.gradient
                }} />
              )}

              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: item.gradient,
                opacity: 0.3,
                mixBlendMode: 'multiply'
              }} />

              {/* Bottom Gradient for Text Readability */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                zIndex: 1
              }} />

              {/* Role Title */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 2
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  {item.role}
                </h3>
              </div>

              {/* Hover Overlay */}
              <div
                className="role-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 3
                }}
              >
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {item.role}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: '1.5',
                  textAlign: 'center'
                }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: isDark 
          ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
          : 'linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
        borderTop: isDark ? '2px solid rgba(99, 102, 241, 0.15)' : '2px solid rgba(99, 102, 241, 0.12)',
        borderBottom: isDark ? '1px solid rgba(168, 85, 247, 0.1)' : '1px solid rgba(168, 85, 247, 0.08)',
        position: 'relative',
        zIndex: 1,
        marginTop: '60px',
        boxShadow: isDark 
          ? '0 -4px 20px rgba(99, 102, 241, 0.1), 0 4px 20px rgba(168, 85, 247, 0.1)'
          : '0 -4px 20px rgba(99, 102, 241, 0.05), 0 4px 20px rgba(168, 85, 247, 0.05)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 40px 100px',
          textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '500',
          color: '#6366f1',
          marginBottom: '20px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#6366f1',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          Early Access Program
        </div>

        <h2 style={{
          fontSize: window.innerWidth <= 768 ? '28px' : '40px',
          fontWeight: '600',
          color: isDark ? '#ffffff' : '#37352f',
          marginBottom: '16px',
          lineHeight: '1.2',
          letterSpacing: '-0.01em'
        }}>
          Ready to{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            get started?
          </span>
        </h2>
        <p style={{
          fontSize: '15px',
          color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.65)',
          marginBottom: '32px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Join our early access program today. Free forever for early adopters. Limited spots available.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
          <Link
            to="/register"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              border: 'none',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-block'
            }}
          >
            Get started
          </Link>
          
          <Link
            to="/login"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-block'
            }}
          >
            Sign in
          </Link>
        </div>

        <p style={{
          fontSize: '12px',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
          marginTop: '16px'
        }}>
          No credit card required • Cancel anytime • By signing up, you agree to our{' '}
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms</Link>
        </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
        }}>
          <div>© 2024 Roastify. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Privacy</Link>
            <Link to="/public-status" style={{ color: 'inherit', textDecoration: 'none' }}>Status</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
