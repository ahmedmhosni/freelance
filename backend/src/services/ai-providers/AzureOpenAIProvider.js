/**
 * Azure OpenAI Provider (Ready for future migration)
 * Handles communication with Azure OpenAI Service
 * 
 * Note: Requires @azure/openai package to be installed
 * Install with: npm install @azure/openai
 */

const logger = require('../../utils/logger');

class AzureOpenAIProvider {
  constructor(config) {
    if (!config.apiKey || !config.endpoint || !config.deployment) {
      throw new Error('Azure OpenAI configuration incomplete');
    }
    
    this.config = config;
    this.client = null;
    this.deployment = config.deployment;
    this.providerName = 'azure-openai';
    this.initialized = false;
  }

  /**
   * Lazy load Azure OpenAI package and initialize client
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Lazy load the @azure/openai package only when this provider is used
      const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
      
      this.client = new OpenAIClient(
        this.config.endpoint,
        new AzureKeyCredential(this.config.apiKey)
      );
      
      this.initialized = true;
      logger.info('Azure OpenAI provider initialized successfully');
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          'Azure OpenAI package not installed. Run: npm install @azure/openai'
        );
      }
      throw error;
    }
  }

  /**
   * Send a chat message and get response
   */
  async chat(message, context = {}, systemPrompt = '') {
    // Ensure client is initialized before use
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const messages = this.buildMessages(message, context, systemPrompt);
      
      logger.info('Sending request to Azure OpenAI', {
        messageLength: message.length,
        context: context
      });

      const result = await this.client.getChatCompletions(
        this.deployment,
        messages,
        {
          maxTokens: 500,
          temperature: 0.7
        }
      );
      
      const responseTime = Date.now() - startTime;
      const choice = result.choices[0];
      const text = choice.message.content;
      const tokens = result.usage.totalTokens;
      
      logger.info('Received response from Azure OpenAI', {
        responseLength: text.length,
        responseTime,
        tokens
      });

      return {
        response: text,
        tokens,
        responseTime,
        provider: this.providerName
      };
    } catch (error) {
      logger.error('Azure OpenAI error', error);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Build messages array for OpenAI format
   */
  buildMessages(message, context, systemPrompt) {
    const messages = [];
    
    // System message
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add context as system message
    if (context.page || context.feature) {
      let contextMsg = 'Context: ';
      if (context.page) contextMsg += `User is on ${context.page} page. `;
      if (context.feature) contextMsg += `Current feature: ${context.feature}.`;
      
      messages.push({
        role: 'system',
        content: contextMsg
      });
    }
    
    // User message
    messages.push({
      role: 'user',
      content: message
    });
    
    return messages;
  }

  getProviderName() {
    return this.providerName;
  }

  async healthCheck() {
    try {
      await this.initialize();
      await this.chat('Hello', {}, '');
      return { healthy: true, provider: this.providerName };
    } catch (error) {
      logger.error('Azure OpenAI health check failed', error);
      return { healthy: false, provider: this.providerName, error: error.message };
    }
  }
}

module.exports = AzureOpenAIProvider;
