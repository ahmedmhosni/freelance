import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';
import { 
  MdSmartToy, 
  MdClose, 
  MdSend, 
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';
import api from '../utils/api';

const AIAssistant = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkAIAvailability();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAIAvailability = async () => {
    try {
      const response = await api.get('/ai/status');
      setIsEnabled(response.data.enabled);
    } catch (error) {
      logger.error('Failed to check AI availability:', error);
      setIsEnabled(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
        conversation_id: conversationId
      });

      // Add AI response
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.data.response, 
          timestamp: new Date() 
        }]);
        
        // Store conversation ID for future messages
        if (response.data.data.conversation_id) {
          setConversationId(response.data.data.conversation_id);
        }
      } else {
        throw new Error(response.data.error || 'Failed to get AI response');
      }
    } catch (error) {
      logger.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.', 
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if AI is not enabled
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* AI Assistant Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="AI Assistant"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
          }}
        >
          <MdSmartToy />
        </button>
      )}

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '380px',
            height: isMinimized ? '60px' : '500px',
            background: isDark ? '#1a1a1a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isMinimized ? 'pointer' : 'default'
            }}
            onClick={isMinimized ? () => setIsMinimized(false) : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdSmartToy size={20} />
              <span style={{ fontWeight: '600', fontSize: '14px' }}>AI Assistant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close"
              >
                <MdClose size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {messages.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '14px',
                      padding: '20px'
                    }}
                  >
                    Hi {user?.name}! I'm your AI assistant. How can I help you today?
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '10px 14px',
                        borderRadius: '18px',
                        background: message.role === 'user'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : message.isError
                          ? '#ff4757'
                          : isDark 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        color: message.role === 'user' || message.isError
                          ? 'white'
                          : isDark 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : 'rgba(0, 0, 0, 0.8)',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        wordWrap: 'break-word'
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '18px',
                        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: 'currentColor',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: 'currentColor',
                          animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                        }} />
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: 'currentColor',
                          animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                        }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '16px',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end'
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    minHeight: '20px',
                    maxHeight: '80px',
                    padding: '10px 12px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '20px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: inputValue.trim() && !isLoading
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : isDark 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    color: inputValue.trim() && !isLoading
                      ? 'white'
                      : isDark 
                      ? 'rgba(255, 255, 255, 0.4)' 
                      : 'rgba(0, 0, 0, 0.4)',
                    cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Send message"
                >
                  <MdSend />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;