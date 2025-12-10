const BaseRepository = require('../../../shared/base/BaseRepository');
const AISettings = require('../models/AISettings');
const AIConversation = require('../models/AIConversation');
const AIUsage = require('../models/AIUsage');

/**
 * AI Repository
 * Data access layer for AI-related operations
 */
class AIRepository extends BaseRepository {
  constructor(database) {
    super(database, 'ai_settings');
  }

  // ==================== AI Settings ====================

  /**
   * Get AI settings
   * @returns {Promise<AISettings|null>} AI settings or null
   */
  async getSettings() {
    try {
      const result = await this.db.query('SELECT * FROM ai_settings WHERE id = 1');
      return result.rows.length > 0 ? new AISettings(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to get AI settings: ${error.message}`);
    }
  }

  /**
   * Update AI settings
   * @param {AISettings} settings - AI settings to update
   * @returns {Promise<AISettings>} Updated settings
   */
  async updateSettings(settings) {
    try {
      const data = settings.toDatabase();
      const result = await this.db.query(`
        INSERT INTO ai_settings (id, enabled, provider, model, max_tokens, temperature, 
                                  system_prompt, rate_limit_per_user, rate_limit_window, welcome_message)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) 
        DO UPDATE SET 
          enabled = $1,
          provider = $2,
          model = $3,
          max_tokens = $4,
          temperature = $5,
          system_prompt = $6,
          rate_limit_per_user = $7,
          rate_limit_window = $8,
          welcome_message = $9,
          updated_at = NOW()
        RETURNING *
      `, [
        data.enabled, data.provider, data.model, data.max_tokens, data.temperature,
        data.system_prompt, data.rate_limit_per_user, data.rate_limit_window, data.welcome_message
      ]);

      return new AISettings(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update AI settings: ${error.message}`);
    }
  }

  // ==================== AI Conversations ====================

  /**
   * Save conversation message
   * @param {AIConversation} conversation - Conversation to save
   * @returns {Promise<AIConversation>} Saved conversation
   */
  async saveConversation(conversation) {
    try {
      const data = conversation.toDatabase();
      const result = await this.db.query(`
        INSERT INTO ai_conversations (user_id, conversation_id, role, content, tokens_used, response_time)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.user_id, data.conversation_id, data.role, 
        data.content, data.tokens_used, data.response_time
      ]);

      return new AIConversation(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to save conversation: ${error.message}`);
    }
  }

  /**
   * Get conversation history
   * @param {number} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<AIConversation[]>} Conversation history
   */
  async getConversationHistory(userId, conversationId) {
    try {
      const result = await this.db.query(`
        SELECT * FROM ai_conversations
        WHERE user_id = $1 AND conversation_id = $2
        ORDER BY created_at ASC
      `, [userId, conversationId]);

      return result.rows.map(row => new AIConversation(row));
    } catch (error) {
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }

  /**
   * Get user conversations
   * @param {number} userId - User ID
   * @param {number} limit - Limit number of conversations
   * @returns {Promise<Object[]>} User conversations
   */
  async getUserConversations(userId, limit = 50) {
    try {
      const result = await this.db.query(`
        SELECT DISTINCT conversation_id, 
               MIN(created_at) as started_at,
               MAX(created_at) as last_message_at,
               COUNT(*) as message_count
        FROM ai_conversations
        WHERE user_id = $1
        GROUP BY conversation_id
        ORDER BY last_message_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get user conversations: ${error.message}`);
    }
  }

  // ==================== AI Usage ====================

  /**
   * Get user usage
   * @param {number} userId - User ID
   * @returns {Promise<AIUsage|null>} User usage or null
   */
  async getUserUsage(userId) {
    try {
      const result = await this.db.query(`
        SELECT * FROM ai_usage WHERE user_id = $1
      `, [userId]);

      return result.rows.length > 0 ? new AIUsage(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to get user usage: ${error.message}`);
    }
  }

  /**
   * Create or update user usage
   * @param {AIUsage} usage - Usage to save
   * @returns {Promise<AIUsage>} Saved usage
   */
  async saveUserUsage(usage) {
    try {
      const data = usage.toDatabase();
      const result = await this.db.query(`
        INSERT INTO ai_usage (user_id, daily_requests, monthly_requests, last_request_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET
          daily_requests = $2,
          monthly_requests = $3,
          last_request_date = $4,
          updated_at = NOW()
        RETURNING *
      `, [data.user_id, data.daily_requests, data.monthly_requests, data.last_request_date]);

      return new AIUsage(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to save user usage: ${error.message}`);
    }
  }

  /**
   * Get usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    try {
      // Get total requests
      const totalResult = await this.db.query(`
        SELECT COALESCE(SUM(total_requests), 0) as total_requests
        FROM ai_analytics
      `);

      // Get active users (users who made requests in last 30 days)
      const activeUsersResult = await this.db.query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM ai_conversations
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);

      // Get requests today
      const todayResult = await this.db.query(`
        SELECT COALESCE(total_requests, 0) as requests_today
        FROM ai_analytics
        WHERE date = CURRENT_DATE
      `);

      return {
        total_requests: parseInt(totalResult.rows[0]?.total_requests || 0),
        active_users: parseInt(activeUsersResult.rows[0]?.active_users || 0),
        requests_today: parseInt(todayResult.rows[0]?.requests_today || 0),
        avg_response_time: 1200 // Mock data for now
      };
    } catch (error) {
      throw new Error(`Failed to get usage stats: ${error.message}`);
    }
  }

  /**
   * Update analytics
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async updateAnalytics(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await this.db.query(`
        INSERT INTO ai_analytics (date, total_requests, unique_users)
        VALUES ($1, 1, 1)
        ON CONFLICT (date) 
        DO UPDATE SET 
          total_requests = ai_analytics.total_requests + 1,
          unique_users = (
            SELECT COUNT(DISTINCT user_id) 
            FROM ai_conversations 
            WHERE DATE(created_at) = $1
          )
      `, [today]);
    } catch (error) {
      throw new Error(`Failed to update analytics: ${error.message}`);
    }
  }

  /**
   * Get all users usage (for admin)
   * @param {number} limit - Limit number of results
   * @returns {Promise<Object[]>} Users usage
   */
  async getAllUsage(limit = 100) {
    try {
      const result = await this.db.query(`
        SELECT u.id, u.name, u.email, 
               au.daily_requests, au.monthly_requests, au.last_request_date
        FROM users u
        LEFT JOIN ai_usage au ON u.id = au.user_id
        WHERE au.user_id IS NOT NULL
        ORDER BY au.monthly_requests DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get all usage: ${error.message}`);
    }
  }
}

module.exports = AIRepository;