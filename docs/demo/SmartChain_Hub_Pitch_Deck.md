<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# SmartChain Hub — Pitch Deck
### *The First Sovereign AI Agent Economy on 0G*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-6366f1?style=for-the-badge)](https://0g.ai)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

> **0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications (Verifiable Finance)**

*"The only Track 3 project integrating all 5 layers of 0G — Chain · Compute TeeML · Storage Log · Storage KV · DA. Every optimization generates 5 verifiable on-chain artifacts. Every interaction makes the agent smarter. Every agent earns revenue autonomously."*

</div>

---

## Slide 1 · The Hook

**What if your AI agent owned itself — had a permanent identity, remembered everything, and earned money without asking permission from any platform?**

Today's AI agents are API keys.
They can be revoked, copied, or deleted by the platforms that own them.
They forget you the moment you close the tab.
They generate billions in value — and keep none of it.

**SmartChain Hub changes that. Built entirely on 0G.**

---

## Slide 2 · The Problem

The AI agent economy has a fatal flaw. Today's AI agents are not agents. They are tools.

```
PROBLEM 1 — Agent identity = API key
  Platform revokes it → agent dies instantly.
  No on-chain reputation. No persistence. No ownership.

PROBLEM 2 — Memory = session storage
  Switch devices → all memory gone forever.
  Platform shuts down → agent history erased.
  No censorship-resistant, cross-device memory layer.

PROBLEM 3 — Inference = black box
  No proof the AI ran correctly.
  No proof the optimization was honest.
  No trust. No accountability. No economy.

PROBLEM 4 — Revenue = platform keeps everything
  Users create value. Platforms capture it.
  Agents generate billions. Users earn nothing.

PROBLEM 5 — Payments = none
  Agents cannot pay each other.
  No agent-to-agent commerce primitive exists.
```

> **$500 billion will flow through AI agents by 2030.
> None of it is verifiable. None of it belongs to the user.**

---

## Slide 3 · The Solution

SmartChain Hub — Sovereign AI Agents.
Every user owns an AI agent that earns, learns, and acts autonomously on-chain.

```
PRIMITIVE 1 — Permanent On-Chain Identity (0G Chain)
  ┌──────────────────────────────────────────────────┐
  │  SmartChainAgentID.sol                           │
  │  Soulbound NFT — cannot be transferred,          │
  │  copied, or revoked. Ever.                       │
  │  Stores: modelHash · memoryRoot                  │
  │          reputation · totalSavings               │
  │  Updates on every optimization                   │
  └──────────────────────────────────────────────────┘

PRIMITIVE 2 — Remembers Everything (0G Storage KV)
  ┌──────────────────────────────────────────────────┐
  │  Memory on 0G Storage KV                         │
  │  Cross-device · versioned                        │
  │  Survives platform shutdowns                     │
  │  hydrateAgentMemory() syncs on every mount       │
  └──────────────────────────────────────────────────┘

PRIMITIVE 3 — Proves Its Intelligence (0G Compute TeeML)
  ┌──────────────────────────────────────────────────┐
  │  Every inference runs inside TEE                 │
  │  via 0G Compute TeeML                            │
  │  X-TEE-Proof header on every response            │
  │  Cryptographic proof in every response           │
  └──────────────────────────────────────────────────┘

PRIMITIVE 4 — Earns Autonomously (SmartChainRevenue)
  ┌──────────────────────────────────────────────────┐
  │  0.5% of every optimization auto-distributed     │
  │  to stakers on-chain                             │
  │  No human intermediary                           │
  └──────────────────────────────────────────────────┘

PRIMITIVE 5 — Pays Other Agents (SmartChainAgentEscrow)
  ┌──────────────────────────────────────────────────┐
  │  Per-API-call micropayments between agents       │
  │  via SmartChainAgentEscrow                       │
  │  First agent-to-agent payment rail on 0G         │
  └──────────────────────────────────────────────────┘
```

---

## Slide 4 · One Optimization. Five Verifiable On-Chain Artifacts.

Every single optimization triggers a self-reinforcing loop:

