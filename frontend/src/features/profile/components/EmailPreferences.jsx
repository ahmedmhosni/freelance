import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const EmailPreferences = () => {
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
      
      const response = await axios.get(`${apiUrl}/preferences/email`, {
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
        `${apiUrl}/preferences/email`,
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
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        Loading preferences...
      </div>
    );
  }

  const Toggle = ({ checked, onChange, disabled }) => (
    <label className="toggle-switch" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <span className={`toggle-slider ${checked ? 'active' : ''}`} />
    </label>
  );

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>
        Email Preferences
      </h3>
      <p className="page-subtitle" style={{ marginBottom: '24px' }}>
        Choose which emails you'd like to receive
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Marketing Emails */}
        <div className="preference-item">
          <div style={{ flex: 1 }}>
            <div className="preference-title">
              Marketing Emails
            </div>
            <div className="preference-description">
              Product updates, tips, and special offers
            </div>
          </div>
          <Toggle
            checked={preferences.marketing}
            onChange={() => handleToggle('marketing')}
            disabled={saving}
          />
        </div>

        {/* Notification Emails */}
        <div className="preference-item">
          <div style={{ flex: 1 }}>
            <div className="preference-title">
              Notification Emails
            </div>
            <div className="preference-description">
              Task reminders, invoice updates, and activity alerts
            </div>
          </div>
          <Toggle
            checked={preferences.notifications}
            onChange={() => handleToggle('notifications')}
            disabled={saving}
          />
        </div>

        {/* Update Emails */}
        <div className="preference-item">
          <div style={{ flex: 1 }}>
            <div className="preference-title">
              Platform Updates
            </div>
            <div className="preference-description">
              New features, improvements, and important announcements
            </div>
          </div>
          <Toggle
            checked={preferences.updates}
            onChange={() => handleToggle('updates')}
            disabled={saving}
          />
        </div>
      </div>

      <div className="info-box" style={{ marginTop: '20px' }}>
        💡 You can unsubscribe from any email type at any time. Important security and account-related emails will still be sent.
      </div>
    </div>
  );
};

export default EmailPreferences;
