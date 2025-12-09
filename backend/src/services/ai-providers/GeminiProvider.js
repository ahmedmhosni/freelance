/**
 * Google Gemini AI Provider
 * Handles communication with Google Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class GeminiProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use models/gemini-2.5-flash (free tier, fast responses)
    this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    this.providerName = 'gemini';
  }

  /**
   * Send a chat message and get response
   * @param {string} message - User message
   * @param {Object} context - Additional context (page, feature, etc.)
   * @param {string} systemPrompt - System instructions
   * @returns {Promise<Object>} Response with text and metadata
   */
  async chat(message, context = {}, systemPrompt = '') {
    const startTime = Date.now();
    
    try {
      // Build the full prompt with context
      const fullPrompt = this.buildPrompt(message, context, systemPrompt);
      
      logger.info('Sending request to Gemini API', {
        messageLength: message.length,
        context: context
      });

      // Generate content
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      const responseTime = Date.now() - startTime;
      
      // Estimate tokens (Gemini doesn't provide exact count in free tier)
      const estimatedTokens = this.estimateTokens(message + text);
      
      logger.info('Received response from Gemini', {
        responseLength: text.length,
        responseTime,
        estimatedTokens
      });

      return {
        response: text,
        tokens: estimatedTokens,
        responseTime,
        provider: this.providerName
      };
    } catch (error) {
      logger.error('Gemini API error', error);
      
      // Handle specific error types
      if (error.message?.includes('quota')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      }
      
      if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Build full prompt with context and system instructions
   */
  buildPrompt(message, context, systemPrompt) {
    let prompt = '';
    
    // Add system prompt
    if (systemPrompt) {
      prompt += `${systemPrompt}\n\n`;
    }
    
    // Add context if available
    if (context.page) {
      prompt += `User is currently on: ${context.page} page\n`;
    }
    
    if (context.feature) {
      prompt += `Current feature: ${context.feature}\n`;
    }
    
    // Add the actual user message
    prompt += `\nUser question: ${message}\n\nPlease provide a helpful, concise response:`;
    
    return prompt;
  }

  /**
   * Estimate token count (rough approximation)
   * Gemini free tier doesn't provide exact token counts
   */
  estimateTokens(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return this.providerName;
  }

  /**
   * Check if provider is available
   */
  async healthCheck() {
    try {
      const result = await this.model.generateContent('Hello');
      return { healthy: true, provider: this.providerName };
    } catch (error) {
      logger.error('Gemini health check failed', error);
      return { healthy: false, provider: this.providerName, error: error.message };
    }
  }
}

module.exports = GeminiProvider;
