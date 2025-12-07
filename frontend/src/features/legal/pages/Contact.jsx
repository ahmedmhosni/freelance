import { Link } from 'react-router-dom';
import { useTheme, SEO } from '../../../shared';
import { MdArrowBack, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Contact = () => {
  const { isDark } = useTheme();

  return (
    <>
      <SEO 
        title="Contact Us - Roastify"
        description="Get in touch with the Roastify team. We're here to help with any questions about our freelance management platform."
        url="https://roastify.online/contact"
      />
      
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#ffffff',
        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
      }}>
        {/* Header */}
        <header style={{
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
          padding: '16px 40px',
          background: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.15s ease'
              }}
            >
              <MdArrowBack size={18} />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Content */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '60px 40px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-0.03em'
          }}>
            Contact Us
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          {/* Contact Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '60px'
          }}>
            {/* Email Card */}
            <div style={{
              padding: '32px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#6366f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.08)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff'
              }}>
                <MdEmail size={28} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                Email
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '16px'
              }}>
                Send us an email anytime
              </p>
              <a
                href="mailto:support@roastify.online"
                style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  wordBreak: 'break-all'
                }}
              >
                support@roastify.online
              </a>
            </div>

            {/* Phone Card */}
            <div style={{
              padding: '32px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.08)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff'
              }}>
                <MdPhone size={28} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                Phone
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '16px'
              }}>
                Call us during business hours
              </p>
              <a
                href="tel:+201101212909"
                style={{
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                +20 1101212909
              </a>
            </div>

            {/* Location Card */}
            <div style={{
              padding: '32px',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#ec4899';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(55, 53, 47, 0.08)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#ffffff'
              }}>
                <MdLocationOn size={28} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                Location
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
                marginBottom: '16px'
              }}>
                Visit us at our office
              </p>
              <p style={{
                color: '#ec4899',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Cairo, Egypt
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div style={{
            padding: '40px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)',
            border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '8px',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '20px',
              color: isDark ? '#ffffff' : '#37352f'
            }}>
              Business Hours
            </h2>
            <div style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)'
            }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM (EET)
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>Saturday:</strong> 10:00 AM - 4:00 PM (EET)
              </p>
              <p>
                <strong>Sunday:</strong> Closed
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '24px',
              color: isDark ? '#ffffff' : '#37352f'
            }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                How quickly will I receive a response?
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
              }}>
                We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                Do you offer technical support?
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
              }}>
                Yes! Our support team is available to help with any technical issues or questions about using Roastify. Contact us via email or phone.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                Can I schedule a demo?
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
              }}>
                Absolutely! Email us at support@roastify.online to schedule a personalized demo of our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(55, 53, 47, 0.08)',
          padding: '40px',
          textAlign: 'center',
          fontSize: '13px',
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Home</Link>
            <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Terms</Link>
            <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Privacy</Link>
            <Link to="/refund-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</Link>
          </div>
          <div>© {new Date().getFullYear()} Roastify. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
};

export default Contact;
