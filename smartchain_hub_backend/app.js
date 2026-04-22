require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { 
  generalLimiter, 
  securityHeaders, 
  corsOptions, 
  requestLogger, 
  errorHandler, 
  requestTimeout,
  bodyLimiter,
  csrfIssue,
  csrfProtect
} = require('./middleware/security');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware - MUST be first
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(requestTimeout());
app.use(requestLogger);

// Body parsing with security limits
app.use(express.json(bodyLimiter.json));
app.use(express.urlencoded(bodyLimiter.urlencoded));

// CSRF — issue token endpoint + protect all state-mutating routes
app.get('/csrf-token', csrfIssue);
app.use(csrfProtect);

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Root health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SmartChain Hub Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    security: {
      headers: 'enabled',
      rateLimit: 'enabled',
      cors: 'configured',
      validation: 'enabled'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SmartChain Hub API',
    version: '2.0.0',
    security: 'enhanced',
    endpoints: {
      transactions: {
        'GET /api/transactions/:userId': 'Get user transactions',
        'POST /api/transactions': 'Create transaction',
        'POST /api/transactions/optimize': 'Optimize transaction',
        'POST /api/transactions/process': 'Complete transaction flow',
        'GET /api/transactions/health/check': 'Service health check'
      },
      users: {
        'GET /api/users/:userId': 'Get user profile',
        'PUT /api/users/:userId': 'Update user profile'
      }
    },
    integrations: {
      ai_agent: process.env.AI_AGENT_URL || process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:5000',
      blockchain: '0G Galileo Testnet',
      storage: '0G Storage via Frontend API'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: ['/health', '/api', '/api/transactions', '/api/users']
  });
});

// Error handling middleware (MUST be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
// SECURITY FIX: Bind to localhost only in production
const HOST = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 SmartChain Hub Backend v2.0.0 (SECURE)`);
  console.log(`📡 Server running on ${HOST}:${PORT}`);
  console.log(`🔒 Security: Enhanced with rate limiting, CORS, headers`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Agent: ${process.env.AI_AGENT_URL || process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:5000'}`);
  console.log(`⛓️  Blockchain: 0G Galileo Testnet`);
  console.log(`📊 Database: Supabase`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api - API documentation`);
  console.log(`   POST /api/transactions/process - Complete transaction flow`);
  console.log(`\n✅ Secure backend ready for requests!\n`);
});

module.exports = app;
