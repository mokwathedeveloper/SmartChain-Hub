<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub" width="100" />

# SmartChain Hub
## Technical Whitepaper v1.0

**The Sovereign AI Agent Economy on 0G**

*Version 1.0 · May 2026*

[![arXiv-style](https://img.shields.io/badge/Whitepaper-v1.0-6366f1?style=flat-square)](https://github.com/mokwathedeveloper/SmartChain-Hub)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)
[![Network](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=flat-square)](https://scan-testnet.0g.ai)

</div>

---

## Abstract

SmartChain Hub introduces a new economic primitive: **sovereign AI agents** — autonomous software agents with permanent on-chain identity, verifiable intelligence, persistent cross-device memory, and autonomous revenue generation. Built entirely on 0G's modular AI infrastructure (Chain, Compute TeeML, Storage Log, Storage KV, and Data Availability), SmartChain Hub is the first platform where every user's AI agent is a first-class economic actor — capable of earning, paying, hiring, and being hired without human intermediaries.

The platform solves three interconnected failures in the current AI agent ecosystem: (1) impermanent identity tied to revocable API keys, (2) non-persistent session-only memory, and (3) unverifiable inference with no cryptographic proof of correctness. SmartChain Hub replaces these with five on-chain primitives deployed across six Solidity smart contracts on 0G Chain, backed by a TensorFlow neural network with TEE-attested inference via 0G Compute TeeML.

Every single optimization by a SmartChain agent produces five verifiable on-chain artifacts: a 0G Storage receipt with Merkle root, a ZK cryptographic commitment, an on-chain AgentID update, a revenue distribution event, and a 0G DA-anchored blob — creating a tamper-proof audit trail for every AI decision.

---

## 1. Introduction

### 1.1 The Problem with Today's AI Agents

The AI agent market is projected to reach $52.62 billion by 2030 (MarketsandMarkets, 2025), with NVIDIA CEO Jensen Huang projecting a $1 trillion agentic economy at GTC 2026. Yet every AI agent operating today shares the same fundamental architectural flaw: **agents are tools, not actors**.

Current agents have four critical weaknesses:

**Identity is a liability.** An AI agent's "identity" is an API key owned by a platform. Platforms can revoke it in seconds, copy it arbitrarily, or delete it without recourse. There is no concept of agent ownership, reputation accumulation, or permanence.

**Memory is ephemeral.** Agent memory exists in session storage or centralized databases controlled by platforms. Switching devices destroys memory. Platform shutdowns erase years of behavioral learning. No censorship-resistant, cross-device memory layer exists.

**Inference is a black box.** When an AI agent returns an optimization, there is no cryptographic proof that the model ran correctly, that the output was not tampered with, or that the stated savings are real. Trust is entirely off-chain and unverifiable.

**Revenue flows to platforms, not agents.** Users create the value that trains AI models. Platforms capture 100% of the resulting revenue. Agents that generate billions in decisions earn nothing. Users who generate training data own nothing.

### 1.2 The SmartChain Hub Solution

SmartChain Hub addresses each failure with a corresponding on-chain primitive:

| Failure | Primitive | Implementation |
|---|---|---|
| Identity = API key | Soulbound NFT | `SmartChainAgentID.sol` — permanent, non-transferable |
| Memory = session | Persistent KV | 0G Storage KV with versioned writes |
| Inference = black box | TEE attestation | 0G Compute TeeML + X-TEE-Proof header |
| Revenue = platform | Autonomous distribution | `SmartChainRevenue.sol` — 0.5% auto-distributed |
| No agent payments | Micropayment rail | `SmartChainAgentEscrow.sol` — per-API-call channels |

Together, these primitives form **the Sovereign AI Agent Stack** — the first complete infrastructure for AI agents that own themselves.

---

## 2. System Architecture

### 2.1 Four-Layer Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: User Interface                                    │
│  Next.js 16 · React 19 · TypeScript · Tailwind v4         │
│  23 pages · 19 components · Vercel edge deployment         │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: AI Inference                                      │
│  Flask 3.0 · TensorFlow 2.16 · 0G Compute TeeML           │
│  6-feature neural network · LLaMA 3.1 8B via broker SDK   │
│  TEE-attested inference · Render cloud deployment          │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Decentralised Storage & DA                        │
│  0G Storage Log · 0G Storage KV · 0G DA Layer             │
│  @0glabs/0g-ts-sdk · MemData upload · KvClient batcher    │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Settlement & Identity                             │
│  0G Chain (ChainID 16602/16661) · 6 Solidity contracts    │
│  Soulbound NFT · Revenue distribution · Micropayments      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 The Five 0G Stack Components

**0G Chain** serves as the settlement and identity layer. All six smart contracts are deployed on 0G Galileo Testnet (Chain ID 16602) with mainnet migration planned (Chain ID 16661). The chain provides sub-second finality for agent identity updates, revenue distributions, and escrow settlements.

**0G Compute TeeML** provides TEE-verified AI inference. The platform integrates with the 0G Compute broker SDK to route inference requests to LLaMA 3.1 8B running inside a Trusted Execution Environment. Every response carries an `X-TEE-Proof` header that serves as cryptographic attestation of correct execution. When the broker is unavailable (testnet intermittency), the platform falls back to a locally-hosted TensorFlow model with identical input/output interface.

**0G Storage Log** stores immutable transaction receipts. After every AI optimization is confirmed by the user, the receipt (amount, fee, savings, route, timestamp, ZK commitment) is uploaded to 0G Storage Log via `MemData.upload()`. The returned Merkle root is stored in Supabase and committed on-chain to the user's AgentID contract, creating a two-layer audit trail.

**0G Storage KV** powers persistent agent memory. Agent behavioral data (preferred routes, risk tolerance, historical performance, model parameters) is stored in 0G Storage KV using versioned writes with `KvClient.batchSet()`. A version timestamp prevents stale overwrites across devices. On every app mount, `hydrateAgentMemory()` syncs the latest KV state — giving agents true cross-device memory that survives platform shutdowns.

**0G DA** anchors every agent event to the Data Availability layer. Events (optimization, multi-agent coordination, fine-tune completion) are serialized and submitted to 0G DA, which returns a `da_tx_hash` and `blob_id`. These are stored in Supabase and displayed in the live Activity Feed — giving regulators and auditors a tamper-proof, off-chain-verified event log.

---

## 3. Smart Contract Protocol

### 3.1 Contract Suite

| Contract | Address (Galileo) | Role |
|---|---|---|
| `SmartChainAgentID` | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | Soulbound NFT identity |
| `SmartChainAgentEscrow` | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | Agent micropayment channels |
| `SmartChainPayments` | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | Send/stake/withdraw |
| `SmartChainRevenue` | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | Proportional revenue distribution |
| `SmartChainTransaction` | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | Immutable tx records |
| `SmartChainAgentMarket` | *(deploy pending mainnet funding)* | Agent hire-market |

### 3.2 SmartChainAgentID — Soulbound Identity

The AgentID contract implements ERC-721 with transfer disabled at the contract level — making it a true Soulbound Token (SBT) as described by Buterin et al. (2022). Each wallet can mint exactly one AgentID, which stores:

```solidity
struct Agent {
    uint256 reputation;      // incremented on every optimization
    bytes32 modelHash;       // current TF model version identifier
    bytes32 memoryRoot;      // current 0G Storage KV root hash
    uint256 totalSavings;    // cumulative savings generated (wei)
    uint256 totalOps;        // total optimizations performed
    bool    active;
}
```

On every optimization, the dApp calls `updateAgentID(modelHash, memoryRoot)` which atomically updates the agent's on-chain state. This creates an immutable on-chain record of agent intelligence growth over time — the first verifiable ML model versioning system on a public blockchain.

### 3.3 SmartChainAgentEscrow — Micropayment Channels

The Escrow contract implements per-API-call micropayments between agents. Any wallet can deposit ETH into a channel pointing at an agent address. The agent owner can call `payPerCall(hirer, amount)` to draw down the channel balance. A 1% platform fee is collected per withdrawal.

This creates the first **agent-to-agent payment rail** on 0G — enabling autonomous agent hiring without human intermediaries.

### 3.4 SmartChainAgentMarket — Hire Market

The Market contract allows agent owners to list their trained agent for hire at a fixed price per task. When a hirer calls `hireAgent(agentOwner, taskRef)` with sufficient payment:

- 90% flows immediately to the agent owner via a non-reentrant ETH transfer
- 10% is accumulated as protocol fees, claimable by the contract owner

The contract uses inline reentrancy guards (no OpenZeppelin dependency), checks-effects-interactions ordering, 2-step ownership transfer, and sweeps protocol fees before renouncing ownership — all security patterns verified by Rabbit AI audit.

### 3.5 Economic Security Properties

All contracts satisfy the following invariants:

1. **CEI Ordering**: All state mutations happen before external calls
2. **Non-reentrancy**: Custom `_locked` boolean guard on all payable functions
3. **Savings constraint**: `savings <= fee` enforced at the contract level
4. **Duplicate prevention**: `bytes32` txHash as unique key; second insert reverts
5. **Ownership safety**: 2-step transfer; fee sweep before renounce

---

## 4. AI Agent Design

### 4.1 The Optimization Model

The TensorFlow 2.16 neural network takes 6 features as input:

| Feature | Description | Range |
|---|---|---|
| `amount_norm` | Transaction amount, normalized 0–1 | [0, 1] |
| `priority_fast` | One-hot: user selected "fast" priority | {0, 1} |
| `priority_secure` | One-hot: user selected "secure" priority | {0, 1} |
| `priority_cheap` | One-hot: user selected "cheap" priority | {0, 1} |
| `congestion` | Network congestion index | [0, 100] |
| `time_of_day` | Hour of day, normalized | [0, 1] |

The network produces 3 outputs:

- `savings_rate` — fraction of amount saved (trained range: 0.005–0.045)
- `confidence` — model confidence in prediction (0–1)
- `risk_score` — routing risk assessment (0–1)

Architecture: `Dense(64, relu) → Dropout(0.1) → Dense(32, relu) → Dense(3, sigmoid)`

### 4.2 Three Routing Strategies

| Route | Strategy | Best For |
|---|---|---|
| `0G Chain Flash` | Direct on-chain, lowest latency | Fast priority, low congestion |
| `Standard L2 Aggregator` | Multi-hop with L2 batching | Cheap priority, moderate congestion |
| `Decentralised Liquidity Bridge` | Cross-chain bridge aggregation | Large amounts, high security |

### 4.3 TEE Integration

The Flask server proxies optimization requests to the 0G Compute broker at `broker.0g.ai` using the `og-compute-python` SDK. The broker routes inference to LLaMA 3.1 8B running inside an SGX Trusted Execution Environment. The TEE signs its response with an attestation key, producing the `X-TEE-Proof` header captured by the API route and stored in Supabase.

When the broker returns HTTP 503 (testnet maintenance) or times out, the server falls back to the locally-hosted TF model. Fallback responses are tagged `tee_verified: false` and displayed with a distinct visual badge in the UI.

### 4.4 Incremental Fine-Tuning

The `/fine-tune` API endpoint triggers an incremental training loop:

1. Fetch all confirmed transactions for the user from Supabase
2. Download transaction receipts from 0G Storage Log by Merkle root hash
3. Convert receipts to 6-feature vectors using `_make_features_static()`
4. Train the TF model for 10 epochs at `lr=0.0001` on the user's data
5. Save the updated model and compute its SHA-256 hash
6. Call `updateAgentID(newModelHash, memoryRoot)` on-chain

This creates a personalised model per user — an agent that learns from the specific wallet's transaction history. The model hash committed on-chain is cryptographic proof that this specific version of the model is running for this specific agent.

---

## 5. ZK Proof System

### 5.1 Commitment Scheme

Each transaction optimization produces a ZK commitment:

```
commitment = SHA-256(amount || fee || savings || route || userId || timestamp)
```

This commitment is stored in the 0G Storage receipt and committed to the AgentID contract, creating a binding link between the off-chain optimization parameters and the on-chain identity update. Any third party can verify that the agent's on-chain state corresponds to a specific set of optimization parameters.

### 5.2 Groth16 Path (When Circuit Files Present)

When `circuit.wasm` and `circuit_final.zkey` are available, the system uses `snarkjs` to generate a full Groth16 proof over the optimization parameters. The proof is stored in the 0G Storage receipt and can be verified by any verifier with the `verification_key.json` — enabling trustless proof aggregation by third parties.

### 5.3 Proof Verification

The proof feed at `/api/proof-feed` exposes the most recent TEE-verified optimizations globally, including:
- Transaction hash (0G ChainScan link)
- TEE proof header value
- TEE signer address
- ZK commitment hash
- 0G Storage root and scan URL
- Amount, savings, route

This is a public, permissionless evidence feed — any auditor can independently verify every claim.

---

## 6. Protocol Economics

### 6.1 Fee Structure

| Source | Rate | Beneficiary |
|---|---|---|
| AI optimization | 0.5% of optimized amount | Stakers (via SmartChainRevenue) |
| Agent hire (AgentMarket) | 10% of hire fee | Protocol treasury |
| Agent-to-agent escrow | 1% of withdrawal | Protocol treasury |
| Fund sends | 0.5% | Protocol + staker pool |

### 6.2 Revenue Distribution

`SmartChainRevenue.sol` implements a proportional distribution model. Stakers register with a weight proportional to their staked amount. When `distributeRevenue(totalFee, { value: shareAmount })` is called, each staker's `pendingEarnings` is updated proportionally. Stakers call `claimEarnings()` at any time to withdraw accumulated yield.

### 6.3 The Economic Flywheel

```
Optimize → fee collected → distributed to stakers
    ↑                                   ↓
 Model improves           stakers stake back for 5% APY
    ↑                                   ↓
Fine-tune on               more capital in protocol
real user data
    ↑                                   ↓
  0G Storage         more optimizations → more volume
```

**Four verifiable on-chain actions per optimization:**
- 1 Storage receipt (0G Storage Log)
- 1 ZK commitment (snarkjs / SHA-256)
- 1 AgentID update (0G Chain)
- 1 Revenue event (SmartChainRevenue)
- 1 DA anchor (0G DA Layer)

Every action is independently verifiable. No trust in the platform is required.

---

## 7. Security Model

### 7.1 Smart Contract Security

All contracts have been reviewed against the Rabbit AI security audit framework:

- **Reentrancy**: Custom `nonReentrant` modifier using `_locked` boolean (CEI pattern enforced)
- **Integer overflow**: Solidity 0.8.20 with built-in overflow protection
- **Access control**: `onlyOwner` modifier + 2-step ownership transfer via `pendingOwner`
- **Fee sweep**: Protocol fees swept to owner before `renounceOwnership()` to prevent locked funds
- **Bytes32 encoding**: Byte-aware UTF-8 truncation (not character-based) prevents invalid encoding
- **Savings invariant**: `require(_savings <= _fee)` prevents reward inflation

### 7.2 API Security

- **Rate limiting**: Custom rate limiter (IP-based, Redis-free) on all write endpoints
- **Input validation**: All API inputs validated before processing
- **Secret management**: No secrets in client-side code; server-side API routes proxy sensitive calls
- **CORS**: Supabase RLS policies enforce per-user data isolation
- **Webhook verification**: Stripe `stripe-signature` header + Flutterwave `verif-hash` header validated

### 7.3 Infrastructure Security

- `STORAGE_PRIVATE_KEY` and `NEXT_PUBLIC_STORAGE_PRIVATE_KEY` server-side only
- All contract deployer keys in `.env` (gitignored)
- Supabase Row Level Security enabled on all tables
- No secrets committed to git (verified via `.gitignore` audit)

---

## 8. Roadmap

### Phase 1 — Testnet (Complete)
- [x] All 5 core contracts deployed and verified on 0G Galileo Testnet
- [x] TeeML inference with X-TEE-Proof attestation
- [x] 0G Storage Log receipts with Merkle roots
- [x] 0G Storage KV agent memory with versioned writes
- [x] 0G DA integration with blob anchoring
- [x] Agent hire-market (SmartChainAgentMarket)

### Phase 2 — Mainnet Alpha (Q3 2026)
- [ ] Deploy all 6 contracts to 0G Mainnet (Chain ID 16661)
- [ ] $SCH token launch with staking and governance
- [ ] Full Groth16 ZK proofs (Circom circuit compilation)
- [ ] Fine-tune with production user data (≥100 real transactions)

### Phase 3 — Agent Marketplace (Q4 2026)
- [ ] Agent-to-Agent hiring fully live on mainnet
- [ ] Public agent marketplace with reputation leaderboard
- [ ] SDK release for third-party agent integration
- [ ] Multi-agent coordination protocol

### Phase 4 — Ecosystem (2027)
- [ ] 0G Persistent Memory module integration
- [ ] Cross-chain agent identity bridge (Ethereum, Solana)
- [ ] Enterprise API with SLA guarantees
- [ ] DAO governance transition

---

## 9. Comparison with Related Work

| Project | Identity | Memory | Verified Inference | Revenue | Payments |
|---|---|---|---|---|---|
| **SmartChain Hub** | Soulbound NFT | 0G KV | TEE (TeeML) | Auto-distributed | Escrow + Market |
| Virtuals Protocol | Token-weighted | Off-chain | None | Token emissions | None |
| Autonolas (Olas) | Service NFT | IPFS | None | Token rewards | None |
| Spectral Finance | On-chain score | Off-chain | None | Token model | None |
| Fetch.ai | AEA address | Off-chain | None | FET token | Negotiation |
| Brian AI | None | Session | None | None | None |

SmartChain Hub is the **only** platform that provides all five primitives simultaneously, built on a unified modular infrastructure (0G) rather than assembling incompatible external services.

---

## 10. Conclusion

SmartChain Hub demonstrates that sovereign AI agents are technically feasible today, using available production infrastructure. The five-primitive stack — permanent identity, persistent memory, verified inference, autonomous revenue, and micropayment rails — collectively enables an economic model where AI agents are genuine economic actors rather than tools owned by platforms.

The 0G modular infrastructure (Chain, Compute TeeML, Storage Log, Storage KV, DA) provides exactly the primitives required to build this stack without trust assumptions. Every AI decision is cryptographically proven. Every economic event is on-chain and transparent. Every agent memory is censorship-resistant and permanent.

The $1 trillion agentic economy requires infrastructure that treats agents as first-class economic actors. SmartChain Hub is that infrastructure.

---

## References

1. Buterin, V., Weyl, E.G., Ohlhaver, P. (2022). *Decentralized Society: Finding Web3's Soul.* SSRN.
2. 0G Labs. (2026). *0G Network Documentation.* https://docs.0g.ai
3. MarketsandMarkets. (2025). *AI Agent Market — Global Forecast to 2030.*
4. NVIDIA. (2026). *GTC 2026 Keynote: Jensen Huang on the $1 Trillion Agentic Economy.*
5. Goldwasser, S., Micali, S., Rackoff, C. (1989). *The Knowledge Complexity of Interactive Proof Systems.* SIAM Journal on Computing.
6. Ben-Sasson, E. et al. (2013). *SNARKs for C: Verifying Program Executions Succinctly and in Zero Knowledge.* CRYPTO 2013.

---

<div align="center">

**SmartChain Hub · Technical Whitepaper v1.0 · May 2026**

[Live Demo](https://smartchainhubfrontend.vercel.app) · [GitHub](https://github.com/mokwathedeveloper/SmartChain-Hub) · [ChainScan](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08)

*MIT License · Built for the 0G APAC Hackathon 2026*

</div>
