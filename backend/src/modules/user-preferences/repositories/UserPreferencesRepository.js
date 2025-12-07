const BaseRepository = require('../../../shared/base/BaseRepository');
const UserPreferences = require('../models/UserPreferences');

/**
 * User Preferences Repository
 * Handles data access for user preferences
 */
class UserPreferencesRepository extends BaseRepository {
  constructor(database) {
    super(database, 'user_preferences');
  }

  /**
   * Get preferences by user ID
   */
  async getByUserId(userId) {
    const sql = `
      SELECT * FROM user_preferences
      WHERE user_id = $1
    `;
    
    const result = await this.db.queryOne(sql, [userId]);
    return result ? new UserPreferences(result) : null;
  }

  /**
   * Create or update user preferences
   */
  async upsert(userId, preferences) {
    const sql = `
      INSERT INTO user_preferences (
        user_id, email_marketing, email_notifications, email_updates,
        theme, language, timezone, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        email_marketing = EXCLUDED.email_marketing,
        email_notifications = EXCLUDED.email_notifications,
        email_updates = EXCLUDED.email_updates,
        theme = EXCLUDED.theme,
        language = EXCLUDED.language,
        timezone = EXCLUDED.timezone,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await this.db.queryOne(sql, [
      userId,
      preferences.email_marketing,
      preferences.email_notifications,
      preferences.email_updates,
      preferences.theme,
      preferences.language,
      preferences.timezone
    ]);

    return new UserPreferences(result);
  }

  /**
   * Update email preferences only
   */
  async updateEmailPreferences(userId, emailPrefs) {
    const sql = `
      INSERT INTO user_preferences (
        user_id, email_marketing, email_notifications, email_updates, updated_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        email_marketing = EXCLUDED.email_marketing,
        email_notifications = EXCLUDED.email_notifications,
        email_updates = EXCLUDED.email_updates,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await this.db.queryOne(sql, [
      userId,
      emailPrefs.marketing,
      emailPrefs.notifications,
      emailPrefs.updates
    ]);

    return new UserPreferences(result);
  }

  /**
   * Delete user preferences (for GDPR compliance)
   */
  async deleteByUserId(userId) {
    const sql = `DELETE FROM user_preferences WHERE user_id = $1`;
    await this.db.execute(sql, [userId]);
  }
}

module.exports = UserPreferencesRepository;
