import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AnnouncementBanner.css';

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
      const response = await axios.get('/api/announcements/featured');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching featured announcements:', error);
    }
  };

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="announcement-banner">
      <div className="announcement-content">
        <span className="announcement-badge">📢 Announcement</span>
        <Link to={`/announcements/${currentAnnouncement.id}`} className="announcement-text">
          {currentAnnouncement.title}
        </Link>
        {announcements.length > 1 && (
          <div className="announcement-dots">
            {announcements.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      <button className="announcement-close" onClick={() => setIsVisible(false)}>
        ×
      </button>
    </div>
  );
};

export default AnnouncementBanner;
