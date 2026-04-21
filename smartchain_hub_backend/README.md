# SmartChain Hub Backend - Integration Guide

## 🏗️ Architecture Integration

The backend now serves as a **centralized API layer** that coordinates between:

```
Frontend → Backend API (port 3001) → AI Agent (port 5000)
              ↓
    Supabase + 0G Storage + Smart Contracts
```

## 🚀 Quick Deploy

### Option 1: Render
```bash
# 1. Push to GitHub
git add . && git commit -m "deploy: backend integration"
git push origin master

# 2. Deploy on Render:
# - Connect GitHub repo
# - Select 'smartchain_hub_backend/' as root directory
# - Set environment variables (see .env.example)
```

### Option 2: Railway
```bash
cd smartchain_hub_backend/
railway login
railway up
railway variables set SUPABASE_URL=your_url
railway variables set AI_AGENT_URL=your_ai_agent_url
```

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Required
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
AI_AGENT_URL=https://your-ai-agent.onrender.com
FRONTEND_URL=https://smartchainhubfrontend.vercel.app

# Optional
PORT=3001
NODE_ENV=production
```

## 📡 API Endpoints

### Core Endpoints
- `GET /health` - Backend health check
- `GET /api` - API documentation
- `POST /api/transactions/process` - **Complete transaction flow**

### Transaction Endpoints
- `GET /api/transactions/:userId` - Get user transactions
- `POST /api/transactions/optimize` - AI optimization only
- `POST /api/transactions` - Create transaction record
- `GET /api/transactions/health/check` - Service health

### User Endpoints
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

## 🔄 Integration with Frontend

### Option 1: Use Backend API (Recommended)
Update frontend to use backend instead of direct calls:

```typescript
// Instead of direct AI agent calls
const result = await fetch('http://localhost:5000/optimize', {...});

// Use backend API
const result = await fetch('http://localhost:3001/api/transactions/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, amount, priority })
});
```

### Option 2: Hybrid Approach (Current)
Keep current frontend architecture and use backend for:
- Advanced transaction processing
- Bulk operations
- Admin functions
- Analytics

## 🧪 Testing

```bash
# Start backend
cd smartchain_hub_backend/
npm install
npm start

# Test endpoints
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/transactions/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","amount":1000,"priority":"efficiency"}'
```

## 🔗 Benefits of Integration

### ✅ **Centralized Business Logic**
- Single API for all operations
- Consistent error handling
- Better logging and monitoring

### ✅ **Enhanced Features**
- Complete transaction flow in one call
- 0G Storage integration
- Blockchain operations
- Service health monitoring

### ✅ **Better Architecture**
- Separation of concerns
- Easier to scale and maintain
- Professional API structure

## 🎯 Next Steps

1. **Deploy Backend**: Use Render or Railway
2. **Update Frontend**: Optionally integrate backend API calls
3. **Test Integration**: Verify all services work together
4. **Monitor**: Use health endpoints for monitoring

The backend is now **fully integrated** and ready for production use!