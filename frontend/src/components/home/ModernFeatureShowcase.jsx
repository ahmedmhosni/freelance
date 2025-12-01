import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ModernFeatureShowcase = () => {
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  const features = [
    {
      title: 'Complete Dashboard',
      description:
        'Everything you need to manage your freelance business in one beautiful dashboard. Track revenue, monitor projects, and stay on top of deadlines.',
      image: '/home/Screenshot 2025-11-28 213236.png',
      color: '#6366f1',
    },
    {
      title: 'Client Management',
      description:
        'Keep all your client information organized and accessible. Manage contacts, track communication history, and build stronger relationships.',
      image: '/home/Screenshot 2025-11-28 213300.png',
      color: '#8b5cf6',
    },
    {
      title: 'Project Tracking',
      description:
        'Track multiple projects with ease and never miss a deadline. Set milestones, monitor progress, and collaborate with your clients.',
      image: '/home/Screenshot 2025-11-28 213356.png',
      color: '#ec4899',
    },
    {
      title: 'Task Management',
      description:
        'Organize your work with intuitive Kanban boards. Drag and drop tasks, set priorities, and visualize your workflow.',
      image: '/home/Screenshot 2025-11-28 213448.png',
      color: '#14b8a6',
    },
    {
      title: 'Time Tracking',
      description:
        'Track every billable hour with precision and generate detailed reports. Start timers, log entries, and maximize your earnings.',
      image: '/home/Screenshot 2025-11-28 213503.png',
      color: '#f59e0b',
    },
    {
      title: 'Professional Invoicing',
      description:
        'Create and send beautiful invoices in seconds. Track payments, send reminders, and get paid faster with professional invoicing.',
      image: '/home/Screenshot 2025-11-28 213520.png',
      color: '#10b981',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate which section should be active
      sectionsRef.current.forEach((section, index) => {
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionMiddle = sectionTop + section.offsetHeight / 2;
        const viewportMiddle = scrollPosition + windowHeight / 2;

        if (Math.abs(sectionMiddle - viewportMiddle) < 200) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        background: isDark ? '#0a0a0a' : '#ffffff',
        padding: '120px 0',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px 100px',
          textAlign: 'center',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: window.innerWidth <= 768 ? '36px' : '48px',
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#37352f',
            marginBottom: '20px',
            letterSpacing: '-0.03em',
            lineHeight: '1.2',
          }}
        >
          Everything you need to{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            run your business
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: '18px',
            fontWeight: '400',
            color: isDark
              ? 'rgba(255, 255, 255, 0.65)'
              : 'rgba(55, 53, 47, 0.65)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Powerful features designed to help freelancers work smarter
        </motion.p>
      </div>

      {/* Sticky Image and Scrolling Text */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 1fr',
          gap: '80px',
          alignItems: 'start',
        }}
      >
        {/* Left Side - Scrolling Text */}
        <div style={{ position: 'relative' }}>
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (sectionsRef.current[index] = el)}
              style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                padding: '40px 0',
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20%' }}
                transition={{ duration: 0.6 }}
                style={{
                  opacity: activeIndex === index ? 1 : 0.3,
                  transition: 'opacity 0.5s ease',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}40`,
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: feature.color,
                    marginBottom: '20px',
                  }}
                >
                  Feature {index + 1} of {features.length}
                </div>

                <h3
                  style={{
                    fontSize: window.innerWidth <= 768 ? '32px' : '42px',
                    fontWeight: '700',
                    color: isDark ? '#ffffff' : '#37352f',
                    marginBottom: '20px',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2',
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: '400',
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(55, 53, 47, 0.7)',
                    lineHeight: '1.7',
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Right Side - Sticky Image */}
        <div
          style={{
            position: 'sticky',
            top: '120px',
            height: 'fit-content',
            display: window.innerWidth <= 1024 ? 'none' : 'block',
          }}
        >
          <div style={{ position: 'relative' }}>
            {/* Animated Glow Behind Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`glow-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '85%',
                  height: '85%',
                  background: `radial-gradient(circle, ${features[activeIndex].color}60 0%, transparent 70%)`,
                  filter: 'blur(80px)',
                  zIndex: 0,
                }}
              />
            </AnimatePresence>

            {/* Pulsing Glow Animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                height: '90%',
                background: `radial-gradient(circle, ${features[activeIndex].color}40 0%, transparent 70%)`,
                filter: 'blur(60px)',
                zIndex: 0,
              }}
            />

            {/* Image Container with Transitions */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: isDark
                      ? `0 40px 100px rgba(0, 0, 0, 0.6), 0 0 0 1px ${features[activeIndex].color}30`
                      : `0 40px 100px rgba(0, 0, 0, 0.15), 0 0 0 1px ${features[activeIndex].color}30`,
                    border: `2px solid ${features[activeIndex].color}40`,
                  }}
                >
                  <img
                    src={features[activeIndex].image}
                    alt={features[activeIndex].title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '32px',
                justifyContent: 'center',
              }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  animate={{
                    width: activeIndex === index ? '40px' : '8px',
                    backgroundColor:
                      activeIndex === index
                        ? feature.color
                        : isDark
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'rgba(55, 53, 47, 0.2)',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default ModernFeatureShowcase;
