/**
 * AI Settings Model
 * Represents AI configuration settings
 */
class AISettings {
  constructor(data = {}) {
    this.id = data.id || 1;
    this.enabled = data.enabled || false;
    this.provider = data.provider || 'gemini';
    this.model = data.model || 'gemini-2.0-flash';
    this.max_tokens = data.max_tokens || 1000;
    this.temperature = data.temperature || 0.7;
    this.system_prompt = data.system_prompt || 'You are a helpful AI assistant for a freelance management platform.';
    this.rate_limit_per_user = data.rate_limit_per_user || 10;
    this.rate_limit_window = data.rate_limit_window || 3600;
    this.welcome_message = data.welcome_message || 'Hello! I\'m your AI assistant. How can I help you today?';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Validate settings
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (typeof this.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }

    if (!['gemini', 'openai', 'azure-openai'].includes(this.provider)) {
      errors.push('provider must be one of: gemini, openai, azure-openai');
    }

    if (this.max_tokens < 100 || this.max_tokens > 4000) {
      errors.push('max_tokens must be between 100 and 4000');
    }

    if (this.temperature < 0 || this.temperature > 2) {
      errors.push('temperature must be between 0 and 2');
    }

    if (this.rate_limit_per_user < 1 || this.rate_limit_per_user > 100) {
      errors.push('rate_limit_per_user must be between 1 and 100');
    }

    if (this.rate_limit_window < 60 || this.rate_limit_window > 86400) {
      errors.push('rate_limit_window must be between 60 and 86400 seconds');
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
      id: this.id,
      enabled: this.enabled,
      provider: this.provider,
      model: this.model,
      max_tokens: this.max_tokens,
      temperature: this.temperature,
      system_prompt: this.system_prompt,
      rate_limit_per_user: this.rate_limit_per_user,
      rate_limit_window: this.rate_limit_window,
      welcome_message: this.welcome_message
    };
  }

  /**
   * Convert to API response format
   * @returns {Object} API-ready object
   */
  toResponse() {
    return {
      id: this.id,
      enabled: this.enabled,
      provider: this.provider,
      model: this.model,
      max_tokens: this.max_tokens,
      temperature: this.temperature,
      system_prompt: this.system_prompt,
      rate_limit_per_user: this.rate_limit_per_user,
      rate_limit_window: this.rate_limit_window,
      welcome_message: this.welcome_message,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AISettings;