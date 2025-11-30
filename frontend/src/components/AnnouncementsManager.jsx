import { useState, useEffect } from 'react';
import axios from 'axios';

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isFeatured: false,
    media: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('isFeatured', formData.isFeatured);
      if (formData.media) {
        formDataToSend.append('media', formData.media);
      }

      if (editingId) {
        await axios.put(`/api/announcements/${editingId}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/announcements', formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setFormData({ title: '', content: '', isFeatured: false, media: null });
      setIsCreating(false);
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isFeatured: announcement.is_featured,
      media: null
    });
    setEditingId(announcement.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axios.delete(`/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '', isFeatured: false, media: null });
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="announcements-manager">
      <div className="manager-header">
        <h2>📢 Announcements Management</h2>
        {!isCreating && (
          <button className="btn-primary" onClick={() => setIsCreating(true)}>
            + New Announcement
          </button>
        )}
      </div>

      {isCreating && (
        <div className="announcement-form-card">
          <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter announcement title"
              />
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows="6"
                placeholder="Enter announcement content"
              />
            </div>

            <div className="form-group">
              <label>Media (Image or Video)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFormData({ ...formData, media: e.target.files[0] })}
              />
              <small>Max 50MB. Supported: JPG, PNG, GIF, WebP, MP4, WebM</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>Featured (Show on home page and dashboard)</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        <h3>All Announcements ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <p className="no-data">No announcements yet. Create your first one!</p>
        ) : (
          <div className="announcements-grid">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                {announcement.is_featured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
                <h4>{announcement.title}</h4>
                <p className="announcement-preview">
                  {announcement.content.substring(0, 150)}
                  {announcement.content.length > 150 && '...'}
                </p>
                {announcement.media_url && (
                  <div className="media-indicator">
                    {announcement.media_type === 'image' ? '🖼️ Image' : '🎥 Video'}
                  </div>
                )}
                <div className="announcement-meta">
                  <small>{new Date(announcement.created_at).toLocaleDateString()}</small>
                </div>
                <div className="announcement-actions">
                  <button className="btn-edit" onClick={() => handleEdit(announcement)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(announcement.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .announcements-manager {
          padding: 20px;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .manager-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .announcement-form-card {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .announcement-form-card h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input[type="text"],
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .announcements-list h3 {
          margin-bottom: 20px;
        }

        .no-data {
          text-align: center;
          color: #666;
          padding: 40px;
        }

        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .announcement-card {
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          padding: 20px;
          position: relative;
        }

        .featured-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ffc107;
          color: #000;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .announcement-card h4 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }

        .announcement-preview {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .media-indicator {
          font-size: 12px;
          color: #007bff;
          margin-bottom: 10px;
        }

        .announcement-meta {
          margin-bottom: 15px;
        }

        .announcement-meta small {
          color: #999;
          font-size: 12px;
        }

        .announcement-actions {
          display: flex;
          gap: 10px;
        }

        .btn-edit, .btn-delete {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .btn-edit {
          background: #28a745;
          color: white;
        }

        .btn-edit:hover {
          background: #218838;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .btn-delete:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementsManager;
