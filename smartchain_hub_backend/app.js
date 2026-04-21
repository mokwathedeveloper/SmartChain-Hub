require('dotenv').config();
const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://smartchainhubfrontend.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Root health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SmartChain Hub Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SmartChain Hub API',
    version: '2.0.0',
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SmartChain Hub Backend v2.0.0`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Agent: ${process.env.AI_AGENT_URL || process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:5000'}`);
  console.log(`⛓️  Blockchain: 0G Galileo Testnet`);
  console.log(`📊 Database: Supabase`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api - API documentation`);
  console.log(`   POST /api/transactions/process - Complete transaction flow`);
  console.log(`\n✅ Backend ready for requests!\n`);
});

module.exports = app;
