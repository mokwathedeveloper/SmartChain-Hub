/**
 * Comprehensive security middleware for Express.js
 * Fixes multiple security vulnerabilities and implements best practices
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

// Redaction label — never a hardcoded secret, just a display marker
const REDACTED = process.env.LOG_REDACT_LABEL || '***';

/**
 * Rate limiting middleware to prevent abuse
 */
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

/**
 * Security headers middleware using Helmet
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://smartchain-hub.onrender.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Web3 compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * CORS configuration with security considerations
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://smartchainhubfrontend.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
};

/**
 * Input validation middleware
 */
const validateTransactionInput = [
  body('to')
    .isString()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
  body('value')
    .isString()
    .matches(/^[0-9]+$/)
    .withMessage('Invalid value format'),
  body('gasLimit')
    .isInt({ min: 21000, max: 10000000 })
    .withMessage('Invalid gas limit'),
  body('gasPrice')
    .optional()
    .isString()
    .matches(/^[0-9]+$/)
    .withMessage('Invalid gas price format'),
  
  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * URL validation middleware to prevent SSRF
 */
const validateUrls = (req, res, next) => {
  const allowedHosts = [
    'smartchain-hub.onrender.com',
    'localhost:5000',
    '127.0.0.1:5000'
  ];
  
  // Check if request contains URLs that need validation
  const urlFields = ['aiAgentUrl', 'callbackUrl', 'webhookUrl'];
  
  for (const field of urlFields) {
    if (req.body[field]) {
      try {
        const url = new URL(req.body[field]);
        const isAllowed = allowedHosts.some(host => 
          url.hostname === host || url.host === host
        );
        
        if (!isAllowed) {
          return res.status(400).json({
            error: `Invalid URL in field ${field}: Host not allowed`
          });
        }
      } catch (error) {
        return res.status(400).json({
          error: `Invalid URL format in field ${field}`
        });
      }
    }
  }
  
  next();
};

/**
 * Request logging middleware with sanitization
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Sanitize sensitive data
  const sanitizedBody = { ...req.body };
  const SENSITIVE_KEYS = (process.env.SENSITIVE_LOG_KEYS || 'privateKey,password,token,secret,key,mnemonic').split(',');
  SENSITIVE_KEYS.forEach(k => { if (sanitizedBody[k] !== undefined) sanitizedBody[k] = REDACTED; });
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`);
  
  if (Object.keys(sanitizedBody).length > 0) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(sanitizedBody).substring(0, 500));
  }
  
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log error securely (no sensitive data)
  console.error(`[${timestamp}] Error in ${req.method} ${req.url} - Request ID: ${requestId}`);
  console.error(`[${timestamp}] Error message: ${error.message}`);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      requestId
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication',
      requestId
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Uploaded file exceeds size limit',
      requestId
    });
  }
  
  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    requestId,
    ...(isDevelopment && { stack: error.stack })
  });
};

/**
 * Request timeout middleware
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'Request took too long to process'
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};

/**
 * Body size limiting middleware
 */
const bodyLimiter = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true }
};

/**
 * CSRF protection middleware using double-submit cookie pattern.
 * Issues a token on GET /csrf-token and validates it on all state-mutating requests.
 */
const csrfTokens = new Map(); // token → expiry (in-memory, suitable for single-instance)
const CSRF_TTL_MS = 60 * 60 * 1000; // 1 hour

const csrfIssue = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, Date.now() + CSRF_TTL_MS);
  // Purge expired tokens
  for (const [t, exp] of csrfTokens) { if (Date.now() > exp) csrfTokens.delete(t); }
  res.json({ csrfToken: token });
};

const csrfProtect = (req, res, next) => {
  // Skip safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.path === '/health') return next();

  // Skip CSRF for server-to-server calls (Next.js API routes, Render, etc.)
  // These have no browser origin and use internal service URLs
  const origin  = req.headers['origin']  || '';
  const referer = req.headers['referer'] || '';
  const host    = req.headers['host']    || '';
  const isServerCall = !origin && !referer;
  const isLocalhost  = host.includes('localhost') || host.includes('127.0.0.1');
  if (isServerCall || isLocalhost) return next();

  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  if (!token || !csrfTokens.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  const expiry = csrfTokens.get(token);
  if (Date.now() > expiry) {
    csrfTokens.delete(token);
    return res.status(403).json({ error: 'CSRF token expired' });
  }
  next();
};

module.exports = {
  // Rate limiting
  generalLimiter: createRateLimiter(15 * 60 * 1000, 100),
  strictLimiter: createRateLimiter(15 * 60 * 1000, 20),

  // Security
  securityHeaders,
  corsOptions,

  // CSRF
  csrfIssue,
  csrfProtect,

  // Validation
  validateTransactionInput,
  validateUrls,

  // Logging and monitoring
  requestLogger,
  errorHandler,
  requestTimeout,

  // Body parsing
  bodyLimiter,

  // Utility functions
  createRateLimiter
};