<div align="center">

# ⛓ SmartChain Hub — Technical Architecture & Stack

### *The First Sovereign AI Agent Economy on 0G*

> Every component chosen with purpose. Every layer verifiable on-chain.

</div>

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   👤  USER  ──►  🌐 Next.js 16 Frontend (Vercel)                           │
│                         │                                                  │
│              ┌──────────┼──────────────┐                                   │
│              ▼          ▼              ▼                                   │
│        MetaMask     Supabase      REST API calls                           │
│        SDK v0.34    Auth/DB       to AI Agent                              │
│              │          │              │                                   │
│              ▼          ▼              ▼                                   │
│   ⛓ 0G Chain      🗄️ Supabase    🤖 Flask AI Agent (Render)               │
│   5 Contracts      PostgreSQL     Python 3.12                              │
│   Galileo Testnet  Row-level      TensorFlow 2.16                          │
│   Chain ID 16602   Security       LLaMA 3.1 8B via 0G Compute             │
│              │                        │                                   │
│              └──────────┬─────────────┘                                   │
│                         ▼                                                  │
│              📦 0G Storage Layer                                           │
│              ├── Log Layer  → immutable tx receipts (MemData)             │
│              └── KV Layer   → versioned agent memory                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Full Request Lifecycle

```
User submits $amount + priority
        │
        ▼
[1] Frontend calls POST /optimize (Flask AI Agent)
        │
        ├──► 0G Compute TeeML broker available?
        │         YES → LLaMA 3.1 8B inference
        │               X-TEE-Proof header returned
        │               tee_verified: true
        │         NO  → TensorFlow 2.16 local fallback
        │               6-feature neural network
        │               savings_rate + confidence + risk_score
        │
        ▼
[2] User confirms → Frontend orchestrates 4 on-chain actions:
        │
        ├──► POST /api/zk-proof
        │         Groth16 (snarkjs) or SHA-256 commitment fallback
        │         Proves: savings > 0, fee < 2%, rate ∈ [0.001, 0.04]
        │
        ├──► POST /api/storage-upload
        │         @0glabs/0g-ts-sdk MemData upload
        │         Returns Merkle rootHash
        │         Stored in Supabase + committed on-chain
        │
        ├──► POST /api/agent-memory
        │         0G Storage KV versioned write
        │         hydrateAgentMemory() syncs cross-device
        │         localStorage dual-write for instant UI
        │
        └──► SmartChainAgentID.updateMemory()
                  reputation++ on-chain
                  memoryRoot = new KV root
                  SmartChainTransaction.recordTransaction()
                  SmartChainRevenue → 0.5% fee distributed
```

---

## 🧠 AI Agent Pipeline

```
TransactionOptimizer.optimize(amount, priority)
        │
        ├── SavingsModel.predict(amount, priority_idx, congestion, hour)
        │       Input  [6 features]:
        │         amount_norm      log1p(amount) / log1p(100_000)
        │         priority_eff     one-hot [1,0,0]
        │         priority_spd     one-hot [0,1,0]
        │         priority_sec     one-hot [0,0,1]
        │         congestion       network load [0,1]
        │         time_of_day_norm hour / 24
        │
        │       Architecture:
        │         Input(6) → Dense(64, relu) → BatchNorm → Dropout(0.1)
        │                  → Dense(32, relu) → Dense(16, relu)
        │                  → Dense(3, sigmoid)
        │
        │       Output [3 heads]:
        │         savings_rate   clipped [0.001, 0.04]
        │         confidence     clipped [0.70,  0.99]
        │         risk_score     clipped [0.01,  0.50]
        │
        └── Route selection:
              efficiency → 0G Chain Flash Route      (0.3% fee, 8s)
              speed      → Standard L2 Aggregator    (0.5% fee, 3s)
              security   → Decentralized Liq. Bridge (0.8% fee, 15s)
```

---

## 🔁 Fine-Tuning Loop

```
Dashboard "Fine-tune Model" button
        │
        ▼
GET storage_root hashes from Supabase (last 50 tx)
        │
        ▼
POST /fine-tune → Flask AI Agent
        │
        ├── fetch_transactions_from_0g(root_hashes)
        │       0G Indexer REST API: GET /v1/file/{rootHash}
        │       Falls back gracefully if SDK unavailable
        │
        ├── transactions_to_features(transactions)
        │       amount, fee, savings, route, tee_verified, timestamp
        │       → 6-feature vectors + [savings_rate, confidence, risk]
        │
        ├── Minimum 10 samples required
        │
        ├── model.compile(Adam lr=0.0001)   ← lower LR preserves base
        ├── model.fit(X, y, epochs=50)
        ├── model.save(tf_savings_model.keras)
        │
        └── SHA-256(weights bytes) → model_hash
              Returned to frontend → committed to AgentID on-chain
```

