/**
 * User Preferences Model
 */
class UserPreferences {
  constructor(data = {}) {
    this.user_id = data.user_id;
    this.email_marketing = data.email_marketing !== undefined ? data.email_marketing : true;
    this.email_notifications = data.email_notifications !== undefined ? data.email_notifications : true;
    this.email_updates = data.email_updates !== undefined ? data.email_updates : true;
    this.theme = data.theme || 'light';
    this.language = data.language || 'en';
    this.timezone = data.timezone || 'UTC';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Validate preferences data
   */
  validate() {
    const errors = [];

    if (this.theme && !['light', 'dark'].includes(this.theme)) {
      errors.push('Theme must be either "light" or "dark"');
    }

    if (typeof this.email_marketing !== 'boolean') {
      errors.push('email_marketing must be a boolean');
    }

    if (typeof this.email_notifications !== 'boolean') {
      errors.push('email_notifications must be a boolean');
    }

    if (typeof this.email_updates !== 'boolean') {
      errors.push('email_updates must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to database format
   */
  toDatabase() {
    return {
      user_id: this.user_id,
      email_marketing: this.email_marketing,
      email_notifications: this.email_notifications,
      email_updates: this.email_updates,
      theme: this.theme,
      language: this.language,
      timezone: this.timezone
    };
  }

  /**
   * Convert to API response format
   */
  toJSON() {
    return {
      email_marketing: this.email_marketing,
      email_notifications: this.email_notifications,
      email_updates: this.email_updates,
      theme: this.theme,
      language: this.language,
      timezone: this.timezone,
      updated_at: this.updated_at
    };
  }
}

module.exports = UserPreferences;
