<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🚀 SmartChain Hub — Pitch Deck
### *The First Sovereign AI Agent Economy on 0G*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-10b981?style=for-the-badge)](https://0g.ai)

> *"Every optimization generates 4 verifiable on-chain actions. Every interaction makes the agent smarter. Every agent earns revenue autonomously."*

</div>

---

## Slide 1 · The Hook

**What if your AI agent remembered you — not from a database, but from a blockchain?**

What if every AI decision was cryptographically proven inside a Trusted Execution Environment?

What if your agent earned real revenue, staked it autonomously, and grew smarter with every transaction?

**This is SmartChain Hub. Built entirely on 0G.**

---

## Slide 2 · The Problem

The AI agent economy is broken in three fundamental ways:

```
PROBLEM 1 — No Sovereign Identity
  AI agents today are API keys.
  Copyable. Revocable. Owned by platforms, not users.
  → No persistent identity. No on-chain reputation.

PROBLEM 2 — No Persistent Memory
  Agent memory lives in session storage or centralized databases.
  Switch devices → memory gone.
  Platform shuts down → memory gone forever.
  → No cross-device, censorship-resistant memory layer.

PROBLEM 3 — No Verifiable Intelligence
  AI inference is a black box.
  No proof the model ran correctly.
  No proof the optimization was honest.
  → No trust. No accountability. No economy.
```

**The result:** AI agents cannot be first-class economic actors. They are tools, not agents.

---

## Slide 3 · The Solution

SmartChain Hub introduces three primitives that fix all three problems:

```
PRIMITIVE 1 — Soulbound Agent ID (0G Chain)
  ┌─────────────────────────────────────────┐
  │  SmartChainAgentID.sol                  │
  │  Non-transferable NFT per wallet        │
  │  Stores: modelHash · memoryRoot         │
  │          reputation · totalSavings      │
  │  Updates on every optimization          │
  └─────────────────────────────────────────┘

PRIMITIVE 2 — Persistent Cross-Device Memory (0G Storage KV)
  ┌─────────────────────────────────────────┐
  │  hydrateAgentMemory(userId)             │
  │  Versioned KV writes via Batcher        │
  │  Survives: device resets · app updates  │
  │  Syncs: on every mount, cross-device    │
  └─────────────────────────────────────────┘

PRIMITIVE 3 — TEE-Verified Intelligence (0G Compute TeeML)
  ┌─────────────────────────────────────────┐
  │  LLaMA 3.1 8B via broker SDK            │
  │  X-TEE-Proof header in every response   │
  │  Falls back to TF 2.16 gracefully       │
  │  ZK commitment proves: savings > 0      │
  └─────────────────────────────────────────┘
```

---

## Slide 4 · The Economic Flywheel

Every single optimization triggers a self-reinforcing loop:

```
  User submits transaction ($amount, priority)
          │
          ▼
  🤖  0G Compute TeeML — LLaMA 3.1 8B inference
          │  Returns: fee · savings · route · TEE proof
          ▼
  🔐  ZK Proof — Groth16 or SHA-256 commitment
          │  Proves: savings > 0, fee < 2%, rate valid
          ▼
  📦  0G Storage Log — immutable receipt
          │  Merkle rootHash stored in Supabase
          ▼
  🪪  SmartChainAgentID.updateMemory()
          │  reputation++ · memoryRoot updated on-chain
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

**4 verifiable on-chain actions per user interaction:**
`Storage upload` + `ZK proof` + `Agent ID update` + `Revenue event`

---

## Slide 5 · Technology Stack

### ![0G](https://img.shields.io/badge/0G_Full_Stack-0ea5e9?style=flat-square) 0G Protocol — Complete Integration

| 0G Module | How We Use It | Proof |
|---|---|---|
| **0G Chain** | 5 contracts on Galileo Testnet | All addresses verified on ChainScan |
| **0G Compute TeeML** | LLaMA 3.1 8B TEE-attested inference | `X-TEE-Proof` header · `tee_verified: true` |
| **0G Compute Fine-tuning** | Incremental TF training on real tx data | Model hash updated on-chain after each run |
| **0G Storage Log** | Immutable tx receipts via MemData upload | Merkle root in Supabase + committed on-chain |
| **0G Storage KV** | Versioned agent memory cross-device | `hydrateAgentMemory()` syncs on mount |
| **Agent ID Standard** | Soulbound NFT — modelHash + memoryRoot | Non-transferable · updated every optimization |
| **Agent Escrow** | Agent-to-agent micropayment channels | Full UI in Payments → Agent Escrow tab |

### ![Blockchain](https://img.shields.io/badge/Blockchain-363636?style=flat-square&logo=solidity) Smart Contracts

```
SmartChainAgentID       Soulbound NFT · identity · memory · reputation
SmartChainAgentEscrow   Agent-to-agent micropayments · 1% platform fee
SmartChainPayments      Send · stake · withdraw · 5% APY
SmartChainRevenue       Proportional revenue distribution · 10% fee share
SmartChainTransaction   Immutable on-chain transaction records
```

### ![AI](https://img.shields.io/badge/AI_Agent-FF6F00?style=flat-square&logo=tensorflow) AI Layer

```
Runtime:      Python 3.12 · Flask 3.1.3 · Gunicorn
Model:        TensorFlow CPU 2.16 · 6-feature neural network
Architecture: Input(6) → Dense(64) → BatchNorm → Dropout
              → Dense(32) → Dense(16) → Dense(3, sigmoid)