```
  User submits transaction ($amount, priority)
          │
          ▼
  🤖  0G Compute TeeML — LLaMA 3.1 8B inference
          │  Returns: fee · savings · route · TEE proof
          ▼
  🔐  Cryptographic Commitment Proof — SHA-256 anchored
          │  Proves: savings > 0, fee < 2%, rate valid
          ▼
  📦  0G Storage Log — immutable receipt
          │  Merkle rootHash stored in Supabase + committed on-chain
          ▼
  🪪  SmartChainAgentID.updateMemory()
          │  reputation++ · memoryRoot updated on-chain
          ▼
  📡  0G DA Layer — event blob anchored
          │  blob_id + da_tx_hash → tamper-proof audit trail
          ▼
  💰  0.5% fee collected
          │  Distributed to stakers via SmartChainPayments
          ▼
  📈  Revenue claimable via SmartChainRevenue
          │  Stakers earn proportional share
          ▼
  🔄  User stakes → earns 5% APY → stakes more
          │
          ▼
  🧬  Storage roots accumulate
          │  Fine-tune TF model on real user data (≥10 samples)
          │  Model improves → better routes → more savings
          └──────────────────────────────────────────────────►
                              (loop repeats, compounding)
```

> **This loop compounds. Every user makes every other user's agent smarter.**

**5 verifiable on-chain artifacts per user interaction:**
`Storage Log receipt` + `ZK commitment` + `Agent ID update` + `Revenue event` + `DA-anchored blob`

---

## Slide 5 · We Use the Full 0G Stack. Not One Module. All Five.

> **No other Track 3 submission integrates all 5 0G layers. SmartChain Hub is the only project to use 0G DA.**

### 0G Protocol — Complete Integration (5 / 5 Components)

| 0G Module | How We Use It | Where to Verify |
|---|---|---|
| **0G Chain** | 5 contracts on Galileo Testnet — identity, escrow, revenue, payments, tx records | All 5 addresses verified on ChainScan |
| **0G Compute TeeML** | LLaMA 3.1 8B TEE-attested inference via broker SDK | `X-TEE-Proof` header · `tee_verified: true` in DB |
| **0G Compute Fine-tuning** | Incremental TF training on real tx data fetched by Merkle root | Model hash committed to AgentID on-chain |
| **0G Storage Log** | Immutable tx receipts via MemData upload on every optimization | Merkle root in Supabase + committed to AgentID |
| **0G Storage KV** | Versioned agent memory cross-device — survives platform shutdowns | `hydrateAgentMemory()` syncs on mount · memory root on-chain |
| **0G DA Layer** | Every agent event anchored to DA — multi-agent coordination, activity logs | `da_events.blob_id` + `da_tx_hash` in DB · Activity Feed UI |

### Smart Contracts — 0G Galileo Testnet

| Contract | Address | Role |
|---|---|---|
| SmartChainAgentID | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | Soulbound identity · memory · reputation |
| SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | Agent-to-agent micropayments |
| SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | Send · stake · withdraw · 5% APY |
| SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | Proportional revenue distribution |
| SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | Immutable on-chain transaction records |

### AI Layer

```
Runtime:      Python 3.12 · Flask 3.1.3 · Gunicorn · Render
Model:        TensorFlow CPU 2.16 · 6-feature neural network
Architecture: Input(6) → Dense(64) → BatchNorm → Dropout
              → Dense(32) → Dense(16) → Dense(3, sigmoid)
Outputs:      savings_rate · confidence · risk_score
Fine-tuning:  lr=0.0001 · epochs=50 · min_samples=10
Primary:      0G Compute TeeML broker (LLaMA 3.1 8B)
Fallback:     Local TF 2.16 model (graceful, always works)
```

### Frontend

```
Framework:    Next.js 16.2.4 · React 19 · TypeScript 6
Styling:      Tailwind CSS v4
Wallet:       MetaMask SDK v0.34 · ethers.js v6
Proofs:       snarkjs 0.7.6 (SHA-256 commitment + Groth16 path)
Storage:      @0glabs/0g-ts-sdk 0.3.3
Database:     Supabase · PostgreSQL · Row-level security
Deployment:   Vercel Edge Network
```

---

## Slide 6 · Competitive Differentiation

| Capability | Traditional AI Apps | SmartChain Hub |
|---|---|---|
| Agent identity | API key — copyable, revocable | Soulbound NFT on 0G Chain — permanent |
| Agent memory | Session-only / centralized DB | 0G Storage KV — versioned, cross-device |
| Inference proof | None | TEE-verified via 0G Compute TeeML |
| Transaction receipts | Centralized logs | Immutable 0G Storage Log + Merkle root |
| Revenue model | Platform takes all | Automated on-chain distribution |
| Agent payments | None | Per-API-call micropayments via Escrow |
| Model improvement | Static, manual retraining | Fine-tuned on real user data from 0G Storage |
| Proof of optimization | None | Cryptographic commitment anchored on-chain every tx |

