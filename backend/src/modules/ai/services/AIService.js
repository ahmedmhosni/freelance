const { v4: uuidv4 } = require('uuid');
const AISettings = require('../models/AISettings');
const AIConversation = require('../models/AIConversation');
const AIUsage = require('../models/AIUsage');
const ChatRequestDTO = require('../dto/ChatRequestDTO');
const ChatResponseDTO = require('../dto/ChatResponseDTO');
const UpdateSettingsDTO = require('../dto/UpdateSettingsDTO');
const GeminiProvider = require('../../../services/ai-providers/GeminiProvider');

/**
 * AI Service
 * Business logic for AI operations
 */
class AIService {
  constructor(repository) {
    this.repository = repository;
    this.provider = null;
    this.settings = null;
  }

  /**
   * Initialize AI service
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load settings from database
      this.settings = await this.repository.getSettings();
      
      if (!this.settings) {
        // Create default settings
        this.settings = new AISettings({
          enabled: true,
          provider: 'gemini',
          model: 'gemini-pro'
        });
        await this.repository.updateSettings(this.settings);
      }

      // Initialize provider if enabled
      if (this.settings.enabled && process.env.GEMINI_API_KEY) {
        this.provider = new GeminiProvider(process.env.GEMINI_API_KEY, this.settings);
      }
    } catch (error) {
      console.warn('AI service initialization failed:', error.message);
      // Use default settings if database fails
      this.settings = new AISettings();
    }
  }

  /**
   * Check if AI is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.settings?.enabled && this.provider !== null;
  }

  /**
   * Get AI status
   * @returns {Object} AI status
   */
  getStatus() {
    return {
      enabled: this.isEnabled(),
      provider: this.settings?.provider || 'none',
      message: this.isEnabled() ? 'AI Assistant is available' : 'AI Assistant is disabled'
    };
  }

  /**
   * Chat with AI
   * @param {number} userId - User ID
   * @param {ChatRequestDTO} chatRequest - Chat request
   * @returns {Promise<ChatResponseDTO>} Chat response
   */
  async chat(userId, chatRequest) {
    if (!this.isEnabled()) {
      throw new Error('AI Assistant is not enabled or configured');
    }

    // Validate request
    const validation = chatRequest.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
    }

    // Check rate limits
    await this.checkRateLimits(userId);

    // Generate conversation ID if not provided
    const conversationId = chatRequest.conversation_id || uuidv4();

    // Get conversation history
    const history = await this.repository.getConversationHistory(userId, conversationId);

    // Save user message
    const userMessage = new AIConversation({
      user_id: userId,
      conversation_id: conversationId,
      role: 'user',
      content: chatRequest.message
    });
    await this.repository.saveConversation(userMessage);

    try {
      // Generate AI response
      const startTime = Date.now();
      const response = await this.provider.generateResponse(
        chatRequest.message,
        history.map(h => ({ role: h.role, content: h.content }))
      );
      const responseTime = Date.now() - startTime;

      // Save AI response
      const aiMessage = new AIConversation({
        user_id: userId,
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        tokens_used: this.estimateTokens(response),
        response_time: responseTime
      });
      await this.repository.saveConversation(aiMessage);

      // Update usage
      await this.incrementUsage(userId);
      await this.repository.updateAnalytics(userId);

      // Get updated usage
      const usage = await this.repository.getUserUsage(userId);

      return new ChatResponseDTO({
        response,
        conversation_id: conversationId,
        tokens_used: aiMessage.tokens_used,
        response_time: responseTime,
        usage: usage ? usage.toResponse() : {}
      });

    } catch (error) {
      throw new Error(`AI response failed: ${error.message}`);
    }
  }

  /**
   * Check rate limits for user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   * @throws {Error} If rate limit exceeded
   */
  async checkRateLimits(userId) {
    let usage = await this.repository.getUserUsage(userId);

    if (!usage) {
      // Create new usage record
      usage = new AIUsage({
        user_id: userId,
        daily_requests: 0,
        monthly_requests: 0,
        last_request_date: new Date().toISOString().split('T')[0]
      });
      await this.repository.saveUserUsage(usage);
      return;
    }

    // Reset daily counter if needed
    if (usage.needsDailyReset()) {
      usage.resetDaily();
      await this.repository.saveUserUsage(usage);
    }

    // Check limits
    if (usage.isDailyLimitReached(this.settings.rate_limit_per_user)) {
      throw new Error('Daily AI request limit reached');
    }

    // For now, we'll use daily limit as monthly limit too
    // In a real implementation, you'd have separate monthly tracking
    if (usage.isMonthlyLimitReached(this.settings.rate_limit_per_user * 30)) {
      throw new Error('Monthly AI request limit reached');
    }
  }

  /**
   * Increment user usage
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async incrementUsage(userId) {
    const usage = await this.repository.getUserUsage(userId);
    if (usage) {
      usage.incrementUsage();
      await this.repository.saveUserUsage(usage);
    }
  }

  /**
   * Get user conversations
   * @param {number} userId - User ID
   * @returns {Promise<Object[]>} User conversations
   */
  async getUserConversations(userId) {
    return await this.repository.getUserConversations(userId);
  }

  /**
   * Get conversation history
   * @param {number} userId - User ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<AIConversation[]>} Conversation history
   */
  async getConversationHistory(userId, conversationId) {
    return await this.repository.getConversationHistory(userId, conversationId);
  }

  /**
   * Get user usage
   * @param {number} userId - User ID
   * @returns {Promise<AIUsage|null>} User usage
   */
  async getUserUsage(userId) {
    return await this.repository.getUserUsage(userId);
  }

  // ==================== Admin Methods ====================

  /**
   * Get AI settings (Admin)
   * @returns {Promise<AISettings>} AI settings
   */
  async getSettings() {
    if (!this.settings) {
      await this.initialize();
    }
    return this.settings;
  }

  /**
   * Update AI settings (Admin)
   * @param {UpdateSettingsDTO} updateDTO - Settings to update
   * @returns {Promise<AISettings>} Updated settings
   */
  async updateSettings(updateDTO) {
    // Validate update
    const validation = updateDTO.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
    }

    // Get current settings
    const currentSettings = await this.getSettings();
    
    // Merge with new settings
    const updatedData = { ...currentSettings, ...updateDTO.getDefinedProperties() };
    const newSettings = new AISettings(updatedData);

    // Validate merged settings
    const settingsValidation = newSettings.validate();
    if (!settingsValidation.isValid) {
      throw new Error(`Invalid settings: ${settingsValidation.errors.join(', ')}`);
    }

    // Save to database
    this.settings = await this.repository.updateSettings(newSettings);

    // Reinitialize provider if needed
    if (this.settings.enabled && process.env.GEMINI_API_KEY) {
      this.provider = new GeminiProvider(process.env.GEMINI_API_KEY, this.settings);
    } else if (!this.settings.enabled) {
      this.provider = null;
    }

    return this.settings;
  }

  /**
   * Test AI connection (Admin)
   * @returns {Promise<Object>} Connection test result
   */
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

  /**
   * Get usage statistics (Admin)
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    return await this.repository.getUsageStats();
  }

  /**
   * Get all users usage (Admin)
   * @returns {Promise<Object[]>} All users usage
   */
  async getAllUsage() {
    return await this.repository.getAllUsage();
  }

  // ==================== Helper Methods ====================

  /**
   * Estimate tokens used (simple approximation)
   * @param {string} text - Text to estimate
   * @returns {number} Estimated tokens
   */
  estimateTokens(text) {
    // Simple approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

module.exports = AIService;