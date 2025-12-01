import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdLightMode, MdDarkMode, MdArrowForward } from 'react-icons/md';
import FeatureSlider from '../components/home/FeatureSlider';
import AnnouncementBanner from '../components/AnnouncementBanner';
import SEO from '../components/SEO';
import axios from 'axios';

const Home = () => {
  const { isDark, toggleTheme } = useTheme();
  const [version, setVersion] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchVersion = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(
        `${apiUrl}/api/changelog/current-version`
      );
      setVersion(response.data);
    } catch (error) {
      console.error('Failed to fetch version:', error);
      setVersion({ version: '1.0.0' });
    }
  };

  useEffect(() => {
    fetchVersion();
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SEO
        title="Roastify - Every brilliant idea needs to be roasted | Freelancer Management"
        description="Everything you need to run your freelance business. Manage clients, track time, create invoices, and get paid faster. Simple tools for freelancers, designers, consultants, and more."
        keywords="freelancer management, time tracking, invoicing, client management, project management, freelance tools, invoice generator, time tracker, freelancer software, freelance business"
        url="https://roastify.online"
      />

      <div
        style={{
          minHeight: '100vh',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          background: isDark ? '#0a0a0a' : '#ffffff',
        }}
      >
        {/* Background Effects */}
        <div
          style={{
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
            opacity: isDark ? 0.6 : 1,
          }}
        />

        {/* Animated Orb 1 - Blue/Indigo */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 20s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Orb 2 - Purple */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
            filter: 'blur(90px)',
            animation: 'float 25s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Orb 3 - Cyan */}
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'float 18s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Orb 4 - Pink */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(85px)',
            animation: 'float 22s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: isDark
              ? 'rgba(10, 10, 10, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(55, 53, 47, 0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '16px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <img
              src="/Asset 7.svg"
              alt="Roastify"
              style={{
                height: '32px',
                filter: isDark ? 'brightness(0) invert(1)' : 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(55, 53, 47, 0.16)',
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.8)',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(55, 53, 47, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
              </button>

              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="header-btn-primary"
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
                    display: 'inline-block',
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="header-btn-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                      background: 'transparent',
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.15)'
                        : '1px solid rgba(55, 53, 47, 0.16)',
                      borderRadius: '3px',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      display: 'inline-block',
                    }}
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="header-btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDark ? '#191919' : '#ffffff',
                      background: isDark
                        ? 'rgba(255, 255, 255, 0.9)'
                        : '#37352f',
                      border: 'none',
                      borderRadius: '3px',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      display: 'inline-block',
                    }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Hero Section */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '80px 40px 80px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: isDark
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6366f1',
              marginBottom: '32px',
              width: 'fit-content',
              margin: '0 auto 32px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#6366f1',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            Early Access • Limited spots available
          </div>

          <h1
            style={{
              fontSize: window.innerWidth <= 768 ? '42px' : '60px',
              fontWeight: '700',
              color: isDark ? '#ffffff' : '#37352f',
              marginBottom: '24px',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
            }}
          >
            Every brilliant idea{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              needs to be roasted
            </span>
          </h1>

          <p
            style={{
              fontSize: '20px',
              fontWeight: '500',
              color: isDark
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(55, 53, 47, 0.75)',
              maxWidth: '580px',
              margin: '0 auto 16px',
              lineHeight: '1.4',
            }}
          >
            Everything you need. Nothing you don't.
          </p>

          <p
            style={{
              fontSize: '16px',
              fontWeight: '400',
              color: isDark
                ? 'rgba(255, 255, 255, 0.65)'
                : 'rgba(55, 53, 47, 0.6)',
              maxWidth: '540px',
              margin: '0 auto 36px',
              lineHeight: '1.6',
            }}
          >
            Manage clients, track time, get paid. Simple tools for freelancers.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '24px',
            }}
          >
            <Link
              to="/register"
              className="hero-btn-primary"
              style={{
                padding: '16px 32px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Join the early access
              <MdArrowForward size={20} />
            </Link>

            <Link
              to="/login"
              className="hero-btn-secondary"
              style={{
                padding: '16px 32px',
                fontSize: '15px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                background: 'transparent',
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                display: 'inline-block',
              }}
            >
              Sign in
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>🔥</span> Early access
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>✨</span> Free registration
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span> Limited spots
            </span>
          </div>
        </div>

        {/* Feature Carousel Section */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)'
              : 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%)',
            borderTop: isDark
              ? '1px solid rgba(99, 102, 241, 0.1)'
              : '1px solid rgba(99, 102, 241, 0.08)',
            borderBottom: isDark
              ? '1px solid rgba(168, 85, 247, 0.1)'
              : '1px solid rgba(168, 85, 247, 0.08)',
            position: 'relative',
            zIndex: 1,
            marginTop: '60px',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FeatureSlider isDark={isDark} />
        </div>

        {/* Role-Based Portrait Cards */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '100px 40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '56px',
            }}
          >
            <h2
              style={{
                fontSize: window.innerWidth <= 768 ? '36px' : '48px',
                fontWeight: '700',
                color: isDark ? '#ffffff' : '#37352f',
                marginBottom: '16px',
                letterSpacing: '-0.03em',
                lineHeight: '1.2',
              }}
            >
              Built for{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                every freelancer
              </span>
            </h2>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '400',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.65)'
                  : 'rgba(55, 53, 47, 0.65)',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}
            >
              Manage clients, track time, create invoices, and grow your
              business — all in one place
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '1400px',
              margin: '0 auto',
            }}
          >
            {[
              {
                role: 'Designers',
                image: '/roles/designer.jpg',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                hoverColor: '#764ba2',
                description:
                  'Track design projects, manage revisions, bill by milestone, and create professional invoices',
              },
              {
                role: 'Marketers',
                image: '/roles/marketer.jpg',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                hoverColor: '#00f2fe',
                description:
                  'Manage campaigns, track client hours, generate reports, and invoice marketing services',
              },
              {
                role: 'Consultants',
                image: '/roles/consultant.jpg',
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                hoverColor: '#38f9d7',
                description:
                  'Schedule sessions, track billable hours, manage clients, and create professional invoices',
              },
              {
                role: 'Account Managers',
                image: '/roles/account-manager.jpg',
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                hoverColor: '#fa709a',
                description:
                  'Oversee client relationships, track project progress, manage tasks, and handle billing',
              },
              {
                role: 'Cyber Security',
                image: '/roles/cybersecurity.jpg',
                gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                hoverColor: '#30cfd0',
                description:
                  'Manage security audits, track assessment hours, organize reports, and invoice clients',
              },
              {
                role: 'Data Engineers',
                image: '/roles/data-engineer.jpg',
                gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                hoverColor: '#fed6e3',
                description:
                  'Track data projects, manage pipeline tasks, log development time, and create invoices',
              },
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
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(55, 53, 47, 0.08)',
                }}
                onMouseEnter={(e) => {
                  const overlay =
                    e.currentTarget.querySelector('.role-overlay');
                  if (overlay) overlay.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.border = `1px solid ${item.hoverColor}`;
                }}
                onMouseLeave={(e) => {
                  const overlay =
                    e.currentTarget.querySelector('.role-overlay');
                  if (overlay) overlay.style.opacity = '0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.border = isDark
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(55, 53, 47, 0.08)';
                }}
              >
                {/* Background Image or Gradient */}
                {item.image ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'grayscale(20%)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: item.gradient,
                    }}
                  />
                )}

                {/* Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: item.gradient,
                    opacity: 0.3,
                    mixBlendMode: 'multiply',
                  }}
                />

                {/* Bottom Gradient for Text Readability */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background:
                      'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                    zIndex: 1,
                  }}
                />

                {/* Role Title */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    zIndex: 2,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {item.role}
                  </h3>
                </div>

                {/* Hover Overlay */}
                <div
                  className="role-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(135deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.88) 100%)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px',
                    opacity: 0,
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 3,
                  }}
                >
                  <h4
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '12px',
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.role}
                  </h4>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.6',
                      textAlign: 'center',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Text */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: isDark
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 53, 47, 0.5)',
              marginTop: '32px',
              fontStyle: 'italic',
            }}
          >
            ...and many more freelancers can use it
          </p>
        </div>

        {/* CTA Section */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)'
              : 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)',
            borderTop: isDark
              ? '1px solid rgba(99, 102, 241, 0.2)'
              : '1px solid rgba(99, 102, 241, 0.15)',
            borderBottom: isDark
              ? '1px solid rgba(168, 85, 247, 0.15)'
              : '1px solid rgba(168, 85, 247, 0.12)',
            position: 'relative',
            zIndex: 1,
            boxShadow: isDark
              ? '0 -8px 32px rgba(99, 102, 241, 0.15), 0 8px 32px rgba(168, 85, 247, 0.15)'
              : '0 -8px 32px rgba(99, 102, 241, 0.08), 0 8px 32px rgba(168, 85, 247, 0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '100px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6366f1',
                marginBottom: '32px',
                boxShadow: isDark
                  ? '0 4px 16px rgba(99, 102, 241, 0.2)'
                  : '0 4px 16px rgba(99, 102, 241, 0.15)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  animation: 'pulse 2s ease-in-out infinite',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
                }}
              />
              Early Access Program
            </div>

            <h2
              style={{
                fontSize: window.innerWidth <= 768 ? '36px' : '48px',
                fontWeight: '700',
                color: isDark ? '#ffffff' : '#37352f',
                marginBottom: '20px',
                lineHeight: '1.2',
                letterSpacing: '-0.03em',
              }}
            >
              Ready to{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                get started?
              </span>
            </h2>
            <p
              style={{
                fontSize: '17px',
                fontWeight: '400',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(55, 53, 47, 0.7)',
                marginBottom: '40px',
                lineHeight: '1.6',
                maxWidth: '620px',
                margin: '0 auto 40px',
              }}
            >
              Join our early access program today. Free forever for early
              adopters. Limited spots available.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '32px',
              }}
            >
              <Link
                to="/register"
                className="cta-btn-primary"
                style={{
                  padding: '16px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Get started
                <MdArrowForward size={20} />
              </Link>

              <Link
                to="/login"
                className="cta-btn-secondary"
                style={{
                  padding: '16px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                  background: 'transparent',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Sign in
              </Link>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.45)'
                  : 'rgba(55, 53, 47, 0.45)',
                marginTop: '24px',
                lineHeight: '1.5',
              }}
            >
              No credit card required • Cancel anytime
              <br />
              By signing up, you agree to our{' '}
              <Link
                to="/terms"
                style={{
                  color: 'inherit',
                  textDecoration: 'underline',
                  opacity: 0.7,
                }}
              >
                Terms
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(55, 53, 47, 0.08)',
            padding: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                fontSize: '13px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '12px',
              }}
            >
              <Link
                to="/terms"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Terms
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link
                to="/privacy"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Privacy
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link
                to="/public-status"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                Status
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link
                to="/changelog"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Changelog
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <Link
                to="/announcements"
                style={{
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Announcements
              </Link>
              <span style={{ opacity: 0.3 }}>•</span>
              <a
                href="https://instagram.com/roastify.online"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.5,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                aria-label="Follow us on Instagram"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <div
              style={{
                fontSize: '13px',
                color: isDark
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(55, 53, 47, 0.5)',
                marginBottom: '12px',
              }}
            >
              © {new Date().getFullYear()} Roastify. All rights reserved.
            </div>

            {version && (
              <div
                style={{
                  fontSize: '11px',
                  color: isDark
                    ? 'rgba(255, 255, 255, 0.35)'
                    : 'rgba(55, 53, 47, 0.35)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  to="/changelog"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isDark
                      ? 'rgba(255, 255, 255, 0.6)'
                      : 'rgba(55, 53, 47, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = isDark
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'rgba(55, 53, 47, 0.35)';
                  }}
                  title="View changelog"
                >
                  v{version.version}
                  {version.version_name && ` - ${version.version_name}`}
                </Link>
              </div>
            )}
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

        /* Minimal hover effects for all buttons */
        a[href="/register"]:hover,
        a[href="/login"]:hover {
          opacity: 0.85;
        }
      `}</style>
      </div>
    </>
  );
};

export default Home;
