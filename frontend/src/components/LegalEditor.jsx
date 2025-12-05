import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdSave, MdPreview, MdEdit } from 'react-icons/md';
import logger from '../utils/logger';

const LegalEditor = () => {
  const { isDark } = useTheme();
  const [activeType, setActiveType] = useState('terms');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [activeType]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/legal/${activeType}`);
      setContent(response.data.content || '');
    } catch (error) {
      logger.error('Error fetching legal content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/legal/${activeType}`, { content });
      toast.success(`${activeType === 'terms' ? 'Terms' : 'Privacy Policy'} updated successfully!`);
    } catch (error) {
      logger.error('Error saving legal content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{ margin: 0 }}>Legal Content Editor</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveType('terms')}
            className={`view-toggle ${activeType === 'terms' ? 'active' : ''}`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveType('privacy')}
            className={`view-toggle ${activeType === 'privacy' ? 'active' : ''}`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ 
          fontSize: '13px', 
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
          marginBottom: '12px'
        }}>
          Edit the {activeType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} content. 
          You can use HTML for formatting.
        </p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setIsPreview(false)}
            className={`view-toggle ${!isPreview ? 'active' : ''}`}
            style={{ fontSize: '13px' }}
          >
            <MdEdit style={{ marginRight: '4px' }} />
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`view-toggle ${isPreview ? 'active' : ''}`}
            style={{ fontSize: '13px' }}
          >
            <MdPreview style={{ marginRight: '4px' }} />
            Preview
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
        }}>
          Loading content...
        </div>
      ) : (
        <>
          {!isPreview ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter HTML content here..."
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '4px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          ) : (
            <div 
              className="terms-content"
              style={{
                minHeight: '400px',
                padding: '20px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '4px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '16px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (isSaving || !content.trim()) ? 0.6 : 1,
                cursor: (isSaving || !content.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              <MdSave />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}

      <div style={{ 
        marginTop: '20px',
        padding: '12px',
        background: isDark ? 'rgba(46, 170, 220, 0.1)' : 'rgba(46, 170, 220, 0.05)',
        border: isDark ? '1px solid rgba(46, 170, 220, 0.2)' : '1px solid rgba(46, 170, 220, 0.15)',
        borderRadius: '4px',
        fontSize: '13px',
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
      }}>
        <strong>💡 Tip:</strong> Use HTML tags for formatting:
        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
          <li><code>&lt;h2&gt;</code> for headings</li>
          <li><code>&lt;p&gt;</code> for paragraphs</li>
          <li><code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> for lists</li>
          <li><code>&lt;strong&gt;</code> for bold text</li>
        </ul>
      </div>
    </div>
  );
};

export default LegalEditor;
