/**
 * Chat Request DTO
 * Data Transfer Object for AI chat requests
 */
class ChatRequestDTO {
  constructor(data = {}) {
    this.message = data.message;
    this.conversation_id = data.conversation_id;
    this.context = data.context || {};
  }

  /**
   * Validate chat request
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.message || typeof this.message !== 'string') {
      errors.push('message is required and must be a string');
    }

    if (this.message && this.message.trim().length === 0) {
      errors.push('message cannot be empty');
    }

    if (this.message && this.message.length > 5000) {
      errors.push('message must be less than 5000 characters');
    }

    if (this.conversation_id && typeof this.conversation_id !== 'string') {
      errors.push('conversation_id must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input
   * @returns {ChatRequestDTO} Sanitized DTO
   */
  sanitize() {
    return new ChatRequestDTO({
      message: this.message ? this.message.trim() : '',
      conversation_id: this.conversation_id,
      context: this.context || {}
    });
  }
}

module.exports = ChatRequestDTO;