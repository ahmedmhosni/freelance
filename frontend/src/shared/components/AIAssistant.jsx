/**
 * AI Assistant Component
 * Floating chat widget for AI assistance
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAI } from '../hooks/useAI';
import { MdClose, MdSend, MdSmartToy, MdMinimize } from 'react-icons/md';

const AIAssistant = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const { isEnabled, loading, usage, error, sendMessage } = useAI();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Don't show on home page or auth pages
  const shouldShow = !location.pathname.startsWith('/login') && 
                     !location.pathname.startsWith('/register') &&
                     !location.pathname.startsWith('/') && 
                     location.pathname !== '/';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Get current page context
  const getContext = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    return {
      page: parts[parts.length - 1] || 'dashboard',
      path: path
    };
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to conversation
    setConversation(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    try {
      const response = await sendMessage(userMessage, getContext());
      
      // Add AI response to conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        tokens: response.tokensUsed
      }]);
    } catch (error) {
      // Add error message
      setConversation(prev => [...prev, {
        role: 'error',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isEnabled || !shouldShow) return null;

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
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
          }}
          title="AI Assistant"
        >
          <MdSmartToy />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '600px',
          maxHeight: 'calc(100vh - 48px)',
          background: isDark ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdSmartToy size={24} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>AI Assistant</div>
                {usage && (
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    {usage.dailyUsed}/{usage.dailyLimit} requests today
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {conversation.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
              }}>
                <MdSmartToy size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  Hi! I'm your AI assistant.
                </div>
                <div style={{ fontSize: '12px' }}>
                  Ask me anything about using the app!
                </div>
              </div>
            )}

            {conversation.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : msg.role === 'error'
                    ? isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
                    : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: msg.role === 'user' 
                    ? 'white'
                    : msg.role === 'error'
                    ? '#ef4444'
                    : isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  fontSize: '14px'
                }}>
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            {error && (
              <div style={{
                padding: '8px 12px',
                marginBottom: '12px',
                borderRadius: '6px',
                background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '12px'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || loading}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: message.trim() && !loading
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: message.trim() && !loading ? 'white' : isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  cursor: message.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <MdSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
