<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# ⚙️ SmartChain Hub — Setup Guide
### *From zero to running full-stack in under 15 minutes*

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![0G Faucet](https://img.shields.io/badge/0G_Faucet-hub.0g.ai/faucet-0ea5e9?style=flat-square)](https://hub.0g.ai/faucet)

</div>

---

## Prerequisites

```
Node.js 20+          node --version
Python 3.12+         python3 --version
Git                  git --version
MetaMask             browser extension installed
0G Galileo wallet    funded from hub.0g.ai/faucet
```

---

## Architecture Overview

```
localhost:3000  ←→  localhost:5000  ←→  0G Compute broker
  Next.js 16          Flask AI Agent      LLaMA 3.1 8B TeeML
      │                    │
      ▼                    ▼
  Supabase           0G Storage
  PostgreSQL         Log + KV layers
      │
      ▼
  0G Chain
  5 contracts
  Galileo Testnet
```

---

## Step 1 — Clone & Install

```bash
git clone <repo-url>
cd SmartChain-Hub
```

---

## Step 2 — Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**
3. Run migrations in this exact order:

```sql
-- Run each file in sequence
docs/backend/supabase_schema.sql
docs/backend/supabase_migration_002.sql
docs/backend/supabase_migration_003.sql
docs/backend/supabase_migration_004.sql
docs/backend/supabase_migration_005.sql
docs/backend/supabase_migration_006.sql
```

4. Copy from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3 — Deploy Smart Contracts

```bash
cd blockchain
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=0x...   # funded 0G Galileo wallet private key
```

```bash
npm install
npx hardhat run scripts/deploy.js --network og_newton
```

Output will show 5 contract addresses — copy them for Step 4.

---

## Step 4 — Frontend Environment

```bash
cd smartchain_hub_frontend
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# ── Supabase (from Step 2) ─────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ── Smart Contracts (from Step 3) ─────────────────────────────
NEXT_PUBLIC_CONTRACT_ADDRESS=        # SmartChainTransaction
NEXT_PUBLIC_PAYMENTS_CONTRACT=       # SmartChainPayments
NEXT_PUBLIC_AGENT_ID_CONTRACT=       # SmartChainAgentID
NEXT_PUBLIC_AGENT_ESCROW_CONTRACT=   # SmartChainAgentEscrow

# ── 0G Storage ─────────────────────────────────────────────────
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=     # funded 0G wallet key (client)
STORAGE_PRIVATE_KEY=                 # same key (server-side API routes)

# ── AI Agent ───────────────────────────────────────────────────
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:5000
```

```bash
npm install
npm run dev   # → http://localhost:3000
```

---

## Step 5 — AI Agent

```bash
cd ai-agent
cp .env.example .env
```

Fill in `.env`:

```env
OG_COMPUTE_PRIVATE_KEY=    # funded wallet for 0G Compute broker
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct
```

> Without `OG_COMPUTE_PRIVATE_KEY` the server still works — it falls back to local TensorFlow 2.16.

```bash
pip install -r requirements.txt
python3 server/app.py   # → http://localhost:5000
```

Verify:
```bash
curl http://localhost:5000/health
# {"status":"healthy","agent":"SmartChain AI v1.0","og_compute":true}
```

---

## Step 6 — Get Testnet Tokens

Fund your wallet at **[hub.0g.ai/faucet](https://hub.0g.ai/faucet)**

Network details for MetaMask:
```
Network Name:    0G Galileo Testnet
RPC URL:         https://evmrpc-testnet.0g.ai
Chain ID:        16602
Currency Symbol: A0GI
Explorer:        https://scan-testnet.0g.ai
```

---

## Step 7 — Verify Everything Works

```
✅ http://localhost:3000          → Frontend loads
✅ http://localhost:5000/health   → AI agent healthy
✅ Connect MetaMask               → 0G Galileo network
✅ Dashboard → Agent ID Card      → Mint button visible
✅ Transactions → Optimize $100   → Result with TEE badge
✅ Confirm & Save                 → ZK badge + storage badge appear
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `Contract address placeholder` | Deploy via Step 3, copy addresses to `.env.local` |
| `AI agent not responding` | Check `NEXT_PUBLIC_AI_AGENT_URL` in `.env.local` |
| `0G Storage upload fails` | Set `STORAGE_PRIVATE_KEY` with funded wallet |
| `MetaMask wrong network` | Add 0G Galileo (Chain ID 16602) manually |
| `TF model not loading` | First request triggers lazy load — wait 30s on Render free tier |
| `Supabase auth error` | Check RLS policies — run `supabase_migration_005.sql` |
| `Agent ID mint fails` | Need ≥0.001 A0GI for gas — get from faucet |

---

## Running Tests

```bash
# AI Agent — 9 test suites
cd ai-agent
pytest tests/test_unit.py tests/test_integration.py tests/test_e2e.py
pytest tests/test_security.py tests/test_performance.py

# Frontend
cd smartchain_hub_frontend
npm test
npm run test:coverage

# Smart Contracts
cd blockchain
npx hardhat test
```

---

## Production Deployment

See [`docs/deployment/DEPLOYMENT_STATUS.md`](../deployment/DEPLOYMENT_STATUS.md) for full production deployment guide covering Vercel · Render · Railway · Fly.io.

---

<div align="center">

**SmartChain Hub** · Setup complete in ~15 minutes

`#BuildOn0G` · `#AgenticEconomy`

</div>
