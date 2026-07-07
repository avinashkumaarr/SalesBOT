const prisma = require('../config/db');
const { masterAgent } = require('../agents/masterAgent');

/**
 * POST /api/chat
 * Send a message to the Shopping AI Bot
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, attachment } = req.body;
    const isGuest = !req.user;
    const userId = req.user?.id || null;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Determine session — guests always get a fresh UUID if none provided
    const activeSessionId = sessionId || require('crypto').randomUUID();

    // Ensure ChatSession exists in PostgreSQL!
    try {
      await prisma.chatSession.upsert({
        where: { id: activeSessionId },
        update: { updatedAt: new Date(), ...(userId ? { userId } : {}) },
        create: {
          id: activeSessionId,
          userId: userId || null,
          title: message.trim().slice(0, 40),
        },
      });
    } catch (e) {
      console.warn('⚠️ [ChatSession] Could not upsert session:', e.message.split('\n')[0]);
    }

    let history = req.body.history || [];

    // Always fetch persisted conversation history from chat_messages if not provided in body!
    if (!history || history.length === 0) {
      try {
        const dbMessages = await prisma.chatMessage.findMany({
          where: { sessionId: activeSessionId },
          orderBy: { createdAt: 'asc' },
          take: 20,
        });
        if (dbMessages && dbMessages.length > 0) {
          history = dbMessages.map(m => ({
            role: m.role,
            content: m.message,
            agentType: m.agentType,
            metadata: m.metadata,
          }));
        } else if (userId) {
          // Backward compatibility check with legacy Chat table
          const legMessages = await prisma.chat.findMany({
            where: { userId, sessionId: activeSessionId },
            orderBy: { timestamp: 'asc' },
            take: 20,
          });
          history = legMessages.map(m => ({
            role: m.role,
            content: m.content,
            agentType: m.agentType,
            metadata: m.metadata,
          }));
        }
      } catch (e) {
        console.warn('⚠️ [ChatHistory] Could not load history:', e.message.split('\n')[0]);
      }
    }

    // Save user message to chat_messages (and legacy chat if logged in)
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId: activeSessionId,
          role: 'user',
          message: message.trim(),
        },
      });
      if (userId) {
        await prisma.chat.create({
          data: {
            userId,
            sessionId: activeSessionId,
            role: 'user',
            content: message.trim(),
          },
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('⚠️ [ChatMessage] Could not save user message:', e.message.split('\n')[0]);
    }

    // Run through master agent (works for both guest and authenticated)
    const { response, intent, products, category, budget } = await masterAgent(
      message.trim(),
      history,
      userId,
      attachment,
      activeSessionId
    );

    let timestamp = new Date().toISOString();

    // Save AI response to chat_messages (and legacy chat if logged in)
    try {
      const metadataPayload = {
        products: products.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price || p.lowestPriceStore?.price || 45990,
          rating: p.rating,
          image: p.image || p.thumbnail,
          stores: p.stores || p.multiStorePrices || [],
          specifications: p.specifications || {},
          offers: p.offers || [],
          aiScore: p.aiScore || null,
        })),
        category,
        budget,
      };

      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: activeSessionId,
          role: 'assistant',
          message: response,
          agentType: intent,
          metadata: metadataPayload,
        },
      });
      timestamp = aiMessage.createdAt;

      if (userId) {
        await prisma.chat.create({
          data: {
            userId,
            sessionId: activeSessionId,
            role: 'assistant',
            content: response,
            agentType: intent,
            metadata: metadataPayload,
          },
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('⚠️ [ChatMessage] Could not save AI response:', e.message.split('\n')[0]);
    }

    return res.status(200).json({
      success: true,
      sessionId: activeSessionId,
      message: response,
      agentType: intent,
      products: products.slice(0, 5),
      category,
      budget,
      timestamp,
      isGuest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/history
 */
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { sessionId, limit = 50 } = req.query;

    // If specific session requested, return its messages from chat_messages (works for guests too!)
    if (sessionId) {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: parseInt(limit),
      });
      if (messages && messages.length > 0) {
        const mapped = messages.map(m => ({
          role: m.role,
          content: m.message,
          agentType: m.agentType,
          metadata: m.metadata,
          timestamp: m.createdAt,
        }));
        return res.json({ success: true, messages: mapped });
      } else if (userId) {
        const legMessages = await prisma.chat.findMany({
          where: { userId, sessionId },
          orderBy: { timestamp: 'asc' },
          take: parseInt(limit),
        });
        return res.json({ success: true, messages: legMessages });
      }
      return res.json({ success: true, messages: [] });
    }

    if (!userId) {
      return res.json({ success: true, sessions: [] });
    }

    // For logged-in users: get all unique sessions from chat_sessions
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (sessions && sessions.length > 0) {
      const sessionsWithMessages = sessions.map(s => ({
        sessionId: s.id,
        title: s.title,
        messages: s.messages.reverse().map(m => ({
          role: m.role,
          content: m.message,
          agentType: m.agentType,
          metadata: m.metadata,
          timestamp: m.createdAt,
        })),
      }));
      return res.json({ success: true, sessions: sessionsWithMessages });
    }

    // Fallback to legacy chat table for older sessions
    const legacySessions = await prisma.chat.groupBy({
      by: ['sessionId'],
      where: { userId },
      orderBy: { _max: { timestamp: 'desc' } },
      take: 20,
    });

    const sessionsWithMessages = await Promise.all(
      legacySessions.slice(0, 10).map(async (s) => {
        const messages = await prisma.chat.findMany({
          where: { userId, sessionId: s.sessionId },
          orderBy: { timestamp: 'desc' },
          take: 3,
        });
        return { sessionId: s.sessionId, messages: messages.reverse() };
      })
    );

    return res.json({ success: true, sessions: sessionsWithMessages });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/new-session
 */
const newSession = async (req, res) => {
  const sessionId = require('crypto').randomUUID();
  return res.status(201).json({ success: true, sessionId });
};

module.exports = { sendMessage, getChatHistory, newSession };
