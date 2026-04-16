# SmartChain Hub — AI × Web3 Commerce on 0G

> **0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications**

SmartChain Hub is a B2C decentralized commerce platform that uses **0G Compute** for TEE-verified AI inference, **0G Storage** for immutable transaction metadata, and **0G Chain** smart contracts for on-chain settlement and revenue sharing.

---

## 🔗 0G Mainnet Deployment

| Contract | Address | Explorer |
|----------|---------|---------|
| SmartChainTransaction | `<DEPLOY_ADDRESS_HERE>` | [ChainScan ↗](https://chainscan.0g.ai/address/<DEPLOY_ADDRESS_HERE>) |
| SmartChainRevenue | `<DEPLOY_ADDRESS_HERE>` | [ChainScan ↗](https://chainscan.0g.ai/address/<DEPLOY_ADDRESS_HERE>) |

**Network:** 0G Mainnet · Chain ID `16661` · RPC `https://evmrpc.0g.ai`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER (Next.js)                  │
│  Login (Supabase Auth) → Dashboard → Transaction Optimizer  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│              AI AGENT SERVER (Python / Flask)               │
│                                                             │
│  1. Receives optimize request (amount, priority)            │
│  2. Calls 0G Compute Broker → TeeML inference               │
│     └─ Returns: fee, savings, route + TEE proof metadata    │
│  3. Falls back to local TensorFlow if no API key            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐   ┌──────────▼──────────────────────────┐
│  0G COMPUTE      │   │  0G STORAGE (TypeScript SDK)         │
│  ─────────────── │   │  ─────────────────────────────────── │
│  Model: LLaMA 3  │   │  Log Layer: immutable tx receipts    │
│  Mode: TeeML     │   │  KV Layer:  user state / memory      │
│  Proof: TEE sig  │   │  Returns:   Merkle root hash         │
└──────────────────┘   └──────────────────────────────────────┘
                                   │
                     ┌─────────────▼──────────────────────────┐
                     │  0G CHAIN (Solidity / Hardhat)          │
                     │  ──────────────────────────────────── │
                     │  SmartChainTransaction.recordTransaction│
                     │  SmartChainRevenue.distributeRevenue    │
                     │  Events visible on ChainScan            │
                     └────────────────────────────────────────┘
```

---

## 🧩 0G Components Used

| Component | How Used | Why 0G |
|-----------|----------|--------|
| **0G Compute** | AI inference for transaction optimization via TeeML mode | TEE-verified responses — users can verify inference happened inside a trusted enclave |
| **0G Storage** | Stores transaction metadata (Merkle root committed on-chain) | Immutable, decentralized receipts — no centralized server can alter history |
| **0G Chain** | `SmartChainTransaction` + `SmartChainRevenue` contracts on mainnet | On-chain settlement and verifiable revenue sharing |

---

## 🚀 Reproduction Steps

### Prerequisites
- Node.js 20+, Python 3.12+
- A funded 0G mainnet wallet (for contract deployment)

### 1. Frontend

```bash
cd smartchain_hub_frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_CONTRACT_ADDRESS
npm install
npm run dev
# → http://localhost:3000
```

### 2. AI Agent (with 0G Compute)

```bash
cd ai-agent
pip install -r requirements.txt
export OG_COMPUTE_API_KEY=your_key_here          # from https://dashboard.0g.ai
export OG_COMPUTE_BROKER_URL=https://broker.0g.ai
python3 server/app.py
# → http://localhost:5000
```

Without `OG_COMPUTE_API_KEY`, the server falls back to local TensorFlow inference automatically.

### 3. Deploy Contracts to 0G Mainnet

```bash
cd blockchain
npm install
export PRIVATE_KEY=your_wallet_private_key
npx hardhat run scripts/deploy.js --network og_mainnet
# Copy deployed addresses → update .env.local NEXT_PUBLIC_CONTRACT_ADDRESS
```

### 4. Verify on ChainScan

After deployment, visit:
```
https://chainscan.0g.ai/address/<YOUR_CONTRACT_ADDRESS>
```

---

## 🔑 Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=        # deployed SmartChainTransaction address
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=     # wallet key for 0G Storage uploads (optional)

# AI Agent (shell env)
OG_COMPUTE_API_KEY=                  # 0G Compute API key
OG_COMPUTE_BROKER_URL=https://broker.0g.ai
OG_COMPUTE_MODEL=llama-3.1-8b-instruct

# Blockchain (.env)
PRIVATE_KEY=                         # deployer wallet private key
```

---

## 📁 Project Structure

```
SmartChain-Hub/
├── smartchain_hub_frontend/     # Next.js 16 + TypeScript + Tailwind
│   └── src/
│       ├── pages/               # dashboard, transactions, revenue, profile
│       ├── components/          # Sidebar, Header, Layout
│       └── utils/
│           └── storage.ts       # 0G Storage SDK integration
├── ai-agent/
│   └── server/app.py            # Flask + 0G Compute + TF fallback
├── blockchain/
│   ├── contracts/               # SmartChainTransaction.sol, SmartChainRevenue.sol
│   ├── scripts/deploy.js        # Hardhat deploy → og_mainnet
│   └── hardhat.config.js        # Chain ID 16661
└── docs/
    └── qa.md                    # Test matrix and QA plan
```

---

## ⚖️ License

MIT — Built for the 0G APAC Hackathon 2026.
