/**
 * AI Conversation Model
 * Represents a conversation message between user and AI
 */
class AIConversation {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.conversation_id = data.conversation_id;
    this.role = data.role; // 'user' or 'assistant'
    this.content = data.content;
    this.tokens_used = data.tokens_used || 0;
    this.response_time = data.response_time || 0;
    this.created_at = data.created_at;
  }

  /**
   * Validate conversation data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push('user_id is required');
    }

    if (!this.conversation_id) {
      errors.push('conversation_id is required');
    }

    if (!['user', 'assistant'].includes(this.role)) {
      errors.push('role must be either "user" or "assistant"');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('content is required');
    }

    if (this.content && this.content.length > 10000) {
      errors.push('content must be less than 10000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    return {
      user_id: this.user_id,
      conversation_id: this.conversation_id,
      role: this.role,
      content: this.content,
      tokens_used: this.tokens_used,
      response_time: this.response_time
    };
  }

  /**
   * Convert to API response format
   * @returns {Object} API-ready object
   */
  toResponse() {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      tokens_used: this.tokens_used,
      response_time: this.response_time,
      created_at: this.created_at
    };
  }
}

module.exports = AIConversation;