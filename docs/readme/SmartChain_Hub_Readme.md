<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="120" />

# ⛓ SmartChain Hub
### System Design & Architecture Reference

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-10b981?style=for-the-badge)](https://0g.ai)

> This document is the internal architecture reference. For the public-facing README see [`/README.md`](../../README.md).

</div>

---

## What Is SmartChain Hub?

SmartChain Hub is a **sovereign AI agent economy** — not a chatbot with a wallet.

Every user owns an AI agent that has:
- A **soulbound on-chain identity** — `SmartChainAgentID.sol`, non-transferable NFT on 0G Chain
- **Persistent cross-device memory** — versioned writes to 0G Storage KV, survives device resets
- **TEE-verified intelligence** — LLaMA 3.1 8B inference via 0G Compute TeeML broker
- **Autonomous revenue** — 0.5% fee on every transaction, distributed to stakers on-chain
- **Self-improving models** — TF 2.16 fine-tuned on real user data fetched from 0G Storage

---

## Full System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER BROWSER  ·  Next.js 16 + React 19 + TypeScript 6              │
│                                                                      │
│  /dashboard    AgentIDCard · fine-tune · stats · activity            │
│  /transactions Optimize / Analyze / Simulate tabs                    │
│  /payments     Send / Stake / Agent Escrow                           │
│  /revenue      Revenue sharing · claim earnings                      │
│  /onramp       Stripe + Flutterwave M-Pesa fiat on-ramp              │
│                                                                      │
│  Context: Web3Context (MetaMask SDK v0.34 · ethers.js v6)           │
│           NotificationContext                                        │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ REST / JSON
           ┌───────────────┼──────────────────────┐
           │               │                      │
           ▼               ▼                      ▼
┌──────────────────┐ ┌───────────────┐ ┌──────────────────────────────┐
│  NEXT.JS API     │ │  EXPRESS      │ │  SUPABASE                    │
│  ROUTES          │ │  BACKEND      │ │  PostgreSQL                  │
│  (serverless)    │ │  Node.js 20   │ │  Auth + RLS                  │
│                  │ │  Port 3001    │ │  6 migrations                │
│  /api/storage-   │ │               │ │                              │
│    upload        │ │  POST         │ │  tables:                     │
│  /api/agent-     │ │  /api/txns/   │ │  profiles                    │
│    memory        │ │  process      │ │  transactions                │
│  /api/zk-proof   │ │               │ │  revenue_shares              │
│  /api/fine-tune  │ │  POST         │ │  agent_memory                │
│  /api/onramp/    │ │  /api/txns/   │ └──────────────────────────────┘
│    stripe        │ │  fine-tune    │
│  /api/onramp/    │ └───────┬───────┘
│    mpesa         │         │
└────────┬─────────┘         │
         │                   │
         ▼                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AI AGENT  ·  Flask 3.1.3 + Gunicorn  ·  Render.com                 │
│                                                                      │
│  GET  /health      → status · og_compute · model                    │
│  POST /optimize    → 0G Compute TeeML broker (LLaMA 3.1 8B)         │
│                       fallback: TF 2.16 6-feature neural net         │
│  POST /fine-tune   → fetch 0G Storage roots → train TF model        │
│                                                                      │
│  SavingsModel:  Input(6) → Dense(64) → BN → Dropout                 │
│                 → Dense(32) → Dense(16) → Dense(3, sigmoid)          │
│                 Outputs: savings_rate · confidence · risk_score      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────────┐
         │                 │                      │
         ▼                 ▼                      ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────────────────┐
│  0G STORAGE     │ │  0G STORAGE     │ │  0G CHAIN                  │
│  LOG LAYER      │ │  KV LAYER       │ │  Galileo Testnet 16602     │
│                 │ │                 │ │                            │
│  @0glabs/       │ │  KvClient       │ │  SmartChainAgentID         │
│  0g-ts-sdk      │ │  Batcher        │ │  SmartChainAgentEscrow     │
│  MemData upload │ │  STREAM_ID      │ │  SmartChainPayments        │
│  → Merkle root  │ │  versioned KV   │ │  SmartChainRevenue         │
│  → storageScan  │ │  cross-device   │ │  SmartChainTransaction     │
└─────────────────┘ └─────────────────┘ └────────────────────────────┘
```

---

## Request Lifecycle — One Optimization

```
[1] User enters $amount + priority → clicks Optimize
        │
        ▼
[2] POST /optimize → Flask AI Agent
        ├── call_0g_compute(prompt)
        │     GET broker.0g.ai/v1/providers
        │     POST broker.0g.ai/v1/chat/completions
        │     X-TEE-Proof header → tee_verified: true
        │
        └── fallback: TransactionOptimizer.optimize(amount, priority)
              SavingsModel.predict(amount, priority_idx, congestion, hour)
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
```

---

## Smart Contracts — Deployed on 0G Galileo Testnet

```
CONTRACT                  ADDRESS                                      KEY MECHANICS
──────────────────────────────────────────────────────────────────────────────────────
SmartChainAgentID         0x69C619374c6B901b99941Df7238fceb80d7DCd08
  mintAgentID(modelHash)  one per wallet · non-transferable
  updateMemory(root,wei)  reputation++ · memoryRoot updated
  transfer() → revert     soulbound enforcement

SmartChainAgentEscrow     0x0A3951414c4097AF78953a97e49ad38293e9eA17
  deposit(agentB, price)  open/top-up payment channel
  payPerCall(agentA)      1% platform fee · net to agentB
  withdraw(agentB)        reclaim unused balance · close channel

SmartChainPayments        0x540aFf6B167F8B5889d852d124C545F5f876A7eB
  sendFunds(to, memo)     0.5% fee → revenue pool
  stake()                 5% APY · time-weighted
  unstake()               principal + accrued reward
  claimEarnings()         pull-based revenue claim

SmartChainRevenue         0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08
  registerStaker(amount)  stake weight registration
  distributeRevenue(fee)  10% of fee → stakers pro-rata
  claimEarnings()         pull-based claim

SmartChainTransaction     0xf95A1610be22046c334E3bD1b11D2B88519E6C52
  recordTransaction(...)  immutable on-chain record
  validateTransaction(h)  owner-only confirmation
```

All contracts use `nonReentrant` + `Ownable` from OpenZeppelin 5.x.

---

## AI Model — Technical Specification

```
File:         ai-agent/models/savings_model.py
Saved as:     ai-agent/models/tf_savings_model.keras
Framework:    TensorFlow CPU 2.16.2

Input features (6):
  amount_norm       log1p(amount) / log1p(100_000)
  priority_eff      one-hot [1,0,0] — efficiency
  priority_spd      one-hot [0,1,0] — speed
  priority_sec      one-hot [0,0,1] — security
  congestion        network load estimate [0,1]
  time_of_day_norm  datetime.now().hour / 24

Architecture:
  Input(6)
  → Dense(64, relu)
  → BatchNormalization()
  → Dropout(0.1)
  → Dense(32, relu)
  → Dense(16, relu)
  → Dense(3, sigmoid)

Output heads (3):
  savings_rate   clipped [0.001, 0.04]
  confidence     clipped [0.70,  0.99]
  risk_score     clipped [0.01,  0.50]

Training:
  900 synthetic samples (10 amounts × 3 priorities × 5 congestions × 6 hours)
  epochs=200 · batch=32 · val_split=0.1 · Adam lr=0.001

Fine-tuning:
  Source: real user tx data from 0G Storage by rootHash
  Min samples: 10
  epochs=50 · lr=0.0001 (lower to preserve base knowledge)
  New model_hash = SHA-256(weights bytes) → committed to AgentID on-chain

Routes:
  efficiency → 0G Chain Flash Route      (0.3% fee · 8s)
  speed      → Standard L2 Aggregator    (0.5% fee · 3s)
  security   → Decentralized Liq. Bridge (0.8% fee · 15s)
```

---

## Agent Memory Architecture

```
Write path:
  saveAgentMemory(memory: AgentMemory)
    │
    ├── localStorage.setItem(key, JSON)     instant · device-local cache
    └── POST /api/agent-memory              durable · cross-device
          Batcher.exec(signer)
          → 0G Storage KV versioned write
          → returns rootHash

Read path (on every app mount):
  hydrateAgentMemory(userId)
    │
    ├── GET /api/agent-memory?userId=...
    │     KvClient.getValue(STREAM_ID, key)
    │     → authoritative server state
    │
    └── version comparison
          remote.version > local.version?
            YES → localStorage.setItem(remote)  update cache
            NO  → return local                  already newest

AgentMemory schema:
  userId · preferredPriority · lastAmount · lastRoute
  totalOptimizations · totalSavings · updatedAt · version
```

---

## ZK Proof System

```
POST /api/zk-proof
  { amount, fee, savings, route, userId }
        │
        ├── validateInputs()
        │     amount > 0
        │     fee >= 0 AND fee < amount * 0.05
        │     savings >= 0 AND savings / amount <= 0.10
        │
        ├── Circuit files present?
        │   circuits/transaction_optimizer.wasm
        │   circuits/transaction_optimizer_final.zkey
        │     YES → snarkjs.groth16.fullProve(input, wasm, zkey)
        │           groth16.verify(vkey, publicSignals, proof)
        │           method: "groth16"
        │
        └── NO  → SHA-256 commitment fallback
                  sha256(`${amount}:${fee}:${savings}:${userId}`)
                  verified: true
                  method: "commitment-sha256"
```

---

## Deployment Topology

```
smartchainhubfrontend.vercel.app     Next.js 16 · Vercel Edge
        │
        ├── /api/* routes            Node.js serverless functions
        │     0G Storage SDK calls
        │     snarkjs ZK generation
        │     Supabase client
        │
        ├── smartchain-ai-agent.onrender.com
        │     Flask 3.1.3 + Gunicorn
        │     TensorFlow CPU 2.16
        │     0G Compute broker HTTP
        │
        ├── 0G Galileo Testnet (16602)
        │     5 verified smart contracts
        │     RPC: evmrpc-testnet.0g.ai
        │
        └── Supabase (managed PostgreSQL)
              6 migrations applied
              Row-level security enabled
```

---

## Tech Stack Summary

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

**SmartChain Hub** · Internal Architecture Reference · 0G APAC Hackathon 2026

For public README → [`/README.md`](../../README.md)

`#BuildOn0G` · `#AgenticEconomy`

</div>
