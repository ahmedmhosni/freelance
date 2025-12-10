/**
 * Update Settings DTO
 * Data Transfer Object for updating AI settings
 */
class UpdateSettingsDTO {
  constructor(data = {}) {
    this.enabled = data.enabled;
    this.provider = data.provider;
    this.model = data.model;
    this.max_tokens = data.max_tokens;
    this.temperature = data.temperature;
    this.system_prompt = data.system_prompt;
    this.rate_limit_per_user = data.rate_limit_per_user;
    this.rate_limit_window = data.rate_limit_window;
    this.welcome_message = data.welcome_message;
  }

  /**
   * Validate settings update
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (this.enabled !== undefined && typeof this.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }

    if (this.provider && !['gemini', 'openai', 'azure-openai'].includes(this.provider)) {
      errors.push('provider must be one of: gemini, openai, azure-openai');
    }

    if (this.max_tokens !== undefined) {
      if (typeof this.max_tokens !== 'number' || this.max_tokens < 100 || this.max_tokens > 4000) {
        errors.push('max_tokens must be a number between 100 and 4000');
      }
    }

    if (this.temperature !== undefined) {
      if (typeof this.temperature !== 'number' || this.temperature < 0 || this.temperature > 2) {
        errors.push('temperature must be a number between 0 and 2');
      }
    }

    if (this.rate_limit_per_user !== undefined) {
      if (typeof this.rate_limit_per_user !== 'number' || this.rate_limit_per_user < 1 || this.rate_limit_per_user > 100) {
        errors.push('rate_limit_per_user must be a number between 1 and 100');
      }
    }

    if (this.rate_limit_window !== undefined) {
      if (typeof this.rate_limit_window !== 'number' || this.rate_limit_window < 60 || this.rate_limit_window > 86400) {
        errors.push('rate_limit_window must be a number between 60 and 86400');
      }
    }

    if (this.system_prompt && typeof this.system_prompt !== 'string') {
      errors.push('system_prompt must be a string');
    }

    if (this.welcome_message && typeof this.welcome_message !== 'string') {
      errors.push('welcome_message must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get only defined properties
   * @returns {Object} Object with only defined properties
   */
  getDefinedProperties() {
    const result = {};
    
    Object.keys(this).forEach(key => {
      if (this[key] !== undefined) {
        result[key] = this[key];
      }
    });

    return result;
  }
}

module.exports = UpdateSettingsDTO;