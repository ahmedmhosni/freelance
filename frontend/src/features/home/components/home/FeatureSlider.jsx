import { useState, useEffect } from 'react';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { ClientManagementDemo } from './RealUIDemo';
import { TimeTrackingDemo, ProjectManagementDemo, ReportsDemo } from './RealUIDemoNew';

const FeatureSlider = ({ isDark }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const features = [
    {
      title: 'Client Management',
      description: 'Stop juggling spreadsheets. Keep all your client info in one place.',
      benefits: [
        'All client details in one spot',
        'Quick search when you need it',
        'Link clients to projects and invoices'
      ],
      visual: <ClientManagementDemo isDark={isDark} />
    },
    {
      title: 'Time Tracking',
      description: 'Click start, do your work, click stop. No complicated setup.',
      benefits: [
        'One-click start/stop timer',
        'See your hours at a glance',
        'Export for invoicing'
      ],
      visual: <TimeTrackingDemo isDark={isDark} />
    },
    {
      title: 'Tasks & Projects',
      description: 'Kanban boards, lists, calendars—view your work however makes sense.',
      benefits: [
        'Multiple views (Kanban, List, Calendar)',
        'Drag and drop to organize',
        'Link tasks to clients'
      ],
      visual: <ProjectManagementDemo isDark={isDark} />
    },
    {
      title: 'Reports & Analytics',
      description: 'See where your time and money are going. Export what you need.',
      benefits: [
        'Revenue and time tracking',
        'Export to CSV',
        'Simple charts, no fluff'
      ],
      visual: <ReportsDemo isDark={isDark} />
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const goToSlide = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  return (
    <div style={{
      position: 'relative',
      padding: '60px 0 80px',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 40px'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '36px' : '48px',
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#37352f',
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            lineHeight: '1.2'
          }}>
            Everything you need.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Nothing you don't.
            </span>
          </h2>
          <p style={{
            fontSize: '16px',
            fontWeight: '400',
            color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.65)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Built for freelancers who want to work, not wrestle with software.
          </p>
        </div>

        {/* Feature Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 968 ? '1fr' : '1fr 1.4fr',
          gap: '60px',
          alignItems: 'center',
          minHeight: '450px'
        }}>
          {/* Left: Text Content */}
          <div>
            <div style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6366f1',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {activeIndex + 1} of {features.length}
            </div>

            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '24px' : '36px',
              fontWeight: '600',
              color: isDark ? '#ffffff' : '#37352f',
              marginBottom: '16px',
              lineHeight: '1.2',
              letterSpacing: '-0.01em'
            }}>
              {features[activeIndex].title}
            </h3>

            <p style={{
              fontSize: '15px',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(55, 53, 47, 0.65)',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {features[activeIndex].description}
            </p>

            {/* Benefits */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '28px'
            }}>
              {features[activeIndex].benefits.map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <MdCheckCircle size={20} style={{
                    color: '#10b981',
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(55, 53, 47, 0.75)',
                    lineHeight: '1.5'
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: activeIndex === index ? '40px' : '12px',
                    height: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeIndex === index
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    if (activeIndex !== index) {
                      e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 53, 47, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeIndex !== index) {
                      e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)';
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div style={{
            position: 'relative',
            minHeight: '450px'
          }}>
            {/* Demo with fade transition */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%'
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(20px)',
                    transition: 'all 0.5s ease',
                    pointerEvents: activeIndex === index ? 'auto' : 'none'
                  }}
                >
                  {feature.visual}
                </div>
              ))}
            </div>

            {/* Arrow Navigation */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              <button
                onClick={prevSlide}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  background: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.background = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)';
                }}
              >
                <MdArrowBack size={20} />
              </button>
              <button
                onClick={nextSlide}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  background: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.background = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)';
                }}
              >
                <MdArrowForward size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSlider;
