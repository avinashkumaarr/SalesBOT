const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, newSession } = require('../controllers/chatController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a message to the AI Sales Bot
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "I need a personal loan of 5 lakhs" }
 *               sessionId: { type: string, description: "Existing session ID (optional)" }
 *     responses:
 *       200:
 *         description: AI response with agent type and stage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 sessionId: { type: string }
 *                 message: { type: string }
 *                 agentType: { type: string }
 *                 stage: { type: string }
 */
router.post('/', optionalAuth, chatLimiter, sendMessage);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Get chat history for authenticated user
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema: { type: string }
 *         description: Specific session ID to fetch
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Chat sessions and messages }
 */
router.get('/history', optionalAuth, getChatHistory);

/**
 * @swagger
 * /chat/new-session:
 *   post:
 *     summary: Create a new chat session
 *     tags: [Chat]
 *     responses:
 *       201: { description: New session created }
 */
router.post('/new-session', authMiddleware, newSession);

module.exports = router;
