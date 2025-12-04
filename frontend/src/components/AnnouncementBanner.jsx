import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../shared/utils/api';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchFeaturedAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const fetchFeaturedAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/featured');
      // Ensure we always set an array
      const data = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching featured announcements:', error);
      setAnnouncements([]); // Set empty array on error
    }
  };

  if (!isVisible || !announcements || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];
  
  // Safety check - if no current announcement, don't render
  if (!currentAnnouncement) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px 20px',
      marginTop: '64px'
    }}>
      <Link 
        to={`/announcements/${currentAnnouncement.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '50px',
          textDecoration: 'none',
          color: 'inherit',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
          e.currentTarget.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.25), 0 0 50px rgba(99, 102, 241, 0.12)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#6366f1',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(99, 102, 241, 0.6), 0 0 12px rgba(99, 102, 241, 0.4)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        <span>{currentAnnouncement.title}</span>
      </Link>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBanner;
