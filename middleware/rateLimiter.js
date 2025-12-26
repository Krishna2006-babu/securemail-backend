/**
 * rateLimiter.js
 * Handles rate limiting for sensitive routes
 */

const rateLimit = require("express-rate-limit");

/* =====================================================
   LOGIN RATE LIMITER
   ===================================================== */
/**
 * Limits login attempts to prevent brute-force attacks
 * Max 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

/* =====================================================
   MESSAGE SEND RATE LIMITER
   ===================================================== */
/**
 * Limits message sending to prevent spam
 * Max 10 messages per minute per user
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: "Too many messages sent. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  messageLimiter
};
