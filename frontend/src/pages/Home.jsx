import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  MdLightMode, 
  MdDarkMode, 
  MdArrowForward, 
  MdCheckCircle,
  MdSchedule,
  MdAttachMoney,
  MdPeople,
  MdAssignment,
  MdBarChart,
  MdSecurity,
  MdCloud,
  MdSpeed
} from 'react-icons/md';

const Home = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? '#0a0a0a' : '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Stripe-like Animated Gradient Mesh */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        animation: 'wave 20s ease-in-out infinite',
        pointerEvents: 'none',
        opacity: isDark ? 0.6 : 1
      }} />
      
      {/* Large Floating Orb - Blue/Indigo */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(59, 130, 246, 0.25) 40%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      {/* Large Floating Orb - Purple/Pink */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.12) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'float 25s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      
      {/* Accent Orb - Cyan */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '15%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'float 18s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 1)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'scale(1)';
        }}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      {/* Hero Section */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '60px 20px' : '100px 40px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <img 
            src="/Asset 7.svg" 
            alt="Roastify Logo" 
            style={{ 
              height: '56px', 
              marginBottom: '32px',
              filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%)'
            }} 
          />
          
          {/* Hero Text */}
          <h1 style={{
            fontSize: window.innerWidth <= 768 ? '36px' : '56px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '20px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>
            The complete platform for freelancers
          </h1>
          
          <p style={{ 
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Everything you need to run your freelance business efficiently. Track time, manage projects, invoice clients, and grow your business—all in one place.
          </p>

          {/* CTA Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px'
          }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? '#191919' : '#ffffff',
                background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                border: 'none',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? '#ffffff' : '#2f2e2a';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = isDark 
                  ? '0 8px 16px rgba(255, 255, 255, 0.1)' 
                  : '0 8px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Start Free Trial
              <MdArrowForward size={18} />
            </Link>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '80px',
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdCheckCircle size={16} style={{ color: '#2eaadc' }} />
              No credit card required
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdCheckCircle size={16} style={{ color: '#2eaadc' }} />
              14-day free trial
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdCheckCircle size={16} style={{ color: '#2eaadc' }} />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        width: '100%',
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(55, 53, 47, 0.03)',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
        padding: window.innerWidth <= 768 ? '60px 20px' : '80px 40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: window.innerWidth <= 768 ? '28px' : '36px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '16px'
            }}>
              Everything you need to succeed
            </h2>
            <p style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Powerful features designed specifically for freelancers and small teams
            </p>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {[
              { 
                icon: <MdAssignment size={32} />, 
                title: 'Project Management', 
                desc: 'Organize and track all your projects with ease. Set milestones, deadlines, and monitor progress in real-time.' 
              },
              { 
                icon: <MdSchedule size={32} />, 
                title: 'Time Tracking', 
                desc: 'Built-in timer to track billable hours accurately. Never miss a minute of work with automatic time logging.' 
              },
              { 
                icon: <MdAttachMoney size={32} />, 
                title: 'Invoice Generation', 
                desc: 'Create professional invoices in seconds. Support for line items, taxes, and multiple currencies.' 
              },
              { 
                icon: <MdPeople size={32} />, 
                title: 'Client Management', 
                desc: 'Keep all client information organized in one place. Track communication history and project details.' 
              },
              { 
                icon: <MdCheckCircle size={32} />, 
                title: 'Task Management', 
                desc: 'Stay on top of deadlines with priority-based task lists. Assign tasks and track completion status.' 
              },
              { 
                icon: <MdBarChart size={32} />, 
                title: 'Reports & Analytics', 
                desc: 'Gain insights into your business with detailed reports. Track revenue, time spent, and project profitability.' 
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '32px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.12)',
                  borderRadius: '8px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDark 
                    ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  color: '#2eaadc', 
                  marginBottom: '16px',
                  opacity: 0.9
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  marginBottom: '8px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '60px 20px' : '80px 40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '28px' : '36px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '16px'
          }}>
            Why freelancers choose Roastify
          </h2>
          <p style={{
            fontSize: '16px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Built by freelancers, for freelancers. We understand your needs.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
          gap: '32px',
          marginBottom: '60px'
        }}>
          {[
            {
              icon: <MdSpeed size={40} />,
              title: 'Lightning Fast',
              desc: 'Optimized for speed. Get your work done faster with our intuitive interface.'
            },
            {
              icon: <MdSecurity size={40} />,
              title: 'Secure & Private',
              desc: 'Your data is encrypted and secure. We take privacy seriously.'
            },
            {
              icon: <MdCloud size={40} />,
              title: 'Cloud-Based',
              desc: 'Access your work from anywhere. All your data synced in real-time.'
            }
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: isDark ? 'rgba(46, 170, 220, 0.1)' : 'rgba(46, 170, 220, 0.1)',
                color: '#2eaadc',
                marginBottom: '20px'
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                marginBottom: '12px'
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                lineHeight: '1.6'
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        width: '100%',
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(55, 53, 47, 0.03)',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
        padding: window.innerWidth <= 768 ? '60px 20px' : '80px 40px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '28px' : '40px',
            fontWeight: '600',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Ready to take control of your freelance business?
          </h2>
          <p style={{
            fontSize: '16px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Join thousands of freelancers who trust Roastify to manage their business.
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: '600',
              color: isDark ? '#191919' : '#ffffff',
              background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              border: 'none',
              borderRadius: '3px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? '#ffffff' : '#2f2e2a';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = isDark 
                ? '0 8px 16px rgba(255, 255, 255, 0.1)' 
                : '0 8px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Get Started for Free
            <MdArrowForward size={18} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '40px 20px' : '60px 40px',
        position: 'relative',
        zIndex: 1
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(4, 1fr)',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <div>
            <img 
              src="/Asset 7.svg" 
              alt="Roastify Logo" 
              style={{ 
                height: '32px', 
                marginBottom: '16px',
                filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%)'
              }} 
            />
            <p style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              lineHeight: '1.6'
            }}>
              The complete platform for freelancers to manage their business.
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Features', 'Pricing', 'Security', 'Updates'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)';
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)';
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Documentation', 'Help Center', 'Community', 'Status'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)';
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '32px',
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
        }}>
          <p style={{ margin: 0 }}>
            © 2024 Roastify. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)';
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
