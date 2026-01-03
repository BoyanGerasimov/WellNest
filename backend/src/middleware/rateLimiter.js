const rateLimit = require('express-rate-limit');

// Helper to get the real IP (handles Railway/proxy headers)
const getRealIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.ip || 
         req.connection.remoteAddress;
};

// General API rate limiter (more lenient for production)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRealIP(req), // Use real IP from proxy headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Auth endpoints rate limiter (moderate - not too strict)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased to 50 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => getRealIP(req), // Use real IP from proxy headers
});

// Chat/AI endpoints rate limiter (moderate)
exports.aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 AI requests per 15 minutes
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRealIP(req), // Use real IP from proxy headers
});