---

## ⛓ Smart Contract Architecture

```
SmartChainAgentID.sol          (Soulbound NFT)
├── mintAgentID(modelHash)     one per wallet, non-transferable
├── updateMemory(root, savings) reputation++, memoryRoot updated
├── getAgent(owner)            full identity read
└── struct AgentIdentity {
      owner, memoryRoot, modelHash,
      reputation, totalSavings, mintedAt, exists
    }

SmartChainAgentEscrow.sol      (Agent-to-Agent Micropayments)
├── deposit(agentB, pricePerCall)  open/top-up channel
├── payPerCall(agentA)             1% platform fee deducted
├── withdraw(agentB)               reclaim unused balance
└── struct Channel {
      agentA, agentB, balance,
      pricePerCall, totalCalls, totalPaid, active
    }

SmartChainPayments.sol         (Send / Stake / Earn)
├── sendFunds(to, memo)        0.5% fee → revenue pool
├── stake()                    5% APY, time-weighted
├── unstake()                  principal + accrued reward
└── claimEarnings()            pending revenue share

SmartChainRevenue.sol          (Proportional Distribution)
├── registerStaker(amount)     stake weight registration
├── distributeRevenue(fee)     10% of fee → stakers pro-rata
└── claimEarnings()            pull-based claim

SmartChainTransaction.sol      (Immutable Records)
├── recordTransaction(hash, amount, fee, route)
└── validateTransaction(hash)  owner-only confirmation
```

---

## 🗄️ Data Flow — Storage Layers

```
Write Path:
  Optimization confirmed
        │
        ├──► localStorage          (instant, device-local cache)
        ├──► Supabase PostgreSQL    (relational history + rootHash index)
        ├──► 0G Storage Log        (immutable receipt, Merkle root)
        └──► 0G Storage KV         (versioned agent memory, cross-device)

Read Path (on mount):
  hydrateAgentMemory(userId)
        │
        ├── GET /api/agent-memory?userId=...
        │       KvClient.getValue(STREAM_ID, key)
        │       Returns authoritative server state
        │
        └── version comparison
              remote.version > local.version?
                YES → update localStorage cache
                NO  → keep local (already newest)
```

---

## 🛡️ ZK Proof System

```
POST /api/zk-proof
  { amount, fee, savings, route, userId }
        │
        ├── validateInputs()
        │     amount > 0
        │     fee >= 0
        │     fee < amount * 0.05
        │     savings / amount <= 0.10
        │
        ├── Circuit files present? (circuits/*.wasm + *.zkey)
        │     YES → snarkjs.groth16.fullProve()
        │           groth16.verify(vkey, publicSignals, proof)
        │           method: "groth16"
        │
        └── NO  → SHA-256 commitment fallback
                  0x + sha256(`${amount}:${fee}:${savings}:${userId}`)
                  verified: true (deterministically verifiable)
                  method: "commitment-sha256"
```

---

## 🌐 Frontend Page Map

```
/                   Landing — hero, features, CTA
/dashboard          AgentIDCard + fine-tune + stats + activity feed
/transactions       Optimize / Analyze / Simulate tabs
/revenue            Revenue sharing + claim earnings
/payments           Send / Stake / Agent Escrow tabs
/profile            Agent identity + memory root display
/history            Full transaction history
/console            Developer console + raw API calls
/onramp             Stripe + Flutterwave M-Pesa fiat on-ramp
/documentation      Full API + contract docs
/blog               Protocol updates
/about              Team + mission
/features           Full feature breakdown
/contact            Support
```

---

## 🔧 Tech Stack — Complete Reference

### ⛓ Blockchain Layer

