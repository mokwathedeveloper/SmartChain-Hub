<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 📋 SmartChain Hub — Codebase Index
### *Complete reference for every file, component, and integration point*

[![TypeScript](https://img.shields.io/badge/TypeScript-64.4%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](.)
[![Python](https://img.shields.io/badge/Python-18.3%25-3776AB?style=flat-square&logo=python&logoColor=white)](.)
[![Solidity](https://img.shields.io/badge/Solidity-3.8%25-363636?style=flat-square&logo=solidity)](.)
[![Rust](https://img.shields.io/badge/Rust-0.3%25-000000?style=flat-square&logo=rust)](.)

</div>

---

## Project Structure

```
SmartChain-Hub/
│
├── 🌐 smartchain_hub_frontend/    Next.js 16 · React 19 · TypeScript 6
│   ├── src/pages/                 15 pages + 6 API routes
│   ├── src/components/            17 React components
│   ├── src/utils/                 12 utility modules
│   └── src/context/               Web3Context · NotificationContext
│
├── 🔧 smartchain_hub_backend/     Node.js 20 · Express 4
│   ├── controllers/               transactionController · userController
│   ├── services/                  aiService · blockchainService
│   ├── middleware/                 security (CSRF · rate limit · headers)
│   └── routes/                    transactions · users
│
├── 🤖 ai-agent/                   Python 3.12 · Flask · TensorFlow 2.16
│   ├── server/app.py              Main Flask server + 0G Compute broker
│   ├── models/savings_model.py    6-feature neural network
│   ├── scripts/optimizer.py       TransactionOptimizer (3 routes)
│   ├── scripts/fine_tuner.py      Incremental TF fine-tuning
│   └── tests/                     9 test suites
│
├── ⛓ blockchain/                  Solidity 0.8.20 · Hardhat · OpenZeppelin
│   ├── contracts/                 5 production contracts
│   ├── rust-optimizer/            CosmWasm WASM optimizer
│   └── scripts/                   Deploy scripts
│
└── 📚 docs/                       30+ documentation files
```

---

## Frontend — Complete File Reference

### Pages (`src/pages/`)

| File | Route | Purpose |
|---|---|---|
| `index.tsx` | `/` | Landing — hero · features · CTA |
| `dashboard.tsx` | `/dashboard` | AgentIDCard · fine-tune · stats · activity |
| `transactions.tsx` | `/transactions` | Optimize / Analyze / Simulate tabs |
| `payments.tsx` | `/payments` | Send / Stake / Agent Escrow |
| `revenue.tsx` | `/revenue` | Revenue sharing · claim earnings |
| `profile.tsx` | `/profile` | Agent identity · memory root |
| `history.tsx` | `/history` | Full transaction history |
| `console.tsx` | `/console` | Developer console |
| `onramp.tsx` | `/onramp` | Stripe + Flutterwave M-Pesa |
| `documentation.tsx` | `/documentation` | API + contract docs |
| `blog.tsx` | `/blog` | Protocol updates |
| `about.tsx` | `/about` | Team + mission |
| `features.tsx` | `/features` | Feature breakdown |
| `contact.tsx` | `/contact` | Support |
| `login.tsx` | `/login` | Supabase auth |
| `signup.tsx` | `/signup` | New account |

### API Routes (`src/pages/api/`)

| File | Method | 0G Module | Purpose |
|---|---|---|---|
| `storage-upload.ts` | `POST` | 0G Storage Log | MemData upload → Merkle rootHash |
| `agent-memory.ts` | `GET/POST` | 0G Storage KV | Read/write versioned agent memory |
| `zk-proof.ts` | `POST` | 0G Privacy | Groth16 / SHA-256 ZK commitment |

### Components (`src/components/`)

| Component | Purpose |
|---|---|
| `AgentIDCard.tsx` | Soulbound identity — mint · refresh · reset · TEE/ZK badges |
| `AIDecisionTree.tsx` | Real-time optimization route visualization |
| `AIDecisionFeed.tsx` | Live inference event stream |
| `AIOptimizationWidget.tsx` | Optimization input + result display |
| `OptimizationAnalytics.tsx` | Savings charts + performance metrics |
| `RevenueSharingWidget.tsx` | Staking + earnings UI |
| `BlockchainTransactionsWidget.tsx` | On-chain tx feed |
| `TransactionList.tsx` | Transaction history table |
| `ProfileSection.tsx` | User profile + agent stats |
| `FeaturesSection.tsx` | Feature showcase |
| `HeroSection.tsx` | Landing page hero |
| `Header.tsx` | Navigation + wallet connect |
| `Sidebar.tsx` | Dashboard navigation |
| `Footer.tsx` | Site footer |
| `Layout.tsx` | Page wrapper |
| `ErrorBoundary.tsx` | React error boundary |
| `Tooltip.tsx` | Accessible tooltip |

### Utilities (`src/utils/`)

| Utility | Purpose |
|---|---|
| `agentId.ts` | `mintAgentID` · `updateMemory` · `getAgentIdentity` · `hasAgentID` |
| `agentMemory.ts` | KV + localStorage dual-write · `hydrateAgentMemory()` cross-device |
| `agentEscrow.ts` | `depositToChannel` · `settleCall` · `withdrawFromChannel` · `getChannelState` |
| `blockchain.ts` | `recordTransactionOnChain` · SmartChainTransaction helpers |
| `storage.ts` | `ZeroGStorageService` singleton · `uploadWithProof()` |
| `zkProof.ts` | `generateZKProof()` · `shortCommitment()` |
| `supabase.ts` | Supabase client singleton |
| `api.ts` | AI agent proxy · `optimizeTransaction()` · `triggerFineTune()` |
| `secureApi.ts` | SSRF-protected API client with allowlist |
| `secureLogger.ts` | Log injection prevention · sanitized console wrapper |
| `chains.ts` | 0G network config (Galileo · Newton · Mainnet) |
| `onrampDelivery.ts` | Stripe + Flutterwave delivery logic |

---

## Backend — Complete File Reference

### Controllers (`controllers/`)

| File | Exports |
|---|---|
| `transactionController.js` | `optimizeTransaction` · `createTransaction` · `processTransaction` · `getTransactions` · `fineTuneModel` · `healthCheck` |
| `userController.js` | `getUser` · `updateUser` |

### Services (`services/`)

| File | Methods |
|---|---|
| `aiService.js` | `optimize(amount, priority)` · `fineTune(hashes, dryRun)` · `health()` |
| `blockchainService.js` | `recordTransaction()` · `validateTransaction()` |

### Config (`config/`)

| File | Purpose |
|---|---|
| `supabaseConfig.js` | Supabase client with service key |
| `blockchainConfig.js` | ethers.js provider + contract instances |

---

## AI Agent — Complete File Reference

### Server (`server/`)

| File | Purpose |
|---|---|
| `app.py` | Flask server · 0G Compute broker · TF fallback · lazy-load |
| `secure_app.py` | Production-safe binding (127.0.0.1 in dev) |

### Models (`models/`)

| File | Purpose |
|---|---|
| `savings_model.py` | `SavingsModel` — 6-feature TF neural network · `predict()` · `_train()` |
| `tf_savings_model.keras` | Trained model weights (binary) |

### Scripts (`scripts/`)

| File | Purpose |
|---|---|
| `optimizer.py` | `TransactionOptimizer` — 3 routes · congestion estimation |
| `fine_tuner.py` | `fine_tune()` · `transactions_to_features()` · 0G Storage fetch |
| `train_model.py` | Standalone model training script |
| `generate_training_data.py` | Synthetic training data generator |
| `optimizeTransaction.py` | Legacy optimizer (kept for reference) |

### Tests (`tests/`) — 9 Suites

| File | Coverage |
|---|---|
| `test_unit.py` | SavingsModel · TransactionOptimizer unit tests |
| `test_integration.py` | Flask routes + optimizer pipeline |
| `test_e2e.py` | Full optimize → fine-tune flow |
| `test_api.py` | HTTP status codes · response schema |
| `test_optimizer.py` | Route selection · fee calculation |
| `test_performance.py` | Throughput · latency benchmarks |
| `test_security.py` | Input validation · injection · overflow |
| `test_functional.py` | Business logic correctness |
| `test_exploratory.py` | Edge cases · boundary values |
| `test_all_types.py` | Combined regression suite |

---

## Blockchain — Complete File Reference

### Contracts (`contracts/`)

| Contract | Address | Key Functions |
|---|---|---|
| `SmartChainAgentID.sol` | `0x69C619...` | `mintAgentID` · `updateMemory` · `getAgent` · `resetMint` |
| `SmartChainAgentEscrow.sol` | `0x0A3951...` | `deposit` · `payPerCall` · `withdraw` · `collectFees` |
| `SmartChainPayments.sol` | `0x540aFf...` | `sendFunds` · `stake` · `unstake` · `claimEarnings` |
| `SmartChainRevenue.sol` | `0x885888...` | `registerStaker` · `distributeRevenue` · `claimEarnings` |
| `SmartChainTransaction.sol` | `0xf95A16...` | `recordTransaction` · `validateTransaction` · `getTransaction` |

### Rust Optimizer (`rust-optimizer/src/lib.rs`)

```rust
ExecuteMsg::VerifyOptimization { amount, fee, savings, proof_factor }
  // Rejects if efficiency_ratio > 0.5 (exploit guard)
  // Rejects if proof_factor < 80 (low confidence guard)
  // Returns: status · efficiency_ratio
```

---

## Troubleshooting Reference

| Error | Cause | Fix |
|---|---|---|
| `connect ECONNREFUSED :5000` | AI agent not running | `cd ai-agent && python3 server/app.py` |
| `Invalid API key` | Wrong Supabase credentials | Check `SUPABASE_URL` + `SUPABASE_ANON_KEY` |
| `Contract address not configured` | Missing env var | Deploy contracts → copy addresses to `.env.local` |
| `No wallet detected` | MetaMask not installed | Install MetaMask → add Chain ID 16602 |
| `0G Storage upload failed` | Missing `STORAGE_PRIVATE_KEY` | Set key or accept SHA-256 fallback |
| `relation does not exist` | Schema not created | Run `supabase_schema.sql` + all migrations |
| `Agent ID already minted` | Wallet already has ID | Click Refresh — ID exists, just not loaded |
| `Insufficient A0GI` | Low balance | Get tokens from hub.0g.ai/faucet |

---

<div align="center">

**SmartChain Hub** · Complete Codebase Index · 0G APAC Hackathon 2026

</div>
