import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, SEO } from '../../../shared';
import { 
  MdLightMode, 
  MdDarkMode, 
  MdArrowForward,
  MdCheck
} from 'react-icons/md';
import axios from 'axios';
import { logger } from '../../../shared/utils/logger';

const HomeInternational = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [version, setVersion] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchVersion();
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchVersion = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/changelog/current-version`);
      setVersion(response.data);
    } catch (error) {
      logger.error('Failed to fetch version:', error);
      setVersion({ version: '1.5.0' });
    }
  };

  const features = [
    {
      title: 'Time Tracking',
      description: 'Track your work hours with a simple one-click timer. Start, pause, and log time entries effortlessly.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clock Circle */}
          <circle cx="70" cy="70" r="55" fill="url(#timeGrad)" opacity="0.2">
            <animate attributeName="r" values="53;57;53" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="70" r="45" stroke="url(#timeGrad)" strokeWidth="4" fill="none">
            <animate attributeName="stroke-dasharray" values="0,283;283,0" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Clock Hands */}
          <line x1="70" y1="70" x2="70" y2="40" stroke="url(#timeGrad)" strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 70 70;360 70 70" dur="8s" repeatCount="indefinite" />
          </line>
          <line x1="70" y1="70" x2="90" y2="70" stroke="url(#timeGrad)" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 70 70;360 70 70" dur="2s" repeatCount="indefinite" />
          </line>
          {/* Center Dot */}
          <circle cx="70" cy="70" r="4" fill="url(#timeGrad)" />
          {/* Play Button */}
          <circle cx="100" cy="100" r="15" fill="url(#timeGrad)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M96 95L106 100L96 105Z" fill="white" />
          <defs>
            <linearGradient id="timeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: 'Projects & Tasks',
      description: 'Organize your work with projects and tasks. Track progress, set deadlines, and stay on top of everything.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Folder */}
          <path d="M25 45L25 95C25 100 28 103 33 103H107C112 103 115 100 115 95V55C115 50 112 47 107 47H65L55 37H33C28 37 25 40 25 45Z" fill="url(#projectGrad)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.4;0.3" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M25 45L25 95C25 100 28 103 33 103H107C112 103 115 100 115 95V55C115 50 112 47 107 47H65L55 37H33C28 37 25 40 25 45Z" fill="url(#projectGrad)" opacity="0.8" />
          {/* Tasks - Checkboxes */}
          <rect x="40" y="60" width="15" height="15" rx="3" fill="url(#projectGrad)">
            <animate attributeName="y" values="60;58;60" dur="2s" repeatCount="indefinite" />
          </rect>
          <path d="M43 67L47 71L52 64" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="2s" repeatCount="indefinite" />
          </path>
          <rect x="60" y="60" width="40" height="4" rx="2" fill="url(#projectGrad)" opacity="0.5" />
          
          <rect x="40" y="80" width="15" height="15" rx="3" stroke="url(#projectGrad)" strokeWidth="2" fill="none">
            <animate attributeName="y" values="80;78;80" dur="2.5s" repeatCount="indefinite" />
          </rect>
          <rect x="60" y="80" width="35" height="4" rx="2" fill="url(#projectGrad)" opacity="0.4" />
          
          <defs>
            <linearGradient id="projectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: 'Invoices',
      description: 'Create professional invoices in seconds. Add line items, calculate totals, and send to clients instantly.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document */}
          <rect x="35" y="25" width="70" height="90" rx="4" fill="url(#invoiceGrad)" opacity="0.2">
            <animate attributeName="y" values="25;22;25" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="35" y="25" width="70" height="90" rx="4" fill="url(#invoiceGrad)" opacity="0.9" />
          {/* Header Lines */}
          <rect x="45" y="35" width="30" height="4" rx="2" fill="white" opacity="0.9" />
          <rect x="45" y="43" width="20" height="3" rx="1.5" fill="white" opacity="0.7" />
          {/* Invoice Lines */}
          <rect x="45" y="55" width="50" height="3" rx="1.5" fill="white" opacity="0.6">
            <animate attributeName="width" values="50;55;50" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="45" y="63" width="45" height="3" rx="1.5" fill="white" opacity="0.6">
            <animate attributeName="width" values="45;50;45" dur="3.5s" repeatCount="indefinite" />
          </rect>
          <rect x="45" y="71" width="40" height="3" rx="1.5" fill="white" opacity="0.6">
            <animate attributeName="width" values="40;45;40" dur="4s" repeatCount="indefinite" />
          </rect>
          {/* Total Box */}
          <rect x="45" y="85" width="50" height="20" rx="3" fill="white" opacity="0.2" />
          <rect x="50" y="90" width="15" height="4" rx="2" fill="white" opacity="0.9" />
          <rect x="70" y="90" width="20" height="4" rx="2" fill="white" opacity="0.9">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </rect>
          {/* Dollar Sign */}
          <circle cx="110" cy="100" r="18" fill="url(#invoiceGrad)" opacity="0.9">
            <animate attributeName="r" values="18;20;18" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <text x="110" y="108" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">$</text>
          <defs>
            <linearGradient id="invoiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: 'Client Management',
      description: 'Keep all your client information organized. Contact details, projects, and billing history in one place.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Person */}
          <circle cx="70" cy="55" r="20" fill="url(#clientGrad)">
            <animate attributeName="r" values="20;22;20" dur="3s" repeatCount="indefinite" />
          </circle>
          <path d="M45 95C45 80 55 75 70 75C85 75 95 80 95 95V105H45V95Z" fill="url(#clientGrad)" />
          {/* Small Person 1 */}
          <circle cx="35" cy="65" r="12" fill="url(#clientGrad)" opacity="0.6">
            <animate attributeName="cy" values="65;63;65" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <path d="M20 95C20 87 25 83 35 83C45 83 50 87 50 95V100H20V95Z" fill="url(#clientGrad)" opacity="0.6" />
          {/* Small Person 2 */}
          <circle cx="105" cy="65" r="12" fill="url(#clientGrad)" opacity="0.6">
            <animate attributeName="cy" values="65;63;65" dur="3s" repeatCount="indefinite" />
          </circle>
          <path d="M90 95C90 87 95 83 105 83C115 83 120 87 120 95V100H90V95Z" fill="url(#clientGrad)" opacity="0.6" />
          {/* Connection Lines */}
          <line x1="47" y1="65" x2="58" y2="60" stroke="url(#clientGrad)" strokeWidth="2" opacity="0.4" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="93" y1="65" x2="82" y2="60" stroke="url(#clientGrad)" strokeWidth="2" opacity="0.4" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          <defs>
            <linearGradient id="clientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: 'Reports & Analytics',
      description: 'Visualize your business data with charts and reports. Track revenue, time spent, and project profitability.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chart Background */}
          <rect x="25" y="25" width="90" height="90" rx="8" fill="url(#reportGrad)" opacity="0.1" />
          {/* Bar Chart */}
          <rect x="35" y="75" width="12" height="30" rx="2" fill="url(#reportGrad)" opacity="0.8">
            <animate attributeName="height" values="30;35;30" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y" values="75;70;75" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="52" y="60" width="12" height="45" rx="2" fill="url(#reportGrad)" opacity="0.8">
            <animate attributeName="height" values="45;50;45" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="60;55;60" dur="2.5s" repeatCount="indefinite" />
          </rect>
          <rect x="69" y="50" width="12" height="55" rx="2" fill="url(#reportGrad)" opacity="0.8">
            <animate attributeName="height" values="55;60;55" dur="3s" repeatCount="indefinite" />
            <animate attributeName="y" values="50;45;50" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="86" y="65" width="12" height="40" rx="2" fill="url(#reportGrad)" opacity="0.8">
            <animate attributeName="height" values="40;45;40" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="65;60;65" dur="2.2s" repeatCount="indefinite" />
          </rect>
          {/* Trend Line */}
          <path d="M35 85 L52 70 L69 60 L86 75 L103 55" stroke="url(#reportGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
            <animate attributeName="stroke-dasharray" values="0,200;200,0" dur="3s" repeatCount="indefinite" />
          </path>
          {/* Floating Stats */}
          <circle cx="105" cy="40" r="12" fill="url(#reportGrad)" opacity="0.9">
            <animate attributeName="cy" values="40;37;40" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="105" y="45" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">↑</text>
          <defs>
            <linearGradient id="reportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: 'Team Collaboration',
      description: 'Work together seamlessly. Assign tasks, share projects, and keep everyone on the same page.',
      svg: (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central Hub */}
          <circle cx="70" cy="70" r="18" fill="url(#teamGrad)">
            <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Team Members Around */}
          <circle cx="70" cy="30" r="12" fill="url(#teamGrad)" opacity="0.7">
            <animate attributeName="cy" values="30;28;30" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="70" r="12" fill="url(#teamGrad)" opacity="0.7">
            <animate attributeName="cx" values="110;112;110" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="110" r="12" fill="url(#teamGrad)" opacity="0.7">
            <animate attributeName="cy" values="110;112;110" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="70" r="12" fill="url(#teamGrad)" opacity="0.7">
            <animate attributeName="cx" values="30;28;30" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* Connection Lines */}
          <line x1="70" y1="52" x2="70" y2="42" stroke="url(#teamGrad)" strokeWidth="2" opacity="0.5" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="88" y1="70" x2="98" y2="70" stroke="url(#teamGrad)" strokeWidth="2" opacity="0.5" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="70" y1="88" x2="70" y2="98" stroke="url(#teamGrad)" strokeWidth="2" opacity="0.5" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="52" y1="70" x2="42" y2="70" stroke="url(#teamGrad)" strokeWidth="2" opacity="0.5" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />
          </line>
          {/* Checkmark in Center */}
          <path d="M63 70L68 75L77 65" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="teamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
    { value: '50+', label: 'Countries' }
  ];

  return (
    <>
      <SEO 
        title="Roastify - Freelancer Management Platform"
        description="The modern way to manage your freelance business. Track time, manage clients, create invoices."
        keywords="freelancer management, time tracking, invoicing, client management"
        url="https://roastify.online"
      />
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Helvetica Neue\', sans-serif',
        background: isDark ? '#000000' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000'
      }}>
        {/* Navigation */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              cursor: 'pointer'
            }} onClick={() => navigate('/')}>
              Roastify
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDark ? '#ffffff' : '#000000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
              >
                {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
              </button>
              
              {!isLoggedIn && (
                <Link
                  to="/login"
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isDark ? '#ffffff' : '#000000',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Sign in
                </Link>
              )}
              
              <Link
                to={isLoggedIn ? '/app/dashboard' : '/register'}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  background: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                {isLoggedIn ? 'Dashboard' : 'Get started'}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '160px 24px 120px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Floating SVG Character - Left */}
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '20px',
            opacity: 0.6
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="30" fill="url(#heroGrad1)" opacity="0.3">
                <animate attributeName="cy" values="40;35;40" dur="3s" repeatCount="indefinite" />
              </circle>
              <path d="M40 20C30 20 22 28 22 38C22 48 30 56 40 56C50 56 58 48 58 38C58 28 50 20 40 20Z" fill="url(#heroGrad1)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" />
              </path>
              <circle cx="33" cy="35" r="3" fill="white" />
              <circle cx="47" cy="35" r="3" fill="white" />
              <path d="M32 45Q40 50 48 45" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating SVG Character - Right */}
          <div style={{
            position: 'absolute',
            top: '120px',
            right: '20px',
            opacity: 0.6
          }}>
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="15" width="40" height="40" rx="8" fill="url(#heroGrad2)" opacity="0.3">
                <animate attributeName="y" values="15;10;15" dur="3.5s" repeatCount="indefinite" />
              </rect>
              <rect x="15" y="15" width="40" height="40" rx="8" fill="url(#heroGrad2)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.5s" repeatCount="indefinite" />
              </rect>
              <path d="M25 30L30 35L45 25" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="stroke-dasharray" values="0,50;50,0" dur="2s" repeatCount="indefinite" />
              </path>
              <defs>
                <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '32px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            Introducing Roastify v{version?.version || '1.5.0'}
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: '700',
            lineHeight: '1.1',
            letterSpacing: '-0.04em',
            marginBottom: '24px',
            maxWidth: '900px',
            margin: '0 auto 24px'
          }}>
            The modern way to manage your freelance business
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: '400',
            lineHeight: '1.5',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            Track time, manage clients, create invoices. Everything you need to run your business, in one place.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '64px'
          }}>
            <Link
              to="/register"
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#ffffff',
                background: '#000000',
                border: 'none',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333333';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start for free
              <MdArrowForward size={18} />
            </Link>
            
            <Link
              to="/login"
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '500',
                color: isDark ? '#ffffff' : '#000000',
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View demo
            </Link>
          </div>

          {/* Hero Illustration */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '48px'
          }}>
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Laptop/Device */}
              <rect x="80" y="80" width="240" height="160" rx="8" fill={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} stroke={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} strokeWidth="2">
                <animate attributeName="y" values="80;75;80" dur="4s" repeatCount="indefinite" />
              </rect>
              
              {/* Screen Content - Dashboard Lines */}
              <rect x="100" y="100" width="80" height="8" rx="4" fill="url(#dashGrad1)" opacity="0.6">
                <animate attributeName="width" values="80;100;80" dur="3s" repeatCount="indefinite" />
              </rect>
              <rect x="100" y="120" width="120" height="8" rx="4" fill="url(#dashGrad2)" opacity="0.6">
                <animate attributeName="width" values="120;140;120" dur="3.5s" repeatCount="indefinite" />
              </rect>
              <rect x="100" y="140" width="100" height="8" rx="4" fill="url(#dashGrad3)" opacity="0.6">
                <animate attributeName="width" values="100;120;100" dur="4s" repeatCount="indefinite" />
              </rect>
              
              {/* Floating Elements Around */}
              <circle cx="50" cy="120" r="20" fill="url(#floatGrad1)" opacity="0.4">
                <animate attributeName="cy" values="120;110;120" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <path d="M45 120L50 125L60 115" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              <circle cx="350" cy="140" r="25" fill="url(#floatGrad2)" opacity="0.4">
                <animate attributeName="cy" values="140;130;140" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <path d="M340 140L350 150L360 130" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Sparkles */}
              <circle cx="120" cy="60" r="3" fill="#6366f1">
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="70" r="3" fill="#ec4899">
                <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="340" cy="100" r="3" fill="#8b5cf6">
                <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
              </circle>
              
              <defs>
                <linearGradient id="dashGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="dashGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="dashGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="floatGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="floatGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '32px 0',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '120px 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              lineHeight: '1.2',
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              Powerful features for your business
            </h2>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              All the tools you need to run your freelance business efficiently
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '40px 32px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  {feature.svg}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '120px 24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: '700',
                lineHeight: '1.2',
                letterSpacing: '-0.03em',
                marginBottom: '24px'
              }}>
                Everything you need to succeed
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                marginBottom: '32px'
              }}>
                Powerful features designed specifically for freelancers and small businesses
              </p>
              
              {/* Animated Character Illustration */}
              <div style={{
                display: window.innerWidth > 768 ? 'none' : 'flex',
                justifyContent: 'center',
                marginBottom: '32px'
              }}>
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Character Body */}
                  <ellipse cx="100" cy="160" rx="40" ry="10" fill={isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}>
                    <animate attributeName="rx" values="40;45;40" dur="3s" repeatCount="indefinite" />
                  </ellipse>
                  <rect x="70" y="100" width="60" height="60" rx="30" fill="url(#charGrad1)">
                    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" />
                  </rect>
                  {/* Arms */}
                  <rect x="50" y="110" width="20" height="40" rx="10" fill="url(#charGrad2)">
                    <animateTransform attributeName="transform" type="rotate" values="0 60 110;-10 60 110;0 60 110" dur="3s" repeatCount="indefinite" />
                  </rect>
                  <rect x="130" y="110" width="20" height="40" rx="10" fill="url(#charGrad2)">
                    <animateTransform attributeName="transform" type="rotate" values="0 140 110;10 140 110;0 140 110" dur="3s" repeatCount="indefinite" />
                  </rect>
                  {/* Head */}
                  <circle cx="100" cy="70" r="30" fill="url(#charGrad3)">
                    <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" />
                  </circle>
                  {/* Eyes */}
                  <circle cx="90" cy="65" r="4" fill="white" />
                  <circle cx="110" cy="65" r="4" fill="white" />
                  {/* Smile */}
                  <path d="M85 80Q100 88 115 80" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  {/* Floating Icons */}
                  <circle cx="40" cy="60" r="15" fill="url(#iconGrad1)" opacity="0.6">
                    <animate attributeName="cy" values="60;55;60" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <path d="M35 60L40 65L50 55" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="160" cy="80" r="15" fill="url(#iconGrad2)" opacity="0.6">
                    <animate attributeName="cy" values="80;75;80" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <path d="M155 75L160 80L165 75M160 75V85" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="charGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="charGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="charGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                    <linearGradient id="iconGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="iconGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: isDark ? '#ffffff' : '#000000',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.gap = '12px'}
                onMouseLeave={(e) => e.currentTarget.style.gap = '8px'}
              >
                Get started
                <MdArrowForward size={20} />
              </Link>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                'Time tracking with one-click timer',
                'Client and project management',
                'Professional invoice generation',
                'Detailed reports and analytics',
                'Task management and organization',
                'Secure cloud storage',
                'Mobile-friendly interface',
                'Export data anytime'
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 8]} 0%, ${['#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6', '#059669', '#d97706', '#dc2626', '#6366f1'][index % 8]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(6, 182, 212, 0.3)', 'rgba(16, 185, 129, 0.3)', 'rgba(245, 158, 11, 0.3)', 'rgba(239, 68, 68, 0.3)', 'rgba(139, 92, 246, 0.3)'][index % 8]}`
                  }}>
                    <MdCheck size={18} color="white" />
                  </div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '500'
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '120px 24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '24px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Background Characters */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '40px',
              opacity: 0.15
            }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="25" fill="url(#ctaGrad1)">
                  <animate attributeName="r" values="25;28;25" dur="3s" repeatCount="indefinite" />
                </circle>
                <path d="M20 30L27 37L40 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="ctaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              opacity: 0.15
            }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#ctaGrad2)">
                  <animateTransform attributeName="transform" type="rotate" values="0 30 30;10 30 30;0 30 30" dur="4s" repeatCount="indefinite" />
                </rect>
                <path d="M25 30L30 35L35 25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="ctaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '60px',
              opacity: 0.15
            }}>
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="25,5 45,40 5,40" fill="url(#ctaGrad3)">
                  <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="3.5s" repeatCount="indefinite" />
                </polygon>
                <defs>
                  <linearGradient id="ctaGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '50px',
              opacity: 0.15
            }}>
              <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27.5 5L35 20L50 22.5L38.75 33.5L41.5 48.5L27.5 41L13.5 48.5L16.25 33.5L5 22.5L20 20L27.5 5Z" fill="url(#ctaGrad4)">
                  <animateTransform attributeName="transform" type="rotate" values="0 27.5 27.5;360 27.5 27.5" dur="20s" repeatCount="indefinite" />
                </path>
                <defs>
                  <linearGradient id="ctaGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              lineHeight: '1.2',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1
            }}>
              Start managing your business today
            </h2>
            <p style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
              position: 'relative',
              zIndex: 1
            }}>
              Join thousands of freelancers who trust Roastify to manage their business
            </p>
            <Link
              to="/register"
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#ffffff',
                background: '#000000',
                border: 'none',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333333';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Get started for free
              <MdArrowForward size={18} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 24px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            }}>
              © {new Date().getFullYear()} Roastify. All rights reserved.
            </div>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              {['Terms', 'Privacy', 'Contact', 'Changelog'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#ffffff' : '#000000'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeInternational;
