const UserPreferences = require('../models/UserPreferences');

/**
 * User Preferences Service
 * Business logic for user preferences management
 */
class UserPreferencesService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    let preferences = await this.repository.getByUserId(userId);
    
    // If no preferences exist, return defaults
    if (!preferences) {
      preferences = new UserPreferences({ user_id: userId });
    }

    return preferences.toJSON();
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferencesData) {
    const preferences = new UserPreferences({
      user_id: userId,
      ...preferencesData
    });

    // Validate
    const validation = preferences.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const updated = await this.repository.upsert(userId, preferences.toDatabase());
    return updated.toJSON();
  }

  /**
   * Get email preferences
   */
  async getEmailPreferences(userId) {
    const preferences = await this.repository.getByUserId(userId);
    
    if (!preferences) {
      // Return defaults
      return {
        marketing: true,
        notifications: true,
        updates: true
      };
    }

    return {
      marketing: preferences.email_marketing,
      notifications: preferences.email_notifications,
      updates: preferences.email_updates
    };
  }

  /**
   * Update email preferences
   */
  async updateEmailPreferences(userId, emailPrefs) {
    const updated = await this.repository.updateEmailPreferences(userId, emailPrefs);
    
    return {
      marketing: updated.email_marketing,
      notifications: updated.email_notifications,
      updates: updated.email_updates
    };
  }

  /**
   * Delete user preferences (GDPR)
   */
  async deletePreferences(userId) {
    await this.repository.deleteByUserId(userId);
  }
}

module.exports = UserPreferencesService;
