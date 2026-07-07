const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Retrieve all available Gemini API keys from environment and fallbacks
 */
const getApiKeys = () => {
  const keysSet = new Set();
  if (process.env.GEMINI_API_KEYS) {
    process.env.GEMINI_API_KEYS.split(',').forEach((k) => {
      const trimmed = k.trim();
      if (trimmed) keysSet.add(trimmed);
    });
  }
  if (process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY.split(',').forEach((k) => {
      const trimmed = k.trim();
      if (trimmed) keysSet.add(trimmed);
    });
  }
  return Array.from(keysSet);
};

let currentKeyIndex = 0;

// Export default genAI using primary key for compatibility
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || (process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',')[0].trim() : '')
);

const FALLBACK_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

/**
 * Helper: sleep ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if an error indicates rate limit / quota exceeded or invalid key
 */
const isRateLimitOrKeyError = (error) => {
  const status = error?.status || error?.statusCode;
  const msg = error?.message || '';
  return (
    status === 429 ||
    status === 403 ||
    status === 401 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded') ||
    msg.includes('Too Many Requests') ||
    msg.includes('API key not valid') ||
    msg.includes('PERMISSION_DENIED')
  );
};

/**
 * Generate content with automatic API key rotation & model fallback on 429 / 503 errors
 */
const generateContent = async (systemPrompt, userMessage, history = []) => {
  let lastError = null;
  const keys = getApiKeys();

  for (const modelName of FALLBACK_MODELS) {
    // Try rotating across all available API keys if rate/quota limit is encountered
    for (let keyAttempt = 0; keyAttempt < keys.length; keyAttempt++) {
      const keyIndexToUse = (currentKeyIndex + keyAttempt) % keys.length;
      const aiInstance = new GoogleGenerativeAI(keys[keyIndexToUse]);

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = aiInstance.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1500,
            },
          });

          const chat = model.startChat({
            history: [
              {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
              {
                role: 'model',
                parts: [{ text: 'Understood. I am ShopBot, your expert Indian online shopping sales advisor.' }],
              },
              ...history,
            ],
          });

          const result = await chat.sendMessage(userMessage);
          // On success, advance currentKeyIndex to the working key index
          currentKeyIndex = keyIndexToUse;
          return result.response.text();
        } catch (error) {
          lastError = error;
          const status = error?.status || error?.statusCode;
          const msg = error?.message || '';

          // If quota exceeded or rate limited, rotate immediately to next API key
          if (isRateLimitOrKeyError(error)) {
            console.warn(
              `⚠️ Gemini Key #${keyIndexToUse + 1} hit quota/limit (${status || msg}). Switching to next API key automatically...`
            );
            break; // Break attempt loop to try next key in pool
          }

          // If transient server error (500, 503, Service Unavailable) or network fetch failure, wait and retry with same key
          if (status >= 500 || msg.includes('Service Unavailable') || msg.includes('fetch failed') || msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT') || msg.includes('ECONNRESET') || msg.includes('network')) {
            console.warn(`⏳ Network/Transient error (${msg.split('\n')[0]}). Retrying attempt ${attempt}/2 in ${1500 * attempt}ms...`);
            await sleep(1500 * attempt);
            continue;
          }

          // For other errors (e.g. 404 model not found), break out of attempt loop
          break;
        }
      }

      // If lastError wasn't a rate/quota limit error or network error, don't try other keys for this model; move to next model
      if (!isRateLimitOrKeyError(lastError) && !lastError?.message?.includes('fetch failed')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate AI response across all models and API keys.');
};

module.exports = { genAI, generateContent };
