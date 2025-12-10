import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api, logger } from '../../../shared';
import { MdSmartToy, MdSettings, MdToggleOn, MdToggleOff, MdSave, MdRefresh, MdInfo, MdWarning } from 'react-icons/md';

const AIAssistantManager = () => {
  const [aiSettings, setAiSettings] = useState({
    enabled: false,
    provider: 'gemini',
    model: 'gemini-pro',
    max_tokens: 1000,
    temperature: 0.7,
    system_prompt: 'You are a helpful AI assistant for a freelance management platform. Help users with their questions about projects, clients, invoices, and time tracking.',
    rate_limit_per_user: 10,
    rate_limit_window: 3600,
    welcome_message: 'Hello! I\'m your AI assistant. How can I help you today?'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchAISettings();
    fetchUsageStats();
  }, []);

  const fetchAISettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/admin/settings');
      setAiSettings({ ...aiSettings, ...response.data.data });
    } catch (error) {
      logger.error('Error fetching AI settings:', error);
      toast.error('Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await api.get('/ai/admin/usage');
      setUsage(response.data.data);
    } catch (error) {
      logger.error('Error fetching AI usage stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/ai/admin/settings', aiSettings);
      toast.success('AI settings saved successfully');
      fetchUsageStats(); // Refresh usage stats
    } catch (error) {
      logger.error('Error saving AI settings:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      const response = await api.post('/ai/admin/test-connection');
      setConnectionStatus(response.data.data);
      
      if (response.data.data.success) {
        toast.success('AI connection test successful');
      } else {
        toast.error('AI connection test failed');
      }
    } catch (error) {
      logger.error('Error testing AI connection:', error);
      setConnectionStatus({ success: false, error: error.message });
      toast.error('Failed to test AI connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAiSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>
            <MdSmartToy />
          </div>
          <p>Loading AI Assistant settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <MdSmartToy size={24} style={{ color: '#667eea' }} />
          <h2 style={{ margin: 0 }}>AI Assistant Manager</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Configure and manage the AI Assistant functionality for your users.
        </p>
      </div>

      {/* Usage Statistics */}
      {usage && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MdInfo size={20} />
            Usage Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea' }}>
                {usage.total_requests || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Requests</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745' }}>
                {usage.active_users || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ffc107' }}>
                {usage.requests_today || 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Requests Today</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc3545' }}>
                {usage.avg_response_time || 0}ms
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avg Response Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Settings */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MdSettings size={20} />
          Configuration
        </h3>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Enable/Disable Toggle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', color: aiSettings.enabled ? '#28a745' : '#6c757d' }}>
                {aiSettings.enabled ? <MdToggleOn /> : <MdToggleOff />}
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>Enable AI Assistant</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Allow users to interact with the AI assistant
                </div>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="form-label">AI Provider</label>
            <select
              value={aiSettings.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              className="form-input"
              disabled={!aiSettings.enabled}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="azure-openai">Azure OpenAI</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="form-label">Model</label>
            <select
              value={aiSettings.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="form-input"
              disabled={!aiSettings.enabled}
            >
              {aiSettings.provider === 'gemini' && (
                <>
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="gemini-pro-vision">Gemini Pro Vision</option>
                </>
              )}
              {aiSettings.provider === 'openai' && (
                <>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </>
              )}
              {aiSettings.provider === 'azure-openai' && (
                <>
                  <option value="gpt-35-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </>
              )}
            </select>
          </div>

          {/* Advanced Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Max Tokens</label>
              <input
                type="number"
                value={aiSettings.max_tokens}
                onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                className="form-input"
                min="100"
                max="4000"
                disabled={!aiSettings.enabled}
              />
            </div>
            <div>
              <label className="form-label">Temperature</label>
              <input
                type="number"
                value={aiSettings.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="form-input"
                min="0"
                max="2"
                step="0.1"
                disabled={!aiSettings.enabled}
              />
            </div>
          </div>

          {/* Rate Limiting */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Requests per User</label>
              <input
                type="number"
                value={aiSettings.rate_limit_per_user}
                onChange={(e) => handleInputChange('rate_limit_per_user', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="100"
                disabled={!aiSettings.enabled}
              />
            </div>
            <div>
              <label className="form-label">Rate Limit Window (seconds)</label>
              <input
                type="number"
                value={aiSettings.rate_limit_window}
                onChange={(e) => handleInputChange('rate_limit_window', parseInt(e.target.value))}
                className="form-input"
                min="60"
                max="86400"
                disabled={!aiSettings.enabled}
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="form-label">System Prompt</label>
            <textarea
              value={aiSettings.system_prompt}
              onChange={(e) => handleInputChange('system_prompt', e.target.value)}
              className="form-input"
              rows="4"
              placeholder="Define how the AI should behave and respond to users..."
              disabled={!aiSettings.enabled}
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label className="form-label">Welcome Message</label>
            <input
              type="text"
              value={aiSettings.welcome_message}
              onChange={(e) => handleInputChange('welcome_message', e.target.value)}
              className="form-input"
              placeholder="First message users see when opening the AI chat"
              disabled={!aiSettings.enabled}
            />
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MdRefresh size={20} />
          Connection Test
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={testConnection}
            disabled={testingConnection || !aiSettings.enabled}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MdRefresh />
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
          
          {connectionStatus && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: connectionStatus.success ? '#e8f5e9' : '#ffebee',
              color: connectionStatus.success ? '#2e7d32' : '#c62828',
              border: `1px solid ${connectionStatus.success ? '#c8e6c9' : '#ffcdd2'}`
            }}>
              {connectionStatus.success ? '✅' : '❌'}
              {connectionStatus.success ? 'Connection successful' : `Error: ${connectionStatus.error}`}
            </div>
          )}
        </div>

        {!aiSettings.enabled && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#856404'
          }}>
            <MdWarning />
            Enable AI Assistant to test the connection
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={fetchAISettings}
          className="btn-secondary"
          disabled={saving}
        >
          Reset Changes
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MdSave />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AIAssistantManager;