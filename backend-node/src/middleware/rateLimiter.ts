import rateLimit from "express-rate-limit";

/**
 * Rate limiters for different endpoint categories.
 * Protects against brute-force, SOS spam, and location flooding.
 */

/** Auth endpoints: 5 requests per minute per IP */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

/** SOS endpoints: 3 requests per minute per IP */
export const sosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many SOS requests. Please wait before retrying.",
  },
});

/** Location updates: 60 requests per minute per IP (1/sec average) */
export const locationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many location updates. Please reduce update frequency.",
  },
});

/** General API limiter: 100 requests per minute per IP */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
