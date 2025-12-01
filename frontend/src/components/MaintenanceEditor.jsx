import { useState, useEffect } from 'react';
import api from '../utils/api';
import logger from '../utils/logger';

const MaintenanceEditor = () => {
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    message: '',
    launch_date: '',
    is_active: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/api/maintenance');
      setContent({
        ...response.data,
        launch_date: response.data.launch_date
          ? response.data.launch_date.split('T')[0]
          : '',
      });
    } catch (error) {
      logger.error('Error fetching maintenance content:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/api/maintenance', content);
      setMessage({
        type: 'success',
        text: 'Maintenance page updated successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.response?.data?.error || 'Failed to update maintenance page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2
          style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}
        >
          Maintenance Page Editor
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Manage the coming soon / maintenance page content
        </p>
      </div>

      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            background:
              message.type === 'success'
                ? 'rgba(46, 170, 220, 0.1)'
                : 'rgba(235, 87, 87, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(46, 170, 220, 0.3)' : 'rgba(235, 87, 87, 0.3)'}`,
            color: message.type === 'success' ? '#2eaadc' : '#eb5757',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Maintenance Mode Toggle */}
        <div
          style={{
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <input
              type="checkbox"
              checked={content.is_active}
              onChange={(e) =>
                setContent({ ...content, is_active: e.target.checked })
              }
              style={{
                marginRight: '10px',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <div>
              <div>Enable Maintenance Mode</div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                When enabled, visitors will see the coming soon page instead of
                the app
              </div>
            </div>
          </label>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}
          >
            Main Title
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            required
            placeholder="Brilliant ideas take time to be roasted"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Subtitle */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}
          >
            Subtitle
          </label>
          <input
            type="text"
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
            required
            placeholder="Roastify is coming soon"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}
          >
            Message
          </label>
          <textarea
            value={content.message}
            onChange={(e) =>
              setContent({ ...content, message: e.target.value })
            }
            required
            rows={4}
            placeholder="We're crafting something extraordinary..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Launch Date */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}
          >
            Expected Launch Date (Optional)
          </label>
          <input
            type="date"
            value={content.launch_date}
            onChange={(e) =>
              setContent({ ...content, launch_date: e.target.value })
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              background: isLoading ? '#999' : '#37352f',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>

          <a
            href="/coming-soon"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Preview Page
          </a>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceEditor;