---

## Slide 7 · This Is Not a Concept. It Is Live Right Now.

```
✅  5 smart contracts deployed and verified on 0G Galileo Testnet
✅  Live frontend at smartchainhubfrontend.vercel.app
✅  AI agent live on Render — health endpoint responding
✅  0G Chain — 5 contracts live, ChainScan verified
✅  0G Compute TeeML — broker integration with graceful TF fallback
✅  0G Storage Log — MemData uploads, Merkle root committed on-chain
✅  0G Storage KV — agent memory persisting cross-device
✅  0G DA Layer — every agent event anchored; blob_id + da_tx_hash stored
✅  63 contract tests passing · 9 AI agent test suites
✅  Cryptographic ZK commitment anchored on-chain every transaction
✅  Agent-to-agent micropayments live via SmartChainAgentEscrow + AgentMarket
✅  Stripe + Flutterwave M-Pesa on-ramp integrated
✅  23 frontend pages fully functional
✅  Demo Mode — full AI optimizer flow, no wallet required
✅  Fine-tune trigger with live model hash update on-chain
✅  7 Supabase migrations applied · TypeScript strict mode 0 errors
```

> **Built by 1 developer. In weeks. On a testnet. With zero budget.**

---

## Slide 8 · Three Converging Markets. One Infrastructure Layer.

```
  $500B+                    $50B+                     $500B+
  ──────────────────        ──────────────────        ──────────────────
  AI Agent Economy          Decentralized Storage     DeFi On-chain
  $5B today → $500B+        $2B today → $50B+         $80B TVL today
  by 2030                   by 2030                   → $500B+ by 2030
```

**The real opportunity is not the app. It is the primitive.**

Every AI application that needs verifiable identity, persistent memory,
provable inference, and autonomous revenue distribution needs what we built.
We are the infrastructure layer.

---

## Slide 9 · Three Revenue Streams. All On-Chain. All Automated.

**Transaction Fee 0.5%**
Every optimization collects 0.5% of transaction amount.
Auto-distributed to stakers via SmartChainRevenue smart contract.

**Agent Escrow Fee 1%**
Every agent-to-agent micropayment charges 1% platform fee.
Scales automatically as agent commerce grows.

**Fine-tuning as a Service**
Enterprises pay to fine-tune the shared model on proprietary data.
Model hash updated on-chain — verifiable and auditable.

**Unit Economics**
```
10,000 daily transactions at avg $500
→ $25,000 daily volume
→ $125 daily fees
→ $45,000 per year
Scales linearly. Zero marginal cost per agent.
```

---

## Slide 10 · Where We Are Going

| # | Milestone | Date | 0G Module |
|---|---|---|---|
| ✅ | Full 0G stack live on Galileo Testnet | **NOW — May 2026** | All |
| 2 | Full Groth16 ZK circuit compile + 0G Persistent Memory | **Q3 2026** | 0G Privacy + Memory |
| 3 | Multi-agent coordination + Mainnet deployment on 0G | **Q4 2026** | 0G Chain |
| 4 | Enterprise fine-tuning API + B2B revenue stream | **Q1 2027** | 0G Compute |
| 5 | Agent marketplace — buy, sell, rent sovereign agents | **Q2 2027** | 0G Chain + Storage |
| 6 | Cross-chain agent identity on any EVM chain | **Q3 2027** | 0G Chain |

> *Every AI application in the world uses SmartChain Hub as its identity, memory, and payment layer.*

---

## Slide 11 · The Agentic Economy Starts Here

> Every agent has an identity.
> Every decision is proven.
> Every interaction is remembered.
> Every optimization generates revenue.
>
> *This is not a chatbot with a wallet. This is the Agentic Economy. Built on 0G. Built to last.*

**For Judges:**
Most complete full 0G stack implementation in this hackathon.
Every module used in one cohesive product that makes each layer more valuable.

**For Investors:**
Pre-seed raise to deploy on mainnet, onboard first 1,000 sovereign agents, build enterprise API, hire 2 engineers.

**For Partners:**
Open to 0G ecosystem grants, credits, and co-marketing.
We want to be the reference implementation of sovereign AI agents on 0G.

---

**Mokwa Moffat · smartchainhubfrontend.vercel.app · scan-testnet.0g.ai**
`#0GHackathon` `#BuildOn0G` `@0G_labs` `@0g_CN` `@0g_Eco` `@HackQuest_`

**0G APAC Hackathon 2026 — Track 3: Agentic Economy & Autonomous Applications**
