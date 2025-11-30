import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="announcements-page">
        <div className="loading">Loading announcements...</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Announcements"
        description="Stay updated with the latest news and announcements"
      />
      <div className="announcements-page">
        <div className="announcements-header">
          <h1>📢 Announcements</h1>
          <p>Stay updated with our latest news and updates</p>
        </div>

        {announcements.length === 0 ? (
          <div className="no-announcements">
            <p>No announcements at this time. Check back later!</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                to={`/announcements/${announcement.id}`}
                className="announcement-item"
              >
                {announcement.is_featured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
                <h2>{announcement.title}</h2>
                <p className="announcement-excerpt">
                  {announcement.content.substring(0, 200)}
                  {announcement.content.length > 200 && '...'}
                </p>
                {announcement.media_url && (
                  <div className="media-preview">
                    {announcement.media_type === 'image' ? (
                      <img src={announcement.media_url} alt={announcement.title} />
                    ) : (
                      <div className="video-indicator">🎥 Video attached</div>
                    )}
                  </div>
                )}
                <div className="announcement-footer">
                  <span className="date">
                    {new Date(announcement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="read-more">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <style jsx>{`
          .announcements-page {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .announcements-header {
            text-align: center;
            margin-bottom: 50px;
          }

          .announcements-header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            color: var(--text-primary, #333);
          }

          .announcements-header p {
            font-size: 18px;
            color: #666;
          }

          .loading, .no-announcements {
            text-align: center;
            padding: 60px 20px;
            color: #666;
            font-size: 16px;
          }

          .announcements-list {
            display: flex;
            flex-direction: column;
            gap: 30px;
          }

          .announcement-item {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 12px;
            padding: 30px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            position: relative;
            display: block;
          }

          .announcement-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            border-color: #007bff;
          }

          .featured-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: #000;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .announcement-item h2 {
            font-size: 24px;
            margin: 0 0 15px 0;
            color: var(--text-primary, #333);
          }

          .announcement-excerpt {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 20px;
          }

          .media-preview {
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
          }

          .media-preview img {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: cover;
            display: block;
          }

          .video-indicator {
            background: #f0f0f0;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }

          .announcement-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color, #e0e0e0);
          }

          .date {
            font-size: 14px;
            color: #999;
          }

          .read-more {
            font-size: 14px;
            color: #007bff;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .announcements-page {
              padding: 20px 15px;
            }

            .announcements-header h1 {
              font-size: 28px;
            }

            .announcement-item {
              padding: 20px;
            }

            .announcement-item h2 {
              font-size: 20px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Announcements;