| Technology | Version | Role |
|---|---|---|
| ![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white) | `0.8.20` | 5 production smart contracts |
| ![Hardhat](https://img.shields.io/badge/Hardhat-F7DF1E?style=flat-square&logoColor=black) | `2.x` | Compile, test, deploy pipeline |
| ![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4E5EE4?style=flat-square&logo=openzeppelin&logoColor=white) | `5.x` | Ownable, ReentrancyGuard |
| ![ethers.js](https://img.shields.io/badge/ethers.js-2535A0?style=flat-square) | `v6.13` | Contract interactions, wallet |
| ![Rust](https://img.shields.io/badge/Rust_WASM-000000?style=flat-square&logo=rust&logoColor=white) | `1.x` | CosmWasm optimizer module |
| **0G Galileo Testnet** | Chain ID `16602` | Settlement layer |

**Contracts deployed & verified:**

```
SmartChainAgentID       0x69C619374c6B901b99941Df7238fceb80d7DCd08
SmartChainAgentEscrow   0x0A3951414c4097AF78953a97e49ad38293e9eA17
SmartChainPayments      0x540aFf6B167F8B5889d852d124C545F5f876A7eB
SmartChainRevenue       0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08
SmartChainTransaction   0xf95A1610be22046c334E3bD1b11D2B88519E6C52
```

---

### 🤖 AI Agent Layer

| Technology | Version | Role |
|---|---|---|
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | `3.12` | Runtime |
| ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) | `3.1.3` | HTTP server, CORS, routing |
| ![TensorFlow](https://img.shields.io/badge/TensorFlow_CPU-FF6F00?style=flat-square&logo=tensorflow&logoColor=white) | `2.16.2` | Neural network inference + fine-tuning |
| ![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white) | `1.26.4` | Feature engineering, training data |
| **0G Compute TeeML** | broker SDK | LLaMA 3.1 8B TEE-attested inference |
| **Gunicorn** | `23.0.0` | Production WSGI server |

**Model architecture:**
```
Input(6) → Dense(64, relu) → BatchNorm → Dropout(0.1)
         → Dense(32, relu) → Dense(16, relu)
         → Dense(3, sigmoid)
         
Outputs: savings_rate · confidence · risk_score
Trained: 900 synthetic samples (10 amounts × 3 priorities × 5 congestions × 6 hours)
Fine-tune: lr=0.0001, epochs=50, min_samples=10
```

---

### 🌐 Frontend Layer

| Technology | Version | Role |
|---|---|---|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) | `16.2.4` | SSR framework, API routes |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | `19.0` | UI component tree |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | `6.0.3` | Full type safety |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | `v4.2.4` | Utility-first styling |
| ![MetaMask SDK](https://img.shields.io/badge/MetaMask_SDK-F6851B?style=flat-square&logo=metamask&logoColor=white) | `0.34.0` | Wallet connection, chain switching |
| **snarkjs** | `0.7.6` | Groth16 ZK proof generation |
| **@0glabs/0g-ts-sdk** | `0.3.3` | Storage Log + KV client |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | — | Production deployment |

**Key components:**
```
AgentIDCard.tsx          Soulbound identity — mint, refresh, reset
AIDecisionTree.tsx       Real-time optimization visualization
AIDecisionFeed.tsx       Live inference event stream
OptimizationAnalytics.tsx Savings charts + performance metrics
RevenueSharingWidget.tsx  Staking + earnings UI
BlockchainTransactionsWidget.tsx On-chain tx feed
```

---

### 🗄️ Storage & Database Layer

| Technology | Role |
|---|---|
| **0G Storage Log** | Immutable transaction receipts via MemData upload |
| **0G Storage KV** | Versioned agent memory — `hydrateAgentMemory()` cross-device sync |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Relational tx history, Merkle root index, auth |
| **snarkjs Groth16** | ZK proofs with SHA-256 commitment fallback |

**Supabase schema (6 migrations):**
```
profiles            user identity + wallet address
transactions        amount, fee, savings, route, storage_root, tx_hash
revenue_shares      user_share, period, claimed
agent_memory        userId, memory JSON, version
storage_roots       rootHash index for fine-tuning
```

---

### 🔧 Backend Layer

| Technology | Version | Role |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | `20` | Runtime |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | `4.x` | REST API server |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | — | Containerised deployment |
| **Axios** | — | AI agent proxy + timeout handling |
| **Render / Railway / Fly.io** | — | Multi-platform deployment targets |

---

### 🧪 Testing Layer

| Suite | Technology | Coverage |
|---|---|---|
| `test_unit.py` | pytest | SavingsModel, TransactionOptimizer |
| `test_integration.py` | pytest | Flask routes + optimizer pipeline |
| `test_e2e.py` | pytest | Full optimize → fine-tune flow |
| `test_security.py` | pytest | Input validation, injection, overflow |
| `test_performance.py` | pytest | Throughput, latency benchmarks |
| `test_functional.py` | pytest | Business logic correctness |
| `test_exploratory.py` | pytest | Edge cases, boundary values |
| `test_api.py` | pytest | HTTP status codes, response schema |
| `test_all_types.py` | pytest | Combined regression suite |
| Frontend | Jest + RTL | Component + util unit tests |
| Contracts | Hardhat + Mocha | All 5 contracts |

---

## 🚀 Deployment Topology

```
┌─────────────────────────────────────────────────────┐
│  PRODUCTION DEPLOYMENT                              │
│                                                     │
│  smartchainhubfrontend.vercel.app                   │
│    └── Next.js 16 on Vercel Edge Network            │
│          └── /api/* routes (Node.js serverless)     │
│                │                                    │
│                ├── 0G Storage SDK calls             │
│                ├── snarkjs ZK proof generation      │
│                └── Supabase client                  │
│                                                     │
│  ai-agent.onrender.com  (or Railway / Fly.io)       │
│    └── Gunicorn + Flask                             │
│          └── TensorFlow CPU 2.16                    │
│                └── 0G Compute broker HTTP calls     │
│                                                     │
│  0G Galileo Testnet (Chain ID 16602)                │
│    └── 5 verified smart contracts                   │
│          └── RPC: evmrpc-testnet.0g.ai              │
│                                                     │
│  Supabase (managed PostgreSQL)                      │
│    └── 6 migrations applied                         │
│    └── Row-level security enabled                   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Codebase Composition

```
Language      Lines    Share   Bar
──────────────────────────────────────────────────────
TypeScript    ~8,400   64.4%   ████████████████████████████████░░░░░░░░
Python        ~2,390   18.3%   ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
JavaScript    ~1,100    8.4%   █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Shell           ~600    4.6%   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Solidity        ~500    3.8%   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Rust             ~40    0.3%   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Other            ~26    0.2%   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**File counts by layer:**
```
Frontend components    17 tsx
Frontend pages         15 tsx  (+ 6 API routes)
Frontend utils         12 ts
AI agent scripts        5 py
AI agent tests          9 py
Smart contracts         5 sol
Blockchain scripts      4 js
Supabase migrations     6 sql
Docs                   30+ md
```

---

## 🔑 Key Design Decisions

| Decision | Rationale |
|---|---|
| Lazy-load TensorFlow in Flask | Avoids 512MB OOM crash on Render free tier |
| `staticNetwork` on ethers provider | Skips chain detection — prevents timeout on 0G Galileo |
| `version` field in AgentMemory | Prevents stale localStorage overwrites on cross-device sync |
| SHA-256 commitment fallback for ZK | Groth16 requires compiled circuit files — fallback keeps flow unblocked |
| `fetchingRef` guard in AgentIDCard | Prevents duplicate in-flight fetches on signer recreation |
| Dual-write localStorage + 0G KV | Instant UI responsiveness + durable cross-device persistence |
| `nonReentrant` on all payable functions | Reentrancy protection on all 5 contracts |
| CosmWasm Rust optimizer | High-performance verification layer — efficiency_ratio > 0.5 rejected |

---

## 🔗 0G Stack Integration Matrix

| 0G Module | Integration Point | File |
|---|---|---|
| **0G Chain** | 5 contracts on Galileo Testnet | `blockchain/contracts/*.sol` |
| **0G Compute TeeML** | LLaMA 3.1 8B via broker HTTP | `ai-agent/server/app.py` |
| **0G Compute Fine-tuning** | `POST /fine-tune` → fetch by rootHash → train | `ai-agent/scripts/fine_tuner.py` |
| **0G Storage Log** | MemData upload → Merkle root | `src/pages/api/storage-upload.ts` |
| **0G Storage KV** | Batcher versioned write + KvClient read | `src/pages/api/agent-memory.ts` |
| **Agent ID Standard** | Soulbound NFT — modelHash + memoryRoot + reputation | `SmartChainAgentID.sol` |
| **Agent Escrow** | deposit → payPerCall → withdraw | `SmartChainAgentEscrow.sol` |
| **ZK Proofs** | Groth16 / SHA-256 commitment | `src/pages/api/zk-proof.ts` |

---

<div align="center">

Built for the **0G APAC Hackathon 2026** · Track 3: Agentic Economy

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
