<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🏗️ SmartChain Hub — System Architecture
### *Complete technical architecture of the sovereign AI agent economy*

[![Live](https://img.shields.io/badge/Live-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![Network](https://img.shields.io/badge/Network-0G_Galileo_16602-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)

</div>

---

## Full System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                        │
│  Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS v4             │
│  Deployed: Vercel Edge Network                                       │
│                                                                      │
│  Pages: / · /dashboard · /transactions · /payments · /revenue       │
│         /profile · /history · /console · /onramp · /documentation   │
│         /blog · /about · /features · /contact · /login · /signup    │
│                                                                      │
│  Key Components:                                                     │
│  AgentIDCard · AIDecisionTree · AIDecisionFeed                       │
│  OptimizationAnalytics · RevenueSharingWidget                        │
│  BlockchainTransactionsWidget · TransactionList                      │
│                                                                      │
│  Wallet: MetaMask SDK v0.34 · ethers.js v6                          │
│  Chain:  0G Galileo Testnet · Chain ID 16602                        │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
         ┌─────────────┼──────────────────────────┐
         │             │                          │
         ▼             ▼                          ▼
┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│  NEXT.JS API    │  │  EXPRESS BACKEND │  │  SUPABASE              │
│  ROUTES         │  │  Node.js 20      │  │  PostgreSQL            │
│  (serverless)   │  │  Port 3001       │  │  Auth + RLS            │
│                 │  │  Render.com      │  │  7 migrations          │
│  /storage-      │  │                  │  │                        │
│    upload       │  │  POST /api/txns/ │  │  Tables:               │
│  /agent-memory  │  │  process         │  │  profiles              │
│  /zk-proof      │  │                  │  │  transactions          │
│  /fine-tune     │  │  POST /api/txns/ │  │  revenue_shares        │
│  /onramp/stripe │  │  fine-tune       │  │  agent_memory          │
│  /onramp/mpesa  │  │                  │  └────────────────────────┘
└────────┬────────┘  └────────┬─────────┘
         │                    │
         └──────────┬─────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AI AGENT  ·  Flask 3.1.3 + Gunicorn  ·  Render.com                 │
│  Python 3.12 · TensorFlow CPU 2.16.2                                │
│                                                                      │
│  GET  /health      status · og_compute · model                      │
│  POST /optimize    0G Compute TeeML → LLaMA 3.1 8B                  │
│                    fallback: TF 2.16 6-feature neural net            │
│  POST /fine-tune   0G Storage roots → feature vectors → train       │
│                                                                      │
│  Model: Input(6) → Dense(64,relu) → BatchNorm → Dropout(0.1)        │
│         → Dense(32,relu) → Dense(16,relu) → Dense(3,sigmoid)        │
│  Outputs: savings_rate · confidence · risk_score                    │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
       ┌───────────────┼──────────────────────┐
       │               │                      │
       ▼               ▼                      ▼
┌──────────────┐ ┌─────────────────┐ ┌────────────────────────────────┐
│  0G STORAGE  │ │  0G STORAGE     │ │  0G CHAIN                      │
│  LOG LAYER   │ │  KV LAYER       │ │  Galileo Testnet · ID 16602    │
│              │ │                 │ │                                │
│  @0glabs/    │ │  KvClient       │ │  SmartChainAgentID             │
│  0g-ts-sdk   │ │  Batcher        │ │  0x69C619374c6B901b99941Df72   │
│  MemData     │ │  STREAM_ID      │ │  38fceb80d7DCd08               │
│  upload      │ │  versioned      │ │                                │
│  → Merkle    │ │  cross-device   │ │  SmartChainAgentEscrow         │
│    rootHash  │ │  memory         │ │  0x0A3951414c4097AF78953a97e   │
│              │ │                 │ │  49ad38293e9eA17               │
│  Indexer     │ │  hydrateAgent   │ │                                │
│  RPC:        │ │  Memory() on    │ │  SmartChainPayments            │
│  indexer-    │ │  every mount    │ │  0x540aFf6B167F8B5889d852d12   │
│  storage-    │ │                 │ │  4C545F5f876A7eB               │
│  testnet-    │ └─────────────────┘ │                                │
│  standard    │                     │  SmartChainRevenue             │
│  .0g.ai      │                     │  0x8858886AEE6342DFA4DE5Cf66   │
└──────────────┘                     │  dB25dCF75b31A08               │
                                     │                                │
                                     │  SmartChainTransaction         │
                                     │  0xf95A1610be22046c334E3bD1b   │
                                     │  11D2B88519E6C52               │
                                     └────────────────────────────────┘
```

---

## Request Lifecycle — One Full Optimization

```
[1] User enters $amount + priority → clicks Optimize
        │
        ▼
[2] POST /optimize → Flask AI Agent (Render)
        ├── call_0g_compute(prompt)
        │     GET broker.0g.ai/v1/providers
        │     POST broker.0g.ai/v1/chat/completions
        │     X-TEE-Proof header → tee_verified: true
        │
        └── fallback: TransactionOptimizer.optimize()
              SavingsModel.predict(amount, priority, congestion, hour)
              Returns: fee · savings · route · confidence · risk

[3] User clicks Confirm & Save
        │
        ├── POST /api/zk-proof
        │     validateInputs(amount, fee, savings)
        │     snarkjs.groth16.fullProve() OR sha256 commitment
        │     → commitment stored in receipt
        │
        ├── POST /api/storage-upload
        │     new MemData(bytes) → indexer.upload()
        │     → rootHash (Merkle root)
        │     → storageScanUrl
        │
        ├── POST /api/agent-memory
        │     Batcher.exec(signer) → 0G KV write
        │     version++ prevents stale overwrites
        │
        ├── supabase.insert('transactions')
        │     amount · fee · savings · route
        │     storage_root · tx_hash · storage_scan_url
        │
        └── SmartChainAgentID.updateMemory(rootHash, savingsWei)
              reputation++ on-chain
              memoryRoot = new KV root
              SmartChainTransaction.recordTransaction()
              Revenue: 0.5% fee → SmartChainPayments pool
```

---

## Smart Contract Architecture

```
SmartChainAgentID.sol
  mintAgentID(modelHash)     one per wallet · non-transferable
  updateMemory(root, wei)    reputation++ · memoryRoot updated
  getAgent(owner)            full identity read
  resetMint(wallet)          owner-only · for testing
  transfer() → revert        soulbound enforcement
  Security: Ownable

SmartChainAgentEscrow.sol
  deposit(agentB, price)     open/top-up payment channel
  payPerCall(agentA)         1% platform fee · net to agentB
  withdraw(agentB)           reclaim unused balance
  collectFees()              owner-only fee collection
  Security: Ownable + ReentrancyGuard

SmartChainPayments.sol
  sendFunds(to, memo)        0.5% fee → revenue pool
  stake()                    5% APY · time-weighted
  unstake()                  principal + accrued reward
  claimEarnings()            pull-based revenue claim
  Security: Ownable + ReentrancyGuard

SmartChainRevenue.sol
  registerStaker(amount)     stake weight registration
  distributeRevenue(fee)     10% of fee → stakers pro-rata
  claimEarnings()            pull-based claim
  Security: Ownable + ReentrancyGuard

SmartChainTransaction.sol
  recordTransaction(...)     immutable on-chain record
  validateTransaction(hash)  owner-only confirmation
  Security: Ownable + ReentrancyGuard
```

---

## Agent Memory Architecture

```
Write path:
  saveAgentMemory(memory)
    ├── localStorage.setItem()     instant · device-local
    └── POST /api/agent-memory     durable · cross-device
          Batcher.exec(signer) → 0G KV write
          returns rootHash

Read path (on every app mount):
  hydrateAgentMemory(userId)
    ├── GET /api/agent-memory?userId=...
    │     KvClient.getValue(STREAM_ID, key)
    └── version comparison
          remote.version > local.version?
            YES → update localStorage cache
            NO  → keep local (already newest)
```

---

## ZK Proof System

```
POST /api/zk-proof { amount, fee, savings, route, userId }
  │
  ├── validateInputs()
  │     amount > 0 · fee >= 0 · fee < amount*0.05
  │     savings >= 0 · savings/amount <= 0.10
  │
  ├── circuits/*.wasm + *.zkey present?
  │     YES → snarkjs.groth16.fullProve()
  │           method: "groth16"
  │
  └── NO  → sha256(`${amount}:${fee}:${savings}:${userId}`)
              method: "commitment-sha256"
              verified: true
```

---

## Deployment Topology

```
smartchainhubfrontend.vercel.app    Next.js 16 · Vercel Edge
  ├── /api/* serverless functions   0G Storage SDK · snarkjs · Supabase
  ├── smartchain-ai-agent.onrender.com   Flask · TF 2.16 · 0G Compute
  ├── 0G Galileo Testnet (16602)    5 verified contracts
  └── Supabase                      PostgreSQL · RLS · 7 migrations
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| ![Next.js](https://img.shields.io/badge/Next.js-000?style=flat-square&logo=next.js) Frontend | Next.js + React + TypeScript | 16.2.4 / 19 / 6.0.3 |
| ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) Styling | Tailwind CSS | v4.2.4 |
| ![MetaMask](https://img.shields.io/badge/MetaMask-F6851B?style=flat-square&logo=metamask&logoColor=white) Wallet | MetaMask SDK + ethers.js | 0.34.0 / v6.13 |
| ![0G](https://img.shields.io/badge/0G_SDK-0ea5e9?style=flat-square) Storage | @0glabs/0g-ts-sdk | 0.3.3 |
| ![snarkjs](https://img.shields.io/badge/snarkjs-7C3AED?style=flat-square) ZK | snarkjs Groth16 | 0.7.6 |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) Database | Supabase PostgreSQL | 2.45.0 |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) Backend | Express.js | 20 / 4.x |
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) AI | Flask + TensorFlow CPU | 3.12 / 2.16.2 |
| ![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity) Contracts | Solidity + OpenZeppelin | 0.8.20 / 5.x |
| ![Rust](https://img.shields.io/badge/Rust-000?style=flat-square&logo=rust&logoColor=white) Optimizer | CosmWasm WASM | 1.x |
| ![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel) Deploy | Vercel + Render | — |

---

<div align="center">

**SmartChain Hub** · System Architecture · 0G APAC Hackathon 2026

`#BuildOn0G` · `#AgenticEconomy`

</div>
