/**
 * Chat Response DTO
 * Data Transfer Object for AI chat responses
 */
class ChatResponseDTO {
  constructor(data = {}) {
    this.response = data.response;
    this.conversation_id = data.conversation_id;
    this.tokens_used = data.tokens_used || 0;
    this.response_time = data.response_time || 0;
    this.usage = data.usage || {};
  }

  /**
   * Convert to API response format
   * @returns {Object} API-ready response
   */
  toResponse() {
    return {
      response: this.response,
      conversation_id: this.conversation_id,
      tokens_used: this.tokens_used,
      response_time: this.response_time,
      usage: this.usage
    };
  }
}

module.exports = ChatResponseDTO;