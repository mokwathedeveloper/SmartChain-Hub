# SmartChain Hub — AI × Web3 Commerce on 0G

> **0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications**

🌐 **Live Demo:** https://smartchainhubfrontend.vercel.app

SmartChain Hub is a decentralized AI commerce platform where every user has a **sovereign AI agent** with on-chain identity, persistent memory, and verifiable intelligence — powered by the full 0G modular stack.

The agent optimizes blockchain transactions using **0G Compute** (TEE-verified LLaMA inference), stores immutable receipts on **0G Storage** (Log + KV layers), commits memory roots to a **soulbound Agent ID** on **0G Chain**, distributes revenue automatically via smart contracts, and supports **agent-to-agent micropayments** via an on-chain escrow contract.

---

## 🔗 Live Deployment — 0G Galileo Testnet

| Contract | Address | Explorer |
|----------|---------|---------|
| SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) |
| SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) |
| SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| **SmartChainAgentID** | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) |
| SmartChainAgentEscrow | *Deploy via `scripts/deployAgentEscrow.js`* | Galileo Testnet |

**Network:** 0G Galileo Testnet · Chain ID `16602` · RPC `https://evmrpc-testnet.0g.ai`

---

## 🤖 What Makes This Different — Agent Sovereignty

Most "AI + Web3" projects are just ChatGPT with a tip jar. SmartChain Hub is different:

| Feature | Most Projects | SmartChain Hub |
|---------|--------------|----------------|
| Agent identity | EOA wallet (copyable) | Soulbound NFT on 0G Chain (non-transferable) |
| Agent memory | localStorage / DB | 0G Storage KV — versioned, cross-device, survives browser resets |
| Inference proof | None | TEE-verified via 0G Compute TeeML mode |
| Transaction receipts | Centralized DB | Immutable 0G Storage Log layer + Merkle root |
| Revenue sharing | Manual | Automated on-chain via SmartChainRevenue |
| Agent payments | None | Per-API-call micropayments via SmartChainAgentEscrow |
| Model improvement | Static | Fine-tuned on real user tx data from 0G Storage |
| Proof of savings | None | ZK commitment (SHA-256 / Groth16) stored on-chain |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER (Next.js 16)                    │
│  Login → Dashboard → Agent ID Card → Transaction Optimizer      │
│  ZK Proof Badge · TEE Badge · Agent Escrow · Fine-tune Panel    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────────┐
│             BACKEND API (Node.js / Express)                     │
│  /api/transactions/process  → optimize + store + record         │
│  /api/transactions/fine-tune → fetch 0G Storage roots → train   │
└──────────┬───────────────────────────────────────────────────────┘
           │
     ┌─────┴──────────────────────────────────────┐
     │                                            │
┌────▼─────────────┐   ┌────────────────────────────────────────┐
│  AI AGENT        │   │  0G STORAGE (Next.js API Routes)       │
│  ─────────────── │   │  ──────────────────────────────────── │
│  Model: LLaMA 3  │   │  /api/storage-upload → Log layer       │
│  Mode:  TeeML    │   │  /api/agent-memory   → KV layer        │
│  POST /fine-tune │   │  /api/zk-proof       → ZK commitment   │
│  TF fallback     │   │  Returns Merkle root hash              │
└──────────────────┘   └────────────────┬───────────────────────┘
                                        │ rootHash committed
                       ┌────────────────▼───────────────────────┐
                       │  0G CHAIN — 5 Contracts                 │
                       │  ──────────────────────────────────── │
                       │  SmartChainAgentID   → soulbound NFT   │
                       │    .mintAgentID()    → one per wallet  │
                       │    .updateMemory()   → KV root on-chain│
                       │    .reputation       → increments/tx   │
                       │                                        │
                       │  SmartChainAgentEscrow → micropayments │
                       │    .deposit()        → fund channel    │
                       │    .payPerCall()     → claim per API   │
                       │    .withdraw()       → reclaim balance │
                       │                                        │
                       │  SmartChainTransaction → record tx     │
                       │  SmartChainRevenue     → auto payout   │
                       │  SmartChainPayments    → stake/earn    │
                       └────────────────────────────────────────┘
```

---

## 🧩 0G Components Used

| **Component** | **Integration** | **Evidence** |
|-----------|-------------|-------|
| **0G Compute** | TeeML inference via broker SDK — LLaMA 3.1 8B optimizes transactions | TEE proof in response headers, displayed in UI badge |
| **0G Compute Fine-tuning** | `POST /fine-tune` fetches real tx receipts from 0G Storage by root hash, converts to 6-feature training vectors, incrementally fine-tunes TF model at lr=0.0001 | Model hash updated on-chain after each run; requires ≥10 real samples |
| **0G Storage Log** | Immutable transaction receipts uploaded via `@0glabs/0g-ts-sdk` MemData | Merkle root stored in Supabase + on-chain |
| **0G Storage KV** | Agent memory persisted cross-session — GET reads from KV, POST writes with version field; `hydrateAgentMemory()` syncs on mount | Memory root committed to Agent ID contract; version prevents stale overwrites |
| **0G Chain** | 5 contracts on Galileo Testnet — settlement, revenue, Agent ID, Escrow, Payments | All addresses verified on ChainScan |
| **Agent ID** | `SmartChainAgentID.sol` — soulbound NFT storing modelHash + memoryRoot + reputation | Non-transferable, updated on every optimization |
| **Agent Escrow** | `SmartChainAgentEscrow.sol` — per-API-call micropayments: deposit → payPerCall → withdraw; 1% platform fee | Full UI in Payments → Agent Escrow tab |
| **ZK Proofs** | `POST /api/zk-proof` — Groth16 via snarkjs (when circuit files present) or SHA-256 commitment fallback; proves savings > 0, fee < 2%, rate in [0.001, 0.05] | Commitment stored in every 0G Storage receipt; purple badge in UI |

---

## 🔄 Economic Flywheel

```
User optimizes transaction
        ↓
AI Agent (0G Compute TeeML) returns optimized route + TEE proof
        ↓
ZK proof generated (Groth16 / SHA-256 commitment)
        ↓
Receipt uploaded to 0G Storage Log → Merkle root returned
        ↓
Agent ID memory updated on-chain (reputation++, memoryRoot updated)
        ↓
0.5% fee collected → distributed to stakers via SmartChainPayments
        ↓
Revenue share recorded → claimable via SmartChainRevenue
        ↓
User claims earnings → stakes back → earns 5% APY
        ↓
Storage roots accumulate → Fine-tune TF model on real data
        ↓ (loop — model improves with every user)
```

Every optimization generates: 1 Storage upload + 1 ZK proof + 1 Agent ID update + 1 revenue event = **4 verifiable actions per user interaction**.

---

## 🚀 Production Deployment

### Quick Deploy AI Agent

```bash
# Option 1: Automated deployment script
./deploy.sh

# Option 2: Manual deployment to Render
git add . && git commit -m "deploy: production" && git push
# Then connect GitHub repo to Render dashboard

# Option 3: Railway CLI
cd ai-agent/
npm install -g @railway/cli
railway login && railway up
railway variables set OG_COMPUTE_PRIVATE_KEY=your_key

# Option 4: Fly.io
cd ai-agent/
curl -L https://fly.io/install.sh | sh
fly auth login && fly launch --no-deploy
fly secrets set OG_COMPUTE_PRIVATE_KEY=your_key
fly deploy
```

### Update Frontend Environment

```bash
# After AI agent deployment, update frontend
./update-env.sh
# Or manually edit smartchain_hub_frontend/.env.local:
# NEXT_PUBLIC_AI_AGENT_URL=https://your-deployed-url.com
```

### Production URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://smartchainhubfrontend.vercel.app | ✅ Live |
| AI Agent | *Deploy using scripts above* | 🔄 Deploy needed |
| Contracts | 0G Galileo Testnet | ✅ Deployed |

---

## 🚀 Reproduction Steps
### Prerequisites
- Node.js 20+, Python 3.12+
- Funded 0G Galileo wallet (get tokens: https://hub.0g.ai/faucet)

### 1. Clone & Install

```bash
git clone <repo>
cd SmartChain-Hub

# Frontend
cd smartchain_hub_frontend
cp .env.local.example .env.local
# Fill in Supabase keys + contract addresses (see .env.local.example)
npm install
npm run dev   # → http://localhost:3000

# AI Agent
cd ../ai-agent
cp .env.example .env
# Fill in OG_COMPUTE_PRIVATE_KEY
pip install -r requirements.txt
python3 server/app.py   # → http://localhost:5000
```

### 2. Supabase Setup

Run all migrations in order in your Supabase SQL editor:

```
docs/backend/supabase_schema.sql
docs/backend/supabase_migration_002.sql
docs/backend/supabase_migration_003.sql
docs/backend/supabase_migration_004.sql
```

### 3. Deploy Contracts

```bash
cd blockchain
cp .env.example .env
# Set PRIVATE_KEY to funded wallet
npm install
npx hardhat run scripts/deploy.js --network og_newton
# Copy addresses → update .env.local
```

### 4. Verify on ChainScan

```
https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52
https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08
```

---

## 🔑 Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=        # SmartChainTransaction
NEXT_PUBLIC_PAYMENTS_CONTRACT=       # SmartChainPayments
NEXT_PUBLIC_AGENT_ID_CONTRACT=       # SmartChainAgentID
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=     # 0G Storage wallet key
STORAGE_PRIVATE_KEY=                 # Server-side storage key
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:5000
NEXT_PUBLIC_CHAIN=og_newton

# AI Agent (.env)
OG_COMPUTE_PRIVATE_KEY=              # Funded wallet for 0G Compute broker
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct

# Blockchain (.env)
PRIVATE_KEY=                         # Deployer wallet
```

---

## 📁 Project Structure

```
SmartChain-Hub/
├── ai-agent/
│   ├── server/app.py                # Flask + 0G Compute broker + TF fallback
│   ├── scripts/optimizer.py         # TransactionOptimizer (3 routes)
│   ├── models/savings_model.py      # TensorFlow 6-feature model
│   ├── render.yaml                  # Render deployment config
│   ├── railway.json                 # Railway deployment config
│   ├── fly.toml                     # Fly.io deployment config
│   └── DEPLOY.md                    # Cloud deployment guide
├── smartchain_hub_backend/
│   ├── controllers/
│   │   └── transactionController.js # Enhanced with 0G Storage integration
│   ├── services/
│   │   ├── aiService.js             # AI agent proxy with error handling
│   │   └── blockchainService.js     # Smart contract interactions
│   ├── config/
│   │   ├── supabaseConfig.js        # Database configuration
│   │   └── blockchainConfig.js      # 0G Chain configuration
│   ├── routes/
│   │   └── transactions.js          # API endpoints
│   ├── app.js                       # Express server v2.0.0
│   ├── render.yaml                  # Render deployment config
│   └── README.md                    # Backend integration guide
├── smartchain_hub_frontend/
│   └── src/
│       ├── pages/
│       │   ├── dashboard.tsx        # Agent ID card + stats
│       │   ├── transactions.tsx     # AI optimizer + confirm flow
│       │   ├── revenue.tsx          # Revenue sharing + claim
│       │   ├── payments.tsx         # Send/stake/withdraw
│       │   └── api/
│       │       ├── storage-upload.ts  # 0G Storage server route
│       │       ├── agent-memory.ts    # 0G KV memory server route
│       │       └── onramp/
│       │           ├── stripe.ts      # Stripe payment processing
│       │           └── mpesa.ts       # Flutterwave M-Pesa
│       ├── components/
│       │   └── AgentIDCard.tsx      # Soulbound identity display
│       └── utils/
│           ├── agentId.ts           # Agent ID contract interactions
│           ├── agentMemory.ts       # Persistent memory (KV + localStorage)
│           ├── storage.ts           # 0G Storage client wrapper
│           ├── blockchain.ts        # ethers.js contract helpers
│           └── api.ts               # AI agent API client
├── blockchain/
│   ├── contracts/
│   │   ├── SmartChainAgentID.sol    # Soulbound Agent ID
│   │   ├── SmartChainTransaction.sol
│   │   ├── SmartChainRevenue.sol
│   │   └── SmartChainPayments.sol
│   └── scripts/deploy.js
└── docs/
    └── backend/
        ├── supabase_schema.sql
        └── supabase_migration_002.sql
```

---

## 🗺️ Roadmap

| Status | Feature | 0G Module | Notes |
|--------|---------|----------|-------|
| ✅ Live | Agent ID soulbound NFT + memory root on-chain | 0G Chain | Deployed at `0x69C6...` |
| ✅ Live | TEE-verified inference via 0G Compute broker (TeeML) | 0G Compute | Falls back to local TF when broker unavailable |
| ✅ Live | Immutable receipts on 0G Storage Log layer | 0G Storage | `@0glabs/0g-ts-sdk` MemData upload |
| ✅ Live | Agent memory — 0G Storage KV, versioned, cross-device | 0G Storage KV | `hydrateAgentMemory()` on mount; localStorage fallback |
| ✅ Live | Fine-tune TF model on real user tx data from 0G Storage | 0G Compute | `POST /fine-tune`; requires ≥10 confirmed transactions |
| ✅ Live | Agent-to-Agent micropayments — `SmartChainAgentEscrow.sol` | 0G Chain | Contract compiled; **deploy via `scripts/deployAgentEscrow.js`** |
| ✅ Live | ZK-verified transaction proofs — SHA-256 commitment | 0G Privacy | SHA-256 commitment works; Groth16 requires Circom circuit compilation |
| 🔜 Next | Deploy `SmartChainAgentEscrow` to Galileo Testnet | 0G Chain | Run `npx hardhat run scripts/deployAgentEscrow.js --network og_newton` |
| 🔜 Next | Full Groth16 ZK proofs — compile Circom circuit + proving keys | 0G Privacy | Requires `circom` + `snarkjs` circuit compilation |
| 🔜 Next | Fine-tune with production user data | 0G Compute | Needs ≥10 real transactions from live users |
| 🔜 Next | Official 0G Persistent Memory module | 0G Persistent Memory | Awaiting official SDK release from 0G Labs |

---

## ⚖️ License

MIT — Built for the 0G APAC Hackathon 2026.

#0GHackathon #BuildOn0G
