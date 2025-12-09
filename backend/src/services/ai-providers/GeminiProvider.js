class GeminiProvider {
  constructor(apiKey, settings) {
    this.apiKey = apiKey;
    this.settings = settings;
    this.client = null;
  }

  async initialize() {
    // Lazy load the Gemini SDK only when needed
    if (!this.client) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.apiKey);
        this.client = genAI.getGenerativeModel({ 
          model: this.settings.model || 'gemini-2.0-flash-exp'
        });
      } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
        throw new Error('Gemini AI client initialization failed');
      }
    }
  }

  async generateResponse(message, history = []) {
    await this.initialize();

    try {
      // Convert history to Gemini format
      const chat = this.client.startChat({
        history: history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

module.exports = GeminiProvider;
