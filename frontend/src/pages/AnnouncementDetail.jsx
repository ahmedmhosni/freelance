import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`/api/announcements/${id}`);
      setAnnouncement(response.data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      setError('Announcement not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="announcement-detail-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="announcement-detail-page">
        <div className="error-message">
          <h2>Announcement Not Found</h2>
          <p>The announcement you're looking for doesn't exist.</p>
          <Link to="/announcements" className="back-link">← Back to Announcements</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={announcement.title}
        description={announcement.content.substring(0, 160)}
        image={announcement.media_type === 'image' ? announcement.media_url : undefined}
      />
      <div className="announcement-detail-page">
        <div className="announcement-detail">
          <Link to="/announcements" className="back-link">← Back to Announcements</Link>
          
          {announcement.is_featured && (
            <span className="featured-badge">⭐ Featured</span>
          )}

          <h1>{announcement.title}</h1>

          <div className="announcement-meta">
            <span className="date">
              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {announcement.media_url && (
            <div className="announcement-media">
              {announcement.media_type === 'image' ? (
                <img src={announcement.media_url} alt={announcement.title} />
              ) : (
                <video controls>
                  <source src={announcement.media_url} type="video/mp4" />
                  <source src={announcement.media_url} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          <div className="announcement-content">
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <style jsx>{`
          .announcement-detail-page {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .loading, .error-message {
            text-align: center;
            padding: 60px 20px;
          }

          .error-message h2 {
            color: #dc3545;
            margin-bottom: 10px;
          }

          .error-message p {
            color: #666;
            margin-bottom: 20px;
          }

          .back-link {
            display: inline-block;
            color: #007bff;
            text-decoration: none;
            margin-bottom: 30px;
            font-size: 14px;
            transition: color 0.2s;
          }

          .back-link:hover {
            color: #0056b3;
          }

          .announcement-detail {
            background: var(--card-bg, #fff);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 12px;
            padding: 40px;
            position: relative;
          }

          .featured-badge {
            position: absolute;
            top: 30px;
            right: 30px;
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: #000;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }

          .announcement-detail h1 {
            font-size: 32px;
            margin: 0 0 20px 0;
            color: var(--text-primary, #333);
            line-height: 1.3;
          }

          .announcement-meta {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
          }

          .date {
            font-size: 14px;
            color: #999;
          }

          .announcement-media {
            margin: 30px 0;
            border-radius: 8px;
            overflow: hidden;
          }

          .announcement-media img,
          .announcement-media video {
            width: 100%;
            height: auto;
            display: block;
          }

          .announcement-media video {
            max-height: 500px;
          }

          .announcement-content {
            font-size: 16px;
            line-height: 1.8;
            color: var(--text-primary, #333);
          }

          .announcement-content p {
            margin-bottom: 16px;
          }

          .announcement-content p:last-child {
            margin-bottom: 0;
          }

          @media (max-width: 768px) {
            .announcement-detail-page {
              padding: 20px 15px;
            }

            .announcement-detail {
              padding: 25px 20px;
            }

            .announcement-detail h1 {
              font-size: 24px;
            }

            .featured-badge {
              position: static;
              display: inline-block;
              margin-bottom: 15px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default AnnouncementDetail;
