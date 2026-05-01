<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🚀 SmartChain Hub — Deployment Status
### *Production infrastructure across Vercel · Render · 0G Galileo · Supabase*

[![Frontend](https://img.shields.io/badge/Frontend-Live_on_Vercel-000000?style=for-the-badge&logo=vercel)](https://smartchainhubfrontend.vercel.app)
[![AI Agent](https://img.shields.io/badge/AI_Agent-Live_on_Render-46E3B7?style=for-the-badge)](https://smartchain-hub.onrender.com)
[![Contracts](https://img.shields.io/badge/Contracts-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Database](https://img.shields.io/badge/Database-Supabase_Connected-3ECF8E?style=for-the-badge&logo=supabase)](.)

</div>

---

## Live Services

```
SERVICE             URL                                          STATUS
────────────────────────────────────────────────────────────────────────
Frontend            smartchainhubfrontend.vercel.app            ✅ Live
AI Agent            smartchain-hub.onrender.com                 ✅ Live
0G Chain            Galileo Testnet (Chain ID 16602)            ✅ Deployed
Supabase            Managed PostgreSQL                          ✅ Connected
0G Storage          indexer-storage-testnet-standard.0g.ai      ✅ Connected
0G Compute          broker.0g.ai                                ✅ Connected
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                   │
│    └── smartchainhubfrontend.vercel.app                         │
│          Next.js 16 · React 19 · TypeScript 6                   │
│          Tailwind CSS v4 · MetaMask SDK v0.34                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST / JSON
           ┌───────────────┼───────────────────┐
           │               │                   │
           ▼               ▼                   ▼
  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────┐
  │  AI AGENT      │  │  SUPABASE    │  │  0G STACK           │
  │  Render.com    │  │  PostgreSQL  │  │                     │
  │  Flask 3.1.3   │  │  Auth + DB   │  │  0G Chain (16602)   │
  │  TF CPU 2.16   │  │  RLS enabled │  │  0G Storage Log     │
  │  Gunicorn      │  │  6 migrations│  │  0G Storage KV      │
  │  Python 3.12   │  └──────────────┘  │  0G Compute TeeML   │
  └────────────────┘                    └─────────────────────┘
```

---

## Smart Contract Addresses

| Contract | Address | Explorer |
|---|---|---|
| 🤖 SmartChainAgentID | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) |
| 🔒 SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) |
| 💸 SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| 📊 SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) |
| 📝 SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) |

**Network:** 0G Galileo Testnet · Chain ID `16602` · RPC `https://evmrpc-testnet.0g.ai`

---

## AI Agent Health Check

```bash
curl https://smartchain-hub.onrender.com/health
```

```json
{
  "agent": "SmartChain AI v1.0",
  "status": "healthy",
  "og_compute": true,
  "og_compute_model": "llama-3.1-8b-instruct",
  "og_compute_rpc": "https://evmrpc-testnet.0g.ai"
}
```

---

## AI Optimization Sample Response

```bash
curl -X POST https://smartchain-hub.onrender.com/optimize \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "priority": "efficiency"}'
```

```json
{
  "route":        "0G Chain Flash Route",
  "fee":          3.00,
  "savings":      18.85,
  "confidence":   89.7,
  "risk":         "Low",
  "congestion":   40,
  "ml_engine":    "TensorFlow v2.16 (6-feature model)",
  "tee_verified": true,
  "tee_mode":     "TeeML",
  "provider_id":  "0x...",
  "estimated_time_s": 8
}
```

---

## Environment Variables

### Frontend — Vercel Dashboard

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf95A1610be22046c334E3bD1b11D2B88519E6C52
NEXT_PUBLIC_PAYMENTS_CONTRACT=0x540aFf6B167F8B5889d852d124C545F5f876A7eB
NEXT_PUBLIC_AGENT_ID_CONTRACT=0x69C619374c6B901b99941Df7238fceb80d7DCd08
NEXT_PUBLIC_AGENT_ESCROW_CONTRACT=0x0A3951414c4097AF78953a97e49ad38293e9eA17
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=
STORAGE_PRIVATE_KEY=
NEXT_PUBLIC_AI_AGENT_URL=https://smartchain-hub.onrender.com
```

### AI Agent — Render Dashboard

```env
OG_COMPUTE_PRIVATE_KEY=
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
PORT=5000
```

---

## Deployment Commands

### Frontend (Vercel — automatic on push)

```bash
cd smartchain_hub_frontend
vercel env add NEXT_PUBLIC_AI_AGENT_URL production
# value: https://smartchain-hub.onrender.com
vercel --prod
```

### AI Agent (Render — automatic on push)

```bash
# render.yaml handles build + start commands
# Build: pip install -r requirements.txt
# Start: gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 server.app:app
git push origin main  # triggers Render auto-deploy
```

### AI Agent (Manual alternatives)

```bash
# Railway
cd ai-agent && railway login && railway up
railway variables set OG_COMPUTE_PRIVATE_KEY=<key>

# Fly.io
cd ai-agent && fly launch && fly deploy
fly secrets set OG_COMPUTE_PRIVATE_KEY=<key>

# Automated script
./deploy.sh
```

### Smart Contracts (Hardhat)

```bash
cd blockchain
cp .env.example .env  # set PRIVATE_KEY
npm install
npx hardhat run scripts/deploy.js --network og_newton
# Copy output addresses → update frontend .env.local
```

---

## Supabase Migrations

Apply in order in the Supabase SQL editor:

```
docs/backend/supabase_schema.sql          ← base schema
docs/backend/supabase_migration_002.sql   ← storage_root column
docs/backend/supabase_migration_003.sql   ← agent_memory table
docs/backend/supabase_migration_004.sql   ← revenue_shares table
docs/backend/supabase_migration_005.sql   ← RLS policies
docs/backend/supabase_migration_006.sql   ← indexes + performance
```

---

## Health Check Flow

```
Browser loads smartchainhubfrontend.vercel.app
        │
        ├── Supabase auth check → session restored
        ├── hydrateAgentMemory() → 0G KV read
        ├── AgentIDCard → reads SmartChainAgentID contract
        └── Dashboard stats → Supabase queries

User clicks "Optimize"
        │
        ├── POST /optimize → smartchain-hub.onrender.com
        │     └── 0G Compute broker → LLaMA 3.1 8B
        │         └── fallback: TF 2.16 local model
        │
        ├── POST /api/zk-proof → Vercel serverless
        ├── POST /api/storage-upload → 0G Storage Log
        ├── POST /api/agent-memory → 0G Storage KV
        └── AgentID.updateMemory() → 0G Chain tx
```

---

<div align="center">

**SmartChain Hub** · Production Infrastructure · 0G APAC Hackathon 2026

`#BuildOn0G` · `#AgenticEconomy`

</div>
