<div align="center">

> **SUPERSEDED** — This Express.js layer is an early prototype and is **not running in production**.
> The live production stack is: **Next.js API routes** (`smartchain_hub_frontend/src/pages/api/`) → **Flask AI Agent** (`ai-agent/`).
> This directory is preserved for reference only.

# 🔧 SmartChain Hub — Backend API (Legacy)
### *Express.js API layer — superseded by Next.js API routes + Flask AI agent*

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](.)
[![Render](https://img.shields.io/badge/Deploy-Render_/_Railway-46E3B7?style=flat-square)](.)

</div>

---

## Architecture Position

```
Browser / Frontend (Next.js 16)
        │
        │  REST / JSON
        ▼
┌───────────────────────────────────────────────────────┐
│  BACKEND API  ·  Node.js 20 / Express 4               │
│  Port 3001                                            │
│                                                       │
│  POST /api/transactions/process                       │
│    └── aiService.optimize()                           │
│    └── uploadToStorage() → 0G Storage Log             │
│    └── supabase.insert('transactions')                │
│                                                       │
│  POST /api/transactions/fine-tune                     │
│    └── fetch storage_roots from Supabase              │
│    └── aiService.fineTune(hashes)                     │
│                                                       │
│  Security middleware:                                 │
│    CSRF · Rate limiting · Helmet · Input validation   │
└───────────────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
  AI Agent (Flask)     Supabase + 0G Storage
  Port 5000            PostgreSQL + Log layer
```

---

## Quick Start

```bash
cd smartchain_hub_backend
cp .env.example .env
npm install
npm start   # → http://localhost:3001
```

---

## Environment Variables

```env
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
AI_AGENT_URL=https://smartchain-hub.onrender.com
FRONTEND_URL=https://smartchainhubfrontend.vercel.app

# Optional
PORT=3001
NODE_ENV=production
```

---

## API Reference

### Health

```
GET /health
→ { status, services: { ai_agent, database, ai_agent_url }, timestamp }
```

### Transactions

```
POST /api/transactions/process
Body: { userId, amount, priority }
→ { optimization, transaction, message }

Flow:
  1. aiService.optimize(amount, priority)
  2. uploadToStorage(storageData) → 0G Storage Log
  3. supabase.insert('transactions') with storage_root
  4. Return combined result

GET /api/transactions/:userId
→ [ ...transactions ordered by created_at desc ]

POST /api/transactions/optimize
Body: { amount, priority, userId }
→ { fee, savings, route, confidence, tee_verified, ... }

POST /api/transactions
Body: { userId, amount, optimizedFee, savings, route, teeVerified }
→ { ...transaction, storage_info: { rootHash, txHash, storageScanUrl } }

POST /api/transactions/fine-tune
Body: { root_hashes?: [...], dry_run?: bool }
→ { ok, samples, epochs, final_loss, model_hash }
```

### Users

```
GET  /api/users/:userId   → user profile
PUT  /api/users/:userId   → update profile
```

---

## Service Layer

### `services/aiService.js`

```javascript
aiService.optimize(amount, priority)
  // POST /optimize → Flask AI Agent
  // timeout: 30s
  // Returns: fee · savings · route · confidence · tee_verified

aiService.fineTune(rootHashes, dryRun)
  // POST /fine-tune → Flask AI Agent
  // timeout: 120s (fine-tuning takes longer)
  // Returns: ok · samples · epochs · final_loss · model_hash

aiService.health()
  // GET /health → Flask AI Agent
  // Returns: status · og_compute · og_compute_model
```

### `services/blockchainService.js`

```javascript
blockchainService.recordTransaction(txHash, amount, fee, route)
  // SmartChainTransaction.recordTransaction()
  // 0G Galileo Testnet

blockchainService.validateTransaction(txHash)
  // SmartChainTransaction.validateTransaction()
  // Owner-only
```

### `controllers/transactionController.js`

```
processTransaction()   → optimize + create in one call
createTransaction()    → upload to 0G Storage + insert to Supabase
getTransactions()      → fetch from Supabase by userId
fineTuneModel()        → fetch storage roots + trigger fine-tune
healthCheck()          → check AI agent + Supabase connectivity
```

---

## 0G Storage Integration

The backend proxies 0G Storage uploads through the frontend API routes (which have Node.js access to the SDK):

```javascript
// controllers/transactionController.js
const uploadToStorage = async (data) => {
  const response = await axios.post(
    `${FRONTEND_URL}/api/storage-upload`,
    { data },
    { timeout: 30000 }
  );
  return response.data;
  // Returns: { rootHash, txHash, storageScanUrl }
};
```

Every transaction record in Supabase includes:
- `storage_root` — Merkle root from 0G Storage Log
- `storage_scan_url` — direct link to 0G StorageScan
- `tx_hash` — on-chain transaction hash

---

## Security Middleware

```javascript
// middleware/security.js
app.use(helmet())                    // security headers
app.use(cors({ origin: FRONTEND })) // CORS allowlist
app.use(rateLimit({ max: 100 }))    // 100 req / 15 min per IP
app.use(csrf())                      // CSRF on mutation routes
app.use(validateInput)               // input sanitization
```

---

## Deployment

### Render (recommended)

```bash
# render.yaml handles everything
git push origin main
# Connect repo in Render dashboard → auto-deploys
```

### Railway

```bash
cd smartchain_hub_backend
railway login && railway up
railway variables set SUPABASE_URL=... AI_AGENT_URL=...
```

### Docker

```bash
docker build -t smartchain-backend .
docker run -p 3001:3001 --env-file .env smartchain-backend
```

---

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Full transaction flow
curl -X POST http://localhost:3001/api/transactions/process \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","amount":1000,"priority":"efficiency"}'

# Fine-tune trigger
curl -X POST http://localhost:3001/api/transactions/fine-tune \
  -H "Content-Type: application/json" \
  -d '{"dry_run":true}'
```

---

<div align="center">

**SmartChain Hub Backend** · Node.js 20 · Express 4 · 0G Stack

`#BuildOn0G` · `#AgenticEconomy`

</div>
