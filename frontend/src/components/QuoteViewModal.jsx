import { MdClose, MdEdit, MdDelete, MdCheck, MdClose as MdCloseIcon, MdAccessTime } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';

const QuoteViewModal = ({ quote, onClose, onEdit, onDelete, onToggleActive }) => {
  const { isDark } = useTheme();

  if (!quote) return null;

  return (
    <div 
      style={{
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
      }}
      onClick={onClose}
    >
      <div 
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'start',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <h2 style={{ margin: 0, flex: 1, fontSize: '20px' }}>Quote Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)'
            }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Status */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
              fontWeight: '500'
            }}>
              STATUS
            </span>
            <button
              onClick={onToggleActive}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: quote.is_active ? 'rgba(46, 170, 220, 0.1)' : 'rgba(55, 53, 47, 0.1)',
                color: quote.is_active ? '#2eaadc' : 'rgba(55, 53, 47, 0.5)',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {quote.is_active ? <MdCheck size={14} /> : <MdCloseIcon size={14} />}
              {quote.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        {/* Quote Text */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            marginBottom: '12px',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
          }}>
            QUOTE
          </h3>
          <blockquote style={{ 
            margin: 0,
            padding: '16px 20px',
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
            borderLeft: '4px solid #2eaadc',
            borderRadius: '4px',
            fontSize: '16px',
            lineHeight: '1.6',
            fontStyle: 'italic',
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(55, 53, 47, 0.9)'
          }}>
            "{quote.text}"
          </blockquote>
        </div>

        {/* Author */}
        {quote.author && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '8px',
              color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)'
            }}>
              AUTHOR
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '15px',
              fontWeight: '500',
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(55, 53, 47, 0.8)'
            }}>
              {quote.author}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div style={{ 
          display: 'grid', 
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          borderRadius: '4px'
        }}>
          {quote.created_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdAccessTime size={18} style={{ color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)' }} />
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  marginBottom: '2px'
                }}>
                  Created
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {new Date(quote.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onDelete}
            className="btn-delete"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <MdDelete size={18} />
            <span>Delete</span>
          </button>
          <button
            onClick={onEdit}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <MdEdit size={18} />
            <span>Edit Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteViewModal;
