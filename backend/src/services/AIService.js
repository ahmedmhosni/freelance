const { query } = require('../db/postgresql');
const GeminiProvider = require('./ai-providers/GeminiProvider');

class AIService {
  constructor() {
    this.provider = null;
    this.settings = null;
  }

  async initialize() {
    // Load settings from database
    try {
      const result = await query('SELECT * FROM ai_settings WHERE id = 1');
      if (result.rows.length > 0) {
        this.settings = result.rows[0];
        
        // Initialize provider if enabled
        if (this.settings.enabled && process.env.GEMINI_API_KEY) {
          this.provider = new GeminiProvider(process.env.GEMINI_API_KEY, this.settings);
        }
      }
    } catch (error) {
      console.warn('AI settings not found, using defaults');
      this.settings = {
        enabled: false,
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        daily_limit: 100,
        monthly_limit: 1000
      };
    }
  }

  isEnabled() {
    return this.settings?.enabled && this.provider !== null;
  }

  async chat(userId, message, conversationId = null) {
    if (!this.isEnabled()) {
      throw new Error('AI Assistant is not enabled or configured');
    }

    // Check rate limits
    await this.checkRateLimits(userId);

    // Get conversation history if conversationId provided
    let history = [];
    if (conversationId) {
      const historyResult = await query(
        `SELECT role, content FROM ai_conversations 
         WHERE user_id = $1 AND conversation_id = $2 
         ORDER BY created_at ASC`,
        [userId, conversationId]
      );
      history = historyResult.rows;
    }

    // Generate response
    const response = await this.provider.generateResponse(message, history);

    // Create new conversation ID if needed
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${userId}`;
    }

    // Save user message
    await query(
      `INSERT INTO ai_conversations (user_id, conversation_id, role, content)
       VALUES ($1, $2, $3, $4)`,
      [userId, conversationId, 'user', message]
    );

    // Save AI response
    await query(
      `INSERT INTO ai_conversations (user_id, conversation_id, role, content)
       VALUES ($1, $2, $3, $4)`,
      [userId, conversationId, 'assistant', response]
    );

    // Update usage
    await this.incrementUsage(userId);

    // Update analytics
    await this.updateAnalytics(userId);

    return {
      response,
      conversationId
    };
  }

  async checkRateLimits(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `SELECT daily_requests, monthly_requests, last_request_date
       FROM ai_usage
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create usage record
      await query(
        `INSERT INTO ai_usage (user_id, daily_requests, monthly_requests, last_request_date)
         VALUES ($1, 0, 0, $2)`,
        [userId, today]
      );
      return;
    }

    const usage = result.rows[0];
    
    // Reset daily counter if new day
    if (usage.last_request_date !== today) {
      await query(
        `UPDATE ai_usage 
         SET daily_requests = 0, last_request_date = $1
         WHERE user_id = $2`,
        [today, userId]
      );
      usage.daily_requests = 0;
    }

    // Check limits
    if (usage.daily_requests >= this.settings.daily_limit) {
      throw new Error('Daily AI request limit reached');
    }

