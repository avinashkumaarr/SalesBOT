const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter — 500 req / 15 min in dev, 100 in prod
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip entirely in development
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

/**
 * Auth rate limiter — relaxed in dev (100/15min), strict in prod (10/15min)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip entirely in development
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
  },
});

/**
 * Chat rate limiter — relaxed in dev
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 200 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip entirely in development
  message: {
    success: false,
    message: 'Sending messages too fast. Please slow down.',
  },
});

module.exports = { generalLimiter, authLimiter, chatLimiter };
