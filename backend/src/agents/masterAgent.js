const { generateContent } = require('../config/gemini');
const { AGENT_PROMPTS } = require('../prompts/agentPrompts');
const prisma = require('../config/db');
const { searchProducts } = require('../services/serpApiService');
const { enrichProductData } = require('../services/scrapingDogService');
const { enrichWithKeepaHistory } = require('../services/keepaService');
const { aggregateAndAlign } = require('../services/comparisonEngine');

/**
 * Regex Fallback: Detect user intent from message if JSON parsing fails
 */
const detectIntent = (message) => {
  const lower = (message || '').toLowerCase().trim();
  if (lower.match(/^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening|how are you|who are you|what can you do|help|thanks|thank you|ok|okay|bye|sup)$/)) return 'GREETING';
  if (lower.match(/history|month|last \d|graph|trend|keepa|lowest price ever/)) return 'HISTORY';
  if (lower.match(/wait|now|buy advice|should i buy|time to buy|price drop/)) return 'ADVICE';
  if (lower.match(/alternative|better|within ₹|more|stretch|upgrade|instead/)) return 'ALTERNATIVES';
  if (lower.match(/deal|coupon|cashback|emi|bank offer|discount|exchange|hdfc|icici|axis|sbi/)) return 'DEALS';
  if (lower.match(/compare|vs|versus|difference|between/)) return 'COMPARE';
  if (lower.match(/cheapest|store|where is it|where to buy|flipkart|croma|reliance|vijay sales|price/)) return 'PRICE';
  if (lower.match(/docker|android studio|vs code|programming|cse|developer|video editing|photoshop|autocad|heavy|battery/)) return 'PERSONALIZED';
  if (lower.match(/review|rating|pros|cons|good|bad|worth/)) return 'REVIEW';
  return 'RECOMMEND';
};

/**
 * Regex Fallback: Extract budget from message
 */
const extractBudget = (message) => {
  if (!message) return null;
  const lower = message.toLowerCase();
  
  // Try matching explicit numbers with k/thousand or currency symbols, or standalone 4-to-6 digit budget numbers
  const patterns = [
    /(?:under|below|budget|upto|up to|within|less than|around|approx|max|is|=|of|for|at|range)\s*(?:is|of|=|:)?\s*₹?\s*([\d,]+)\s*(?:k|thousand)?/i,
    /₹\s*([\d,]+)\s*(?:k|thousand)?/i,
    /\b([\d,]+)\s*(?:k|thousand)\b/i,
    /\b(20000|25000|30000|35000|40000|45000|50000|55000|60000|65000|70000|75000|80000|85000|90000|95000|100000|110000|120000|130000|140000|150000)\b/i,
  ];
  for (const p of patterns) {
    const m = lower.match(p);
    if (m) {
      let val = parseInt(m[1].replace(/,/g, ''));
      if (lower.includes('k') || lower.includes('thousand')) {
        if (val < 1000) val *= 1000;
      }
      return val;
    }
  }
  return null;
};

/**
 * Regex Fallback: Extract category from message
 */
const extractCategory = (message) => {
  const lower = (message || '').toLowerCase();
  if (lower.match(/laptop|notebook|macbook|chromebook/)) return 'Laptop';
  if (lower.match(/phone|mobile|smartphone|iphone|android/)) return 'Smartphone';
  if (lower.match(/tv|television|smart tv/)) return 'Smart TV';
  if (lower.match(/headphone|earphone|earbuds|tws|speaker|audio/)) return 'Audio';
  if (lower.match(/tablet|ipad/)) return 'Tablet';
  if (lower.match(/watch|smartwatch|wearable/)) return 'Smartwatch';
  return 'General';
};

/**
 * Helper: Safe JSON parser for Gemini 1st pass output
 */
