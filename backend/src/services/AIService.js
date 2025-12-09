/**
 * AI Service
 * Main service for AI assistant functionality
 * Handles provider abstraction, rate limiting, and usage tracking
 */

const GeminiProvider = require('./ai-providers/GeminiProvider');
const AzureOpenAIProvider = require('./ai-providers/AzureOpenAIProvider');
const logger = require('../utils/logger');

class AIService {
  constructor(database) {
    this.database = database;
    this.provider = null;
    this.initializeProvider();
  }

  /**
   * Initialize AI provider based on configuration
   */
  initializeProvider() {
    const provider = process.env.AI_PROVIDER || 'gemini';
    
    try {
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          logger.warn('Gemini API key not configured');
          return;
        }
        this.provider = new GeminiProvider(apiKey);
        logger.info('Gemini AI provider initialized');
      } else if (provider === 'azure-openai') {
        const config = {
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT,
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT
        };
        this.provider = new AzureOpenAIProvider(config);
        logger.info('Azure OpenAI provider initialized');
      } else {
        logger.warn(`Unknown AI provider: ${provider}`);
      }
    } catch (error) {
      logger.error('Failed to initialize AI provider', error);
    }
  }

  /**
   * Check if AI assistant is enabled
   */
  async isEnabled() {
    try {
      const settings = await this.database.queryOne(
        'SELECT enabled FROM ai_settings ORDER BY id DESC LIMIT 1'
      );
      return settings?.enabled || false;
    } catch (error) {
      logger.error('Error checking AI enabled status', error);
      return false;
    }
  }

  /**
   * Get AI settings
   */
  async getSettings() {
    try {
      const settings = await this.database.queryOne(
        'SELECT * FROM ai_settings ORDER BY id DESC LIMIT 1'
      );
      return settings || {
        enabled: false,
        provider: 'gemini',
        max_requests_per_user_per_day: 50,
        max_requests_per_user_per_hour: 10
      };
    } catch (error) {
      logger.error('Error fetching AI settings', error);
      throw error;
    }
  }

  /**
   * Update AI settings (Admin only)
   */
  async updateSettings(settings) {
    try {
      const result = await this.database.queryOne(`
        UPDATE ai_settings 
        SET 
          enabled = COALESCE($1, enabled),
          provider = COALESCE($2, provider),
          max_requests_per_user_per_day = COALESCE($3, max_requests_per_user_per_day),
          max_requests_per_user_per_hour = COALESCE($4, max_requests_per_user_per_hour),
          max_message_length = COALESCE($5, max_message_length),
          system_prompt = COALESCE($6, system_prompt),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM ai_settings ORDER BY id DESC LIMIT 1)
        RETURNING *
      `, [
        settings.enabled,
        settings.provider,
        settings.maxRequestsPerDay,
        settings.maxRequestsPerHour,
        settings.maxMessageLength,
        settings.systemPrompt
      ]);

      // Reinitialize provider if changed
      if (settings.provider && settings.provider !== this.provider?.getProviderName()) {
        this.initializeProvider();
      }

      return result;
    } catch (error) {
      logger.error('Error updating AI settings', error);
      throw error;
    }
  }

  /**
   * Check user rate limits
   */
  async checkRateLimit(userId) {
    try {
      const settings = await this.getSettings();
      
      // Get or create user usage record
      let usage = await this.database.queryOne(
        'SELECT * FROM ai_usage WHERE user_id = $1',
        [userId]
      );

      if (!usage) {
        usage = await this.database.queryOne(`
          INSERT INTO ai_usage (user_id, daily_reset_at, hourly_reset_at)
          VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 hour')
          RETURNING *
        `, [userId]);
      }

      const now = new Date();
      
      // Reset daily count if needed
      if (new Date(usage.daily_reset_at) < now) {
        await this.database.query(`
          UPDATE ai_usage 
          SET daily_count = 0, daily_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 day'
          WHERE user_id = $1
        `, [userId]);
        usage.daily_count = 0;
      }

      // Reset hourly count if needed
      if (new Date(usage.hourly_reset_at) < now) {
        await this.database.query(`
          UPDATE ai_usage 
          SET hourly_count = 0, hourly_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
          WHERE user_id = $1
        `, [userId]);
        usage.hourly_count = 0;
      }

      // Check limits
      if (usage.daily_count >= settings.max_requests_per_user_per_day) {
        return {
          allowed: false,
          reason: 'daily_limit',
          message: `Daily limit of ${settings.max_requests_per_user_per_day} requests reached. Try again tomorrow.`
        };
      }

      if (usage.hourly_count >= settings.max_requests_per_user_per_hour) {
        return {
          allowed: false,
          reason: 'hourly_limit',
          message: `Hourly limit of ${settings.max_requests_per_user_per_hour} requests reached. Try again in an hour.`
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking rate limit', error);
      throw error;
    }
  }

  /**
   * Increment usage counters
   */
  async incrementUsage(userId, tokensUsed) {
    try {
      await this.database.query(`
        UPDATE ai_usage 
        SET 
          request_count = request_count + 1,
          daily_count = daily_count + 1,
          hourly_count = hourly_count + 1,
          total_tokens_used = total_tokens_used + $2,
          last_request_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId, tokensUsed]);
    } catch (error) {
      logger.error('Error incrementing usage', error);
    }
  }

  /**
   * Send chat message
   */
  async chat(userId, message, context = {}) {
    try {
      // Check if enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        throw new Error('AI assistant is currently disabled');
      }

      // Check if provider is initialized
      if (!this.provider) {
        throw new Error('AI provider not configured');
      }

      // Check rate limits
      const rateLimit = await this.checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message);
      }

      // Get settings for system prompt
      const settings = await this.getSettings();

      // Validate message length
      if (message.length > settings.max_message_length) {
        throw new Error(`Message too long. Maximum ${settings.max_message_length} characters.`);
      }

      // Send to AI provider
      const result = await this.provider.chat(message, context, settings.system_prompt);

      // Increment usage
      await this.incrementUsage(userId, result.tokens);

      // Save conversation history
      await this.saveConversation(userId, message, result.response, context, result.tokens, result.responseTime);

      // Update analytics
      await this.updateAnalytics(result.tokens, result.responseTime);

      return {
        response: result.response,
        provider: result.provider,
        tokensUsed: result.tokens
      };
    } catch (error) {
      logger.error('AI chat error', error);
      
      // Update error count in analytics
      await this.updateAnalytics(0, 0, true);
      
      throw error;
    }
  }

  /**
   * Save conversation to history
   */
  async saveConversation(userId, message, response, context, tokens, responseTime) {
    try {
      await this.database.query(`
        INSERT INTO ai_conversations (user_id, message, response, context, tokens_used, response_time_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, message, response, JSON.stringify(context), tokens, responseTime]);
    } catch (error) {
      logger.error('Error saving conversation', error);
    }
  }

  /**
   * Update analytics
   */
  async updateAnalytics(tokens, responseTime, isError = false) {
    try {
      await this.database.query(`
        INSERT INTO ai_analytics (date, total_requests, total_users, total_tokens, avg_response_time_ms, error_count)
        VALUES (CURRENT_DATE, 1, 1, $1, $2, $3)
        ON CONFLICT (date) DO UPDATE SET
          total_requests = ai_analytics.total_requests + 1,
          total_tokens = ai_analytics.total_tokens + $1,
          avg_response_time_ms = (ai_analytics.avg_response_time_ms * ai_analytics.total_requests + $2) / (ai_analytics.total_requests + 1),
          error_count = ai_analytics.error_count + $3
      `, [tokens, responseTime, isError ? 1 : 0]);
    } catch (error) {
      logger.error('Error updating analytics', error);
    }
  }

  /**
   * Get user usage stats
   */
  async getUserUsage(userId) {
    try {
      const usage = await this.database.queryOne(
        'SELECT * FROM ai_usage WHERE user_id = $1',
        [userId]
      );
      
      const settings = await this.getSettings();
      
      return {
        dailyUsed: usage?.daily_count || 0,
        dailyLimit: settings.max_requests_per_user_per_day,
        hourlyUsed: usage?.hourly_count || 0,
        hourlyLimit: settings.max_requests_per_user_per_hour,
        totalRequests: usage?.request_count || 0,
        totalTokens: usage?.total_tokens_used || 0
      };
    } catch (error) {
      logger.error('Error getting user usage', error);
      throw error;
    }
  }

  /**
   * Get analytics for admin dashboard
   */
  async getAnalytics(days = 7) {
    try {
      const analytics = await this.database.query(`
        SELECT * FROM ai_analytics 
        WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date DESC
      `);
      
      return analytics;
    } catch (error) {
      logger.error('Error getting analytics', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.provider) {
      return { healthy: false, error: 'Provider not initialized' };
    }
    
    return await this.provider.healthCheck();
  }
}

module.exports = AIService;
