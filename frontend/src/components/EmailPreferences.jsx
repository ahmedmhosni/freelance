import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const EmailPreferences = () => {
  const { isDark } = useTheme();
  const [preferences, setPreferences] = useState({
    marketing: true,
    notifications: true,
    updates: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${apiUrl}/api/preferences/email`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };

    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${apiUrl}/api/preferences/email`,
        newPreferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPreferences(newPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
      }}>
        Loading preferences...
      </div>
    );
  }

  return (
    <div style={{
      background: isDark ? '#1a1a1a' : '#ffffff',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
        marginBottom: '8px'
      }}>
        Email Preferences
      </h3>
      <p style={{
        fontSize: '14px',
        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)',
        marginBottom: '24px'
      }}>
        Choose which emails you'd like to receive
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Marketing Emails */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '4px'
            }}>
              Marketing Emails
            </div>
            <div style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              Product updates, tips, and special offers
            </div>
          </div>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={() => handleToggle('marketing')}
              disabled={saving}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: preferences.marketing ? '#8b5cf6' : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)',
              borderRadius: '24px',
              transition: '0.3s',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: preferences.marketing ? '27px' : '3px',
                bottom: '3px',
                background: '#ffffff',
                borderRadius: '50%',
                transition: '0.3s'
              }} />
            </span>
          </label>
        </div>

        {/* Notification Emails */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '4px'
            }}>
              Notification Emails
            </div>
            <div style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              Task reminders, invoice updates, and activity alerts
            </div>
          </div>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={() => handleToggle('notifications')}
              disabled={saving}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: preferences.notifications ? '#8b5cf6' : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)',
              borderRadius: '24px',
              transition: '0.3s',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: preferences.notifications ? '27px' : '3px',
                bottom: '3px',
                background: '#ffffff',
                borderRadius: '50%',
                transition: '0.3s'
              }} />
            </span>
          </label>
        </div>

        {/* Update Emails */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
              marginBottom: '4px'
            }}>
              Platform Updates
            </div>
            <div style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              New features, improvements, and important announcements
            </div>
          </div>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            <input
              type="checkbox"
              checked={preferences.updates}
              onChange={() => handleToggle('updates')}
              disabled={saving}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: preferences.updates ? '#8b5cf6' : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 53, 47, 0.2)',
              borderRadius: '24px',
              transition: '0.3s',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              <span style={{
                position: 'absolute',
                height: '18px',
                width: '18px',
                left: preferences.updates ? '27px' : '3px',
                bottom: '3px',
                background: '#ffffff',
                borderRadius: '50%',
                transition: '0.3s'
              }} />
            </span>
          </label>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
        borderRadius: '8px',
        fontSize: '13px',
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
      }}>
        💡 You can unsubscribe from any email type at any time. Important security and account-related emails will still be sent.
      </div>
    </div>
  );
};

export default EmailPreferences;
