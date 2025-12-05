import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdEdit, MdDelete, MdStar, MdImage, MdVideoLibrary } from 'react-icons/md';

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
      const response = await axios.get('/announcements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure we always set an array
      const data = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]); // Set empty array on error
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
        await axios.put(`/announcements/${editingId}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/announcements', formDataToSend, {
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
      await axios.delete(`/announcements/${id}`, {
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
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Announcements Management</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(55, 53, 47, 0.6)' }}>
            Create and manage announcements for your users
          </p>
        </div>
        {!isCreating && (
          <button 
            className="btn-primary" 
            onClick={() => setIsCreating(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MdAdd size={18} />
            New Announcement
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                Title *
              </label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter announcement title"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                Content *
              </label>
              <textarea
                className="input"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows="6"
                placeholder="Enter announcement content"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                Media (Image or Video)
              </label>
              <input
                type="file"
                className="input"
                accept="image/*,video/*"
                onChange={(e) => setFormData({ ...formData, media: e.target.files[0] })}
                style={{ padding: '8px' }}
              />
              <small style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.6)' }}>
                Max 50MB. Supported: JPG, PNG, GIF, WebP, MP4, WebM
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <MdStar size={16} style={{ marginRight: '4px', color: '#ffc107' }} />
                Featured (Show on home page and dashboard)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
          All Announcements ({announcements.length})
        </h3>
        {announcements.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'rgba(55, 53, 47, 0.6)' }}>
              No announcements yet. Create your first one!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {announcements.map((announcement) => (
              <div key={announcement.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                        {announcement.title}
                      </h4>
                      {announcement.is_featured && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(255, 193, 7, 0.1)',
                          color: '#ffc107',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <MdStar size={12} />
                          Featured
                        </span>
                      )}
                      {announcement.media_url && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'rgba(55, 53, 47, 0.6)',
                          fontSize: '11px'
                        }}>
                          {announcement.media_type === 'image' ? <MdImage size={14} /> : <MdVideoLibrary size={14} />}
                          {announcement.media_type === 'image' ? 'Image' : 'Video'}
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '13px', 
                      color: 'rgba(55, 53, 47, 0.7)',
                      lineHeight: '1.5'
                    }}>
                      {announcement.content.substring(0, 150)}
                      {announcement.content.length > 150 && '...'}
                    </p>
                    <small style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)' }}>
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleEdit(announcement)}
                      style={{ 
                        padding: '6px 12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MdEdit size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(announcement.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MdDelete size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
