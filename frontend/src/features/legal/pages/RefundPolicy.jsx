import { Link } from 'react-router-dom';
import { useTheme, SEO } from '../../../shared';
import { MdArrowBack } from 'react-icons/md';

const RefundPolicy = () => {
  const { isDark } = useTheme();

  return (
    <>
      <SEO 
        title="Refund Policy - Roastify"
        description="Learn about Roastify's refund policy for our freelance management platform services."
        url="https://roastify.online/refund-policy"
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
            Refund Policy
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
            marginBottom: '48px'
          }}>
            Last updated: November 10, 2025
          </p>

          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(55, 53, 47, 0.85)'
          }}>
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                1. Overview
              </h2>
              <p style={{ marginBottom: '16px' }}>
                At Roastify, we strive to provide the best freelance management platform for our users. This Refund Policy outlines the circumstances under which refunds may be issued for our services.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                2. Early Access Program
              </h2>
              <p style={{ marginBottom: '16px' }}>
                During our Early Access Program, Roastify is provided <strong>free of charge</strong> to all registered users. As there are no fees associated with the Early Access Program, refunds are not applicable during this period.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                3. Future Paid Services
              </h2>
              <p style={{ marginBottom: '16px' }}>
                When Roastify transitions to a paid service model, the following refund policy will apply:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <strong>30-Day Money-Back Guarantee:</strong> New subscribers may request a full refund within 30 days of their initial subscription purchase.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Pro-Rated Refunds:</strong> After the initial 30-day period, refunds will be calculated on a pro-rated basis for the unused portion of your subscription.
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Annual Subscriptions:</strong> Annual subscription refunds will be pro-rated based on the number of months remaining in your subscription period.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                4. Refund Eligibility
              </h2>
              <p style={{ marginBottom: '16px' }}>
                Refunds may be requested under the following circumstances:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>Service outages or technical issues that prevent normal use of the platform</li>
                <li style={{ marginBottom: '12px' }}>Billing errors or duplicate charges</li>
                <li style={{ marginBottom: '12px' }}>Dissatisfaction with the service within the 30-day guarantee period</li>
                <li style={{ marginBottom: '12px' }}>Cancellation of service before the end of the billing period</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                5. Non-Refundable Items
              </h2>
              <p style={{ marginBottom: '16px' }}>
                The following are not eligible for refunds:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>Partial months of service already consumed</li>
                <li style={{ marginBottom: '12px' }}>Add-on services or features purchased separately</li>
                <li style={{ marginBottom: '12px' }}>Accounts terminated due to violation of our Terms of Service</li>
                <li style={{ marginBottom: '12px' }}>Promotional or discounted subscriptions (unless otherwise stated)</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                6. How to Request a Refund
              </h2>
              <p style={{ marginBottom: '16px' }}>
                To request a refund, please contact our support team:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Email:</strong> <a href="mailto:support@roastify.online" style={{ color: '#6366f1', textDecoration: 'none' }}>support@roastify.online</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Phone:</strong> +20 1101212909
                </li>
              </ul>
              <p style={{ marginBottom: '16px' }}>
                Please include your account email, subscription details, and reason for the refund request. We will process your request within 5-7 business days.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                7. Processing Time
              </h2>
              <p style={{ marginBottom: '16px' }}>
                Once approved, refunds will be processed within 7-10 business days. The refund will be credited to the original payment method used for the purchase.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                8. Cancellation Policy
              </h2>
              <p style={{ marginBottom: '16px' }}>
                You may cancel your subscription at any time through your account settings. Upon cancellation:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>You will retain access to paid features until the end of your current billing period</li>
                <li style={{ marginBottom: '12px' }}>No further charges will be made to your account</li>
                <li style={{ marginBottom: '12px' }}>Your data will be retained for 30 days after cancellation, after which it may be permanently deleted</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                9. Changes to This Policy
              </h2>
              <p style={{ marginBottom: '16px' }}>
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. Your continued use of Roastify after any changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '16px',
                color: isDark ? '#ffffff' : '#37352f'
              }}>
                10. Contact Us
              </h2>
              <p style={{ marginBottom: '16px' }}>
                If you have any questions about this Refund Policy, please contact us:
              </p>
              <ul style={{
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Email:</strong> <a href="mailto:support@roastify.online" style={{ color: '#6366f1', textDecoration: 'none' }}>support@roastify.online</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Phone:</strong> +20 1101212909
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <strong>Address:</strong> Cairo, Egypt
                </li>
              </ul>
            </section>
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
            <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
          </div>
          <div>© {new Date().getFullYear()} Roastify. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
};

export default RefundPolicy;