const parseGeminiJson = (text) => {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

/**
 * MASTER AGENT — Main entry point implementing the 6-Step Pipeline
 * 1️⃣ Gemini API (1st pass): Understand natural language -> JSON intent & parameters
 * 2️⃣ SerpAPI: Product search (Google Shopping / DB fallback)
 * 3️⃣ ScrapingDog & Keepa API: Enrich hardware specs, multi-store prices, and Amazon price history
 * 4️⃣ Comparison Engine: Aggregate & align specs side-by-side
 * 5️⃣ Gemini API (2nd pass): Rank products, assign AI Score (e.g. 9.8/10), explain pros/cons
 * 6️⃣ Final Response: Return structured markdown reply to frontend
 */
const masterAgent = async (userMessage, conversationHistory = [], userId = null, attachment = null, sessionId = null) => {
  if (attachment) {
    const snippet = typeof attachment.content === 'string' ? attachment.content.slice(0, 1500) : 'Binary/Image file uploaded';
    userMessage += `\n\n[USER ATTACHED FILE: "${attachment.name}" (${attachment.type || 'file'}). Content/Snippet: ${snippet}]`;
    console.log(`📎 [Attachment Received]: ${attachment.name}`);
  }

  // ── Load User Preferences from PostgreSQL (if available) ─────────────────
  let userPref = null;
  try {
    const prefWhere = [];
    if (userId) prefWhere.push({ userId });
    if (sessionId) prefWhere.push({ sessionId });
    if (prefWhere.length > 0) {
      userPref = await prisma.userPreference.findFirst({
        where: { OR: prefWhere },
      });
    }
    if (userPref) {
      console.log('📌 [UserPreferences] Loaded saved preferences from PostgreSQL:', JSON.stringify(userPref));
    }
  } catch (e) {
    console.warn('⚠️ [UserPreferences] Could not load preferences:', e.message.split('\n')[0]);
  }

  console.log('\n=============================================================');
  console.log(`💬 [User Message]: "${userMessage}"`);
  console.log('-------------------------------------------------------------');

  // ── 1️⃣ Step 1: Gemini API 1st Pass — Intent & Parameter Extraction ────────
  let extracted = null;
  const historyForNLU = (conversationHistory || []).slice(-10).map((msg) => ({
    role: (msg.role === 'assistant' || msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user',
    parts: [{ text: msg.content || msg.text || '' }],
  }));

  try {
    console.log('🧠 [Step 1: Gemini 1st Pass] Extracting structured JSON intent & preferences...');
    const nluResponse = await generateContent(AGENT_PROMPTS.INTENT_EXTRACTION_PROMPT, userMessage, historyForNLU);
    extracted = parseGeminiJson(nluResponse);
  } catch (err) {
    console.warn('⚠️ [Step 1: Gemini 1st Pass] NLU extraction failed or rate limited:', err.message);
  }

  // If NLU failed or returned null, use robust regex fallback
  if (!extracted || typeof extracted !== 'object') {
    extracted = {
      category: extractCategory(userMessage),
      budget: extractBudget(userMessage),
      purpose: userMessage.length < 50 ? userMessage : 'General Shopping',
      battery: (userMessage || '').toLowerCase().includes('battery'),
      gaming: (userMessage || '').toLowerCase().includes('gaming'),
      coding: (userMessage || '').toLowerCase().match(/cse|code|coding|android studio|developer/) ? true : false,
      brand: null,
      searchQuery: userMessage,
      intent: detectIntent(userMessage),
    };
  } else {
    if (!extracted.intent) extracted.intent = detectIntent(userMessage);
    const regexBudget = extractBudget(userMessage);
    if (regexBudget) extracted.budget = regexBudget;
  }

  // Carry over preferences and search context if current request is a follow-up
  if (!extracted.budget && userPref?.budget) {
    extracted.budget = userPref.budget;
    console.log(`📌 [UserPreferences] Applied saved budget: ₹${extracted.budget}`);
  }
  if (!extracted.brand && userPref?.favoriteBrand) {
    extracted.brand = userPref.favoriteBrand;
    console.log(`📌 [UserPreferences] Applied saved brand preference: ${extracted.brand}`);
  }

  if (!extracted.category || extracted.category.toLowerCase() === 'general' || extracted.category.toLowerCase() === 'electronics' || extracted.category.toLowerCase() === 'shopping') {
    if (userPref?.category) {
      extracted.category = userPref.category;
      console.log(`📌 [UserPreferences] Applied saved category: ${extracted.category}`);
    } else {
      for (let i = (conversationHistory || []).length - 1; i >= 0; i--) {
        const prevMsg = ((conversationHistory[i].content || conversationHistory[i].text || '') + '').toLowerCase();
        if (prevMsg.includes('laptop') || prevMsg.includes('macbook') || prevMsg.includes('notebook')) {
          extracted.category = 'Laptop';
          extracted.searchQuery = `laptop under ${extracted.budget || 60000} ${extracted.coding ? 'for coding' : ''}`.trim();
          break;
        }
        if (prevMsg.includes('phone') || prevMsg.includes('mobile') || prevMsg.includes('smartphone')) {
          extracted.category = 'Smartphone';
          extracted.searchQuery = `smartphone under ${extracted.budget || 50000}`.trim();
          break;
        }
        if (prevMsg.includes('tv') || prevMsg.includes('television')) {
          extracted.category = 'Smart TV';
          extracted.searchQuery = `smart tv under ${extracted.budget || 50000}`.trim();
          break;
        }
        if (prevMsg.includes('watch') || prevMsg.includes('smartwatch')) {
          extracted.category = 'Smartwatch';
          extracted.searchQuery = `smartwatch under ${extracted.budget || 10000}`.trim();
          break;
        }
        if (prevMsg.includes('headphone') || prevMsg.includes('earbud')) {
          extracted.category = 'Audio';
          extracted.searchQuery = `headphones under ${extracted.budget || 5000}`.trim();
          break;
        }
      }
    }
  }

  console.log('✅ [Step 1 Result] Extracted Intent & Parameters:', JSON.stringify(extracted, null, 2));

  // ── Save/Update User Preferences to PostgreSQL ───────────────────────────
  try {
    if (userId || sessionId) {
      const prefData = {
        budget: extracted.budget || userPref?.budget || null,
        favoriteBrand: extracted.brand || userPref?.favoriteBrand || null,
        profession: extracted.purpose || userPref?.profession || null,
        category: extracted.category || userPref?.category || null,
      };
      if (userId) {
        await prisma.userPreference.upsert({
          where: { userId },
          update: prefData,
          create: { userId, sessionId, ...prefData },
        });
      } else if (sessionId) {
        await prisma.userPreference.upsert({
          where: { sessionId },
          update: prefData,
          create: { sessionId, ...prefData },
        });
      }
      console.log('💾 [UserPreferences] Persisted preferences to PostgreSQL.');
    }
  } catch (e) {
    console.warn('⚠️ [UserPreferences] Could not save preferences:', e.message.split('\n')[0]);
  }

  // ── Handle Casual Greetings & Conversational Queries without Product Search ──
  const lowerMsg = (userMessage || '').trim().toLowerCase();
  const isGreetingOrCasual = extracted.intent === 'GREETING' ||
                             detectIntent(userMessage) === 'GREETING' ||
                             (lowerMsg.split(/\s+/).length <= 3 && !lowerMsg.match(/phone|mobile|laptop|tv|watch|earbud|headphone|tablet|camera|buy|show|under|budget|₹|\d+k|deal|compare|price|review/i));

  if (isGreetingOrCasual) {
    console.log('👋 [Step 2: Greeting Detected] Skipping product search & cards for casual greeting/conversation.');
    const greetingPrompt = `${AGENT_PROMPTS.MASTER || ''}

The user just said: "${userMessage}".
You are ShopBot AI, an elite, luxury personal AI shopping assistant.
Reply with a warm, conversational, and helpful response (2-3 sentences max).
If they greeted you, introduce yourself briefly as ShopBot AI and ask what product (laptops, smartphones, TVs, audio gear, etc.) or budget they would like you to find today.
IMPORTANT: Do NOT include any product cards, specifications, comparison tables, or store links. Only respond conversationally and invite them to tell you what they want to buy.`;

    const finalAiResponse = await generateContent(greetingPrompt, userMessage, (conversationHistory || []).slice(-5).map(m => ({
      role: (m.role === 'assistant' || m.role === 'ai' || m.role === 'model') ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    })));

    return {
      response: finalAiResponse || "Hello! 👋 I'm ShopBot AI, your personal shopping assistant. Whether you're looking for laptops, smartphones, smart TVs, or audio gear, I can find you the lowest prices across Amazon, Flipkart, and Croma. What are you shopping for today?",
      intent: 'GREETING',
      products: [],
      category: 'General',
      budget: null,
    };
  }

  // ── 2️⃣ Step 2: SerpAPI — Product Search ──────────────────────────────────
  console.log('🔍 [Step 2: SerpAPI] Searching for matching products...');
  const serpProducts = await searchProducts({
    query: extracted.searchQuery || userMessage,
    category: extracted.category,
    budget: extracted.budget,
    limit: 5,
  });

  // ── 3️⃣ Step 3: ScrapingDog & Keepa API — Data Enrichment & Price History ────
  console.log('🐕 [Step 3: ScrapingDog & Keepa API] Scraper enriching specs, multi-store prices & historical trends...');
  const enrichedProducts = await enrichProductData(serpProducts);
  const keepaProducts = await enrichWithKeepaHistory(enrichedProducts);

  // ── 4️⃣ Step 4: Comparison Engine — Aggregate & Align Specs ───────────────
  console.log('⚙️ [Step 4: Comparison Engine] Aggregating & aligning specs side-by-side...');
  const { products: alignedProducts, summaryText } = aggregateAndAlign(keepaProducts, extracted);

  // ── 5️⃣ Step 5: Gemini API 2nd Pass — AI Brain Ranking & Explanation ────────
  console.log('🧠 [Step 5: Gemini 2nd Pass] Generating AI Scores (out of 10), rankings & pros/cons...');
  
  // Select prompt template based on intent
  const intentType = (extracted.intent || detectIntent(userMessage)).toUpperCase();
  let promptTemplate = AGENT_PROMPTS[intentType] || AGENT_PROMPTS.RECOMMEND;
  if (intentType === 'SEARCH' || intentType === 'GENERAL') {
    promptTemplate = AGENT_PROMPTS.RECOMMEND;
  }

  // Inject enriched multi-store data into prompt
  const systemPrompt = promptTemplate
    .replace('{{ENRICHED_PRODUCTS_CONTEXT}}', summaryText)
    .replace('{{PRODUCTS}}', summaryText);

  // Build conversation history for context continuity
  const history = (conversationHistory || []).slice(-10).map((msg) => ({
    role: (msg.role === 'assistant' || msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user',
    parts: [{ text: msg.content || msg.text || '' }],
  }));

  const finalAiResponse = await generateContent(systemPrompt, userMessage, history);
  console.log('✅ [Step 5 Result] Gemini successfully generated ranked explanation!');
  console.log('=============================================================\n');

  // ── 6️⃣ Step 6: Save Search History & Recent Products to PostgreSQL ─────────
  const topProducts = alignedProducts.slice(0, 5).map((p, idx) => {
    const priceNum = typeof p.price === 'number' ? p.price : parseInt(String(p.price || '').replace(/\D/g, '')) || 45990;
    const targetBudget = extracted.budget ? parseFloat(extracted.budget) : 60000;
    let verdict = "Current price is competitive compared to similar products in this segment.";
    let urgentAdvice = "If your purchase is urgent, this is a good time to buy.";
    let waitAdvice = "If you can wait for Flipkart Big Billion Days or Amazon Great Indian Festival, you may get additional discounts and bank cashback.";
    let rating = "★★★★★";

    if (priceNum <= targetBudget * 0.85) {
      verdict = "Current price is exceptionally competitive and well below your maximum budget.";
      urgentAdvice = "If your purchase is urgent, this is an outstanding deal to grab immediately.";
    } else if (priceNum > targetBudget) {
      rating = "★★★★☆";
      verdict = "Current price reflects premium hardware specifications slightly above target budget.";
      waitAdvice = "If you can wait for major seasonal sales or bank card discounts, the price may drop closer to your target.";
    }

    return {
      ...p,
      buyRecommendation: p.buyRecommendation || {
        rating,
        title: "Buy Recommendation",
        verdict,
        urgentAdvice,
        waitAdvice
      }
    };
  });

  if (sessionId && topProducts.length > 0) {
    try {
      for (const p of topProducts) {
        if (!p.id) continue;
        await prisma.recentProduct.create({
          data: {
            sessionId,
            productId: p.id,
          },
        });
      }
      console.log(`💾 [RecentProducts] Saved ${topProducts.length} recent products to PostgreSQL for session ${sessionId}.`);
    } catch (e) {
      console.warn('⚠️ [RecentProducts] Could not save recent products:', e.message.split('\n')[0]);
    }
  }

  if (userId && extracted.category) {
    try {
      await prisma.searchHistory.create({
        data: {
          userId,
          query: userMessage,
          category: extracted.category,
          budget: extracted.budget ? parseFloat(extracted.budget) : null,
          results: { productIds: topProducts.map((p) => p.id) },
        },
      });
    } catch {} // Non-critical
  }

  let responseText = finalAiResponse;
  if (topProducts.length > 0 && !responseText.includes("View Price History")) {
    responseText += `\n\n---\n**Need historical pricing?**\nClick **'📈 View Price History'** on any product card below to see historical price trends and determine the best time to buy without relying on fabricated data!`;
  }

  return {
    response: responseText,
    intent: intentType,
    products: topProducts,
    category: extracted.category,
    budget: extracted.budget,
  };
};

module.exports = {
  masterAgent,
  detectIntent,
  extractBudget,
  extractCategory,
  parseGeminiJson,
};