    if (usage.monthly_requests >= this.settings.monthly_limit) {
      throw new Error('Monthly AI request limit reached');
    }
  }

  async incrementUsage(userId) {
    await query(
      `UPDATE ai_usage 
       SET daily_requests = daily_requests + 1,
           monthly_requests = monthly_requests + 1
       WHERE user_id = $1`,
      [userId]
    );
  }

  async updateAnalytics(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    await query(
      `INSERT INTO ai_analytics (date, total_requests, unique_users)
       VALUES ($1, 1, 1)
       ON CONFLICT (date) 
       DO UPDATE SET 
         total_requests = ai_analytics.total_requests + 1,
         unique_users = (
           SELECT COUNT(DISTINCT user_id) 
           FROM ai_conversations 
           WHERE DATE(created_at) = $1
         )`,
      [today]
    );
  }

  async getUserConversations(userId) {
    const result = await query(
      `SELECT DISTINCT conversation_id, 
              MIN(created_at) as started_at,
              MAX(created_at) as last_message_at,
              COUNT(*) as message_count
       FROM ai_conversations
       WHERE user_id = $1
       GROUP BY conversation_id
       ORDER BY last_message_at DESC
       LIMIT 50`,
      [userId]
    );

    return result.rows;
  }

  async getConversationHistory(userId, conversationId) {
    const result = await query(
      `SELECT role, content, created_at
       FROM ai_conversations
       WHERE user_id = $1 AND conversation_id = $2
       ORDER BY created_at ASC`,
      [userId, conversationId]
    );

    return result.rows;
  }

  async getUserUsage(userId) {
    const result = await query(
      `SELECT daily_requests, monthly_requests, last_request_date
       FROM ai_usage
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        daily_requests: 0,
        monthly_requests: 0,
        daily_limit: this.settings.daily_limit,
        monthly_limit: this.settings.monthly_limit
      };
    }

    return {
      ...result.rows[0],
      daily_limit: this.settings.daily_limit,
      monthly_limit: this.settings.monthly_limit
    };
  }

  async getSettings() {
    return this.settings;
  }

  async updateSettings(newSettings) {
    await query(
      `UPDATE ai_settings 
       SET enabled = $1, provider = $2, model = $3, 
           daily_limit = $4, monthly_limit = $5,
           updated_at = NOW()
       WHERE id = 1`,
      [
        newSettings.enabled,
        newSettings.provider,
        newSettings.model,
        newSettings.daily_limit,
        newSettings.monthly_limit
      ]
    );

    // Reload settings
    await this.initialize();
  }

  async getAnalytics(days = 30) {
    const result = await query(
      `SELECT date, total_requests, unique_users, avg_response_time
       FROM ai_analytics
       WHERE date >= CURRENT_DATE - $1
       ORDER BY date DESC`,
      [days]
    );

    return result.rows;
  }

  async getAllUsage() {
    const result = await query(
      `SELECT u.id, u.name, u.email, 
              au.daily_requests, au.monthly_requests, au.last_request_date
       FROM users u
       LEFT JOIN ai_usage au ON u.id = au.user_id
       WHERE au.user_id IS NOT NULL
       ORDER BY au.monthly_requests DESC
       LIMIT 100`
    );

    return result.rows;
  }

  async getUsageStats() {
    try {
      // Get total requests
      const totalResult = await query(
        `SELECT COALESCE(SUM(total_requests), 0) as total_requests
         FROM ai_analytics`
      );

      // Get active users (users who made requests in last 30 days)
      const activeUsersResult = await query(
        `SELECT COUNT(DISTINCT user_id) as active_users
         FROM ai_conversations
         WHERE created_at >= NOW() - INTERVAL '30 days'`
      );

      // Get requests today
      const todayResult = await query(
        `SELECT COALESCE(total_requests, 0) as requests_today
         FROM ai_analytics
         WHERE date = CURRENT_DATE`
      );

      // Get average response time (mock data for now)
      const avgResponseTime = 1200; // milliseconds

      return {
        total_requests: parseInt(totalResult.rows[0]?.total_requests || 0),
        active_users: parseInt(activeUsersResult.rows[0]?.active_users || 0),
        requests_today: parseInt(todayResult.rows[0]?.requests_today || 0),
        avg_response_time: avgResponseTime
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        total_requests: 0,
        active_users: 0,
        requests_today: 0,
        avg_response_time: 0
      };
    }
  }

  async testConnection() {
    try {
      if (!this.provider) {
        return {
          success: false,
          error: 'AI provider not initialized. Check API key configuration.'
        };
      }

      // Test with a simple message
      const testMessage = 'Hello, this is a connection test. Please respond with "Connection successful".';
      const response = await this.provider.generateResponse(testMessage, []);

      if (response && response.length > 0) {
        return {
          success: true,
          message: 'Connection test successful',
          response: response.substring(0, 100) + '...'
        };
      } else {
        return {
          success: false,
          error: 'No response received from AI provider'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateSettings(newSettings) {
    try {
      // Update settings in database
      await query(
        `INSERT INTO ai_settings (id, enabled, provider, model, max_tokens, temperature, 
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
           updated_at = NOW()`,
        [
          newSettings.enabled,
          newSettings.provider || 'gemini',
          newSettings.model || 'gemini-pro',
          newSettings.max_tokens || 1000,
          newSettings.temperature || 0.7,
          newSettings.system_prompt || 'You are a helpful AI assistant.',
          newSettings.rate_limit_per_user || 10,
          newSettings.rate_limit_window || 3600,
          newSettings.welcome_message || 'Hello! How can I help you today?'
        ]
      );

      // Update local settings
      this.settings = { ...this.settings, ...newSettings };

      // Reinitialize provider if needed
      if (newSettings.enabled && process.env.GEMINI_API_KEY) {
        this.provider = new GeminiProvider(process.env.GEMINI_API_KEY, this.settings);
      } else if (!newSettings.enabled) {
        this.provider = null;
      }

      return true;
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw error;
    }
  }

  async getSettings() {
    try {
      const result = await query('SELECT * FROM ai_settings WHERE id = 1');
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        // Return default settings
        return {
          enabled: false,
          provider: 'gemini',
          model: 'gemini-pro',
          max_tokens: 1000,
          temperature: 0.7,
          system_prompt: 'You are a helpful AI assistant for a freelance management platform.',
          rate_limit_per_user: 10,
          rate_limit_window: 3600,
          welcome_message: 'Hello! I\'m your AI assistant. How can I help you today?'
        };
      }
    } catch (error) {
      console.error('Error getting AI settings:', error);
      throw error;
    }
  }
}

// Singleton instance
const aiService = new AIService();

module.exports = aiService;
