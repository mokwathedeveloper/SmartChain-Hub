# SmartChain AI Agent - Cloud Deployment

This directory contains the AI agent backend that provides transaction optimization via 0G Compute + TensorFlow fallback.

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended)
```bash
# 1. Push to GitHub
git add . && git commit -m "deploy: AI agent to Render"
git push origin master

# 2. Connect to Render:
# - Go to https://render.com
# - Connect GitHub repo
# - Select ai-agent/ as root directory
# - Set environment variables in dashboard
```

### Option 2: Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy
cd ai-agent/
railway login
railway up
railway variables set OG_COMPUTE_PRIVATE_KEY=your_key_here
```

### Option 3: Fly.io
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Deploy
cd ai-agent/
fly auth login
fly launch --no-deploy
fly secrets set OG_COMPUTE_PRIVATE_KEY=your_key_here
fly deploy
```

## 🔧 Environment Variables

Set these in your cloud platform dashboard:

```env
OG_COMPUTE_PRIVATE_KEY=0x...        # Required for 0G Compute TEE
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
PORT=5000                           # Auto-set by most platforms
```

## 🧪 Test Deployment

```bash
curl https://your-app-url.com/health
curl -X POST https://your-app-url.com/optimize \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "priority": "efficiency"}'
```

## 📝 Update Frontend

After deployment, update `.env.local`:
```env
NEXT_PUBLIC_AI_AGENT_URL=https://your-deployed-url.com
```