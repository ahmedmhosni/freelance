const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/AIService');

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI Assistant
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiService.isEnabled()) {
      return res.status(503).json({
        error: 'AI Assistant is not enabled',
        message: 'Please configure GEMINI_API_KEY in environment settings'
      });
    }

    const result = await aiService.chat(req.user.id, message, conversationId);
    res.json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process AI request'
    });
  }
});

/**
 * @swagger
 * /api/ai/conversations:
 *   get:
 *     summary: Get user's conversation history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await aiService.getUserConversations(req.user.id);
    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.json({ conversations: [] });
  }
});

/**
 * @swagger
 * /api/ai/conversations/:conversationId:
 *   get:
 *     summary: Get conversation messages
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await aiService.getConversationHistory(req.user.id, conversationId);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.json({ messages: [] });
  }
});

/**
 * @swagger
 * /api/ai/usage:
 *   get:
 *     summary: Get user's AI usage statistics
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics
 */
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const usage = await aiService.getUserUsage(req.user.id);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.json({
      daily_requests: 0,
      monthly_requests: 0,
      daily_limit: 100,
      monthly_limit: 1000
    });
  }
});

module.exports = router;