Outputs:      savings_rate · confidence · risk_score
Fine-tuning:  lr=0.0001 · epochs=50 · min_samples=10
```

### ![Frontend](https://img.shields.io/badge/Frontend-000000?style=flat-square&logo=next.js) Frontend

```
Framework:    Next.js 16.2.4 · React 19 · TypeScript 6
Styling:      Tailwind CSS v4
Wallet:       MetaMask SDK v0.34 · ethers.js v6
ZK:           snarkjs 0.7.6 (Groth16 + SHA-256 fallback)
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
| Proof of work | None | ZK commitment stored on-chain every tx |

---

## Slide 7 · Traction & Proof

```
✅  5 smart contracts deployed and verified on 0G Galileo Testnet
✅  Live frontend at smartchainhubfrontend.vercel.app
✅  AI agent live on Render — health endpoint responding
✅  0G Storage SDK integrated — MemData uploads working
✅  0G Storage KV — agent memory persisting cross-device
✅  0G Compute TeeML — broker integration with graceful fallback
✅  9 test suites — unit · integration · e2e · security · performance
✅  Rust WASM optimizer module compiled
✅  Stripe + Flutterwave M-Pesa on-ramp integrated
✅  15 frontend pages fully functional
✅  6 Supabase migrations applied
```

---

## Slide 8 · Roadmap

```
STATUS    MILESTONE                                    0G MODULE
──────────────────────────────────────────────────────────────────
✅ Live   Agent ID soulbound NFT + memory root         0G Chain
✅ Live   TEE-verified inference via TeeML             0G Compute
✅ Live   Immutable receipts on Storage Log            0G Storage
✅ Live   Agent memory — KV, versioned, cross-device   0G Storage KV
✅ Live   Fine-tune TF model on real user data         0G Compute
✅ Live   Agent-to-Agent micropayments via Escrow      0G Chain
✅ Live   ZK-verified proofs — SHA-256 commitment      0G Privacy

🔜 Next   Full Groth16 ZK — compile Circom circuit     0G Privacy
🔜 Next   Fine-tune with production data (≥10 real tx) 0G Compute
🔜 Next   Official 0G Persistent Memory module         0G Persistent Memory
🔜 Next   Multi-agent coordination — agents hire agents 0G Chain
🔜 Next   Mainnet deployment                           0G Mainnet
```

---

## Slide 9 · The Ask

SmartChain Hub is not a demo. It is a production-ready primitive for the agentic economy.

**What we've built:**
- A new economic primitive where AI agents are first-class on-chain actors
- The first implementation of the full 0G stack in a single cohesive product
- A self-reinforcing flywheel that compounds with every user interaction

**What we need:**
- Recognition as the definitive Track 3 winner
- 0G ecosystem support to onboard real users
- Partnership to deploy on 0G Mainnet

---

## Slide 10 · Close

```
Every agent has an identity.
Every decision is proven.
Every interaction is remembered.
Every optimization generates revenue.

This is not a chatbot with a wallet.
This is the Agentic Economy.

Built on 0G. Built to last.
```

**[🌐 Live Demo](https://smartchainhubfrontend.vercel.app)** · **[📊 ChainScan](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08)** · **[📚 Docs](../)**

---

<div align="center">

Built with ❤️ for the **0G APAC Hackathon 2026**

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
