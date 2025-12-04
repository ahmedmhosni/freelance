import { useState } from 'react';
import { MdClose, MdBugReport, MdLightbulb, MdFeedback, MdCamera } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FeedbackWidget = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScreenshot = async () => {
    try {
      // Use html2canvas or similar library for screenshot
      // For now, just allow file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Screenshot must be less than 5MB');
            return;
          }
          setScreenshot(file);
          toast.success('Screenshot added');
        }
      };
      input.click();
    } catch (error) {
      toast.error('Failed to capture screenshot');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await api.post('/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Thank you for your feedback!');
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setScreenshot(null);
      setType('bug');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (feedbackType) => {
    switch (feedbackType) {
      case 'bug':
        return <MdBugReport size={20} />;
      case 'feature':
        return <MdLightbulb size={20} />;
      default:
        return <MdFeedback size={20} />;
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
            color: isDark ? '#191919' : '#ffffff',
            border: 'none',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 999,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <MdFeedback size={18} />
          Feedback
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
              }}>
                Send Feedback
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
                }}
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              {/* Type Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}>
                  Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: 'bug', label: 'Bug Report', icon: <MdBugReport /> },
                    { value: 'feature', label: 'Feature Request', icon: <MdLightbulb /> },
                    { value: 'other', label: 'Other', icon: <MdFeedback /> }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: type === option.value
                          ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)')
                          : 'transparent',
                        border: type === option.value
                          ? (isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)')
                          : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.1)'),
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f'
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Screenshot */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleScreenshot}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MdCamera size={18} />
                  {screenshot ? 'Screenshot added ✓' : 'Add screenshot (optional)'}
                </button>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(55, 53, 47, 0.2)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: isDark ? 'rgba(255, 255, 255, 0.9)' : '#37352f',
                    color: isDark ? '#191919' : '#ffffff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
