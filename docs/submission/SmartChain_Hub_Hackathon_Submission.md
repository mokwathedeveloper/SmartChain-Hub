<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🏆 SmartChain Hub — Hackathon Submission
### 0G APAC Hackathon 2026 · Track 3: Agentic Economy & Autonomous Applications

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-10b981?style=for-the-badge)](https://0g.ai)

</div>

---

## 1 · Project Name

**SmartChain Hub**

---

## 2 · One-Line Description

> The first sovereign AI agent economy on 0G — every user owns an agent with soulbound on-chain identity, persistent cross-device memory, TEE-verified intelligence, and autonomous revenue generation.

---

## 3 · Track

**Track 3 — Agentic Economy & Autonomous Applications**

---

## 4 · Problem Statement

Three fundamental problems block the agentic economy from existing:

| Problem | Current Reality | Impact |
|---|---|---|
| No sovereign agent identity | AI agents are API keys — copyable, revocable, platform-owned | Agents cannot be trusted economic actors |
| No persistent agent memory | Memory lives in sessions or centralized DBs — lost on device switch | Agents cannot learn across interactions |
| No verifiable AI inference | AI decisions are black boxes — no cryptographic proof of correctness | Agents cannot be trusted to act autonomously |

---

## 5 · Solution

SmartChain Hub introduces three on-chain primitives that solve all three problems simultaneously:

```
Soulbound Agent ID (0G Chain)
  → SmartChainAgentID.sol — non-transferable NFT per wallet
  → Stores: modelHash · memoryRoot · reputation · totalSavings

Persistent Cross-Device Memory (0G Storage KV)
  → Versioned KV writes via @0glabs/0g-ts-sdk Batcher
  → hydrateAgentMemory() syncs on every app mount
  → Survives: device resets · browser clears · app updates

TEE-Verified Intelligence (0G Compute TeeML)
  → LLaMA 3.1 8B inference via broker.0g.ai
  → X-TEE-Proof header proves inference ran inside TEE
  → Falls back to TF 2.16 local model gracefully
```

---

## 6 · Sectors

- **AI / Agentic Economy** — sovereign agent identity + memory + inference
- **DeFi** — transaction fee optimization, staking, revenue distribution
- **Infrastructure** — agent-to-agent micropayment rails
- **Emerging Markets** — M-Pesa + Stripe on-ramp for A0GI

---

## 7 · Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow_2.16-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

---

## 8 · 0G Components Used

| 0G Module | Integration | File |
|---|---|---|
| **0G Chain** | 5 contracts on Galileo Testnet (Chain ID 16602) | `blockchain/contracts/` |
| **0G Compute TeeML** | LLaMA 3.1 8B via broker.0g.ai — X-TEE-Proof header | `ai-agent/server/app.py` |
| **0G Compute Fine-tuning** | Incremental TF training on real tx data from 0G Storage | `ai-agent/scripts/fine_tuner.py` |
| **0G Storage Log** | MemData upload → Merkle rootHash via @0glabs/0g-ts-sdk | `src/pages/api/storage-upload.ts` |
| **0G Storage KV** | Versioned agent memory — KvClient + Batcher | `src/pages/api/agent-memory.ts` |
| **Agent ID Standard** | Soulbound NFT — modelHash + memoryRoot + reputation | `SmartChainAgentID.sol` |
| **Agent Escrow** | Agent-to-agent micropayments — deposit → payPerCall → withdraw | `SmartChainAgentEscrow.sol` |

---

## 9 · Live Demo

**[https://smartchainhubfrontend.vercel.app](https://smartchainhubfrontend.vercel.app)**

---

## 10 · Deployed Contracts — 0G Galileo Testnet (Chain ID 16602)

| Contract | Address | Explorer |
|---|---|---|
| SmartChainAgentID | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) |
| SmartChainAgentEscrow | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) |
| SmartChainPayments | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| SmartChainRevenue | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) |
| SmartChainTransaction | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) |

---

## 11 · Demo Video

- [ ] **Link:** `[INSERT YOUTUBE OR LOOM LINK]` ← **ACTION REQUIRED before submission**

Script: [`docs/demo/DEMO_SCRIPT.md`](../demo/DEMO_SCRIPT.md)

---

## 12 · X (Twitter) Post

- [ ] **Link:** `[INSERT X POST LINK]` ← **ACTION REQUIRED before submission**

Template: [`docs/submission/SUBMISSION_CHECKLIST.md`](SUBMISSION_CHECKLIST.md)

---

## 13 · GitHub Repository

- [ ] **Link:** `[INSERT PUBLIC GITHUB REPO LINK]` ← **Make repo public before submission**

---

## 14 · What Was Built During the Hackathon

```
✅ 5 smart contracts deployed on 0G Galileo Testnet
✅ SmartChainAgentID — soulbound NFT with modelHash + memoryRoot + reputation
✅ SmartChainAgentEscrow — agent-to-agent micropayment channels (1% platform fee)
✅ SmartChainPayments — send/stake/withdraw with 5% APY and 0.5% fee
✅ SmartChainRevenue — proportional revenue distribution (10% fee share)
✅ SmartChainTransaction — immutable on-chain transaction records

✅ AI Agent (Flask + TensorFlow 2.16 + 0G Compute TeeML)
   6-feature neural network: savings_rate · confidence · risk_score
   0G Compute TeeML broker integration with graceful TF fallback
   Incremental fine-tuning on real user data from 0G Storage

✅ Frontend (Next.js 16 + React 19 + TypeScript 6)
   16 pages · 17 components · 9 API routes
   AgentIDCard with TEE + ZK badges
   Stripe + Flutterwave M-Pesa on-ramp

✅ 0G Storage Log — immutable tx receipts via @0glabs/0g-ts-sdk MemData
✅ 0G Storage KV — versioned agent memory with cross-device sync
✅ ZK Proofs — snarkjs Groth16 + SHA-256 commitment fallback
✅ 245 automated tests — 100% pass rate
✅ Rust WASM optimizer module compiled
```

---

## 15 · The Economic Flywheel

Every optimization generates **4 verifiable on-chain actions:**

```
User optimizes transaction
  → [1] 0G Storage Log upload      → Merkle rootHash
  → [2] ZK proof generated         → SHA-256 commitment
  → [3] AgentID.updateMemory()     → reputation++ on-chain
  → [4] Revenue event              → 0.5% fee distributed to stakers
```

---

## 16 · Tester Wallet (Verified Live Transactions)

| Field | Value |
|---|---|
| Address | `0x604cDbDBE7850bAd105C28bFE01Ad680520D451F` |
| Network | 0G Galileo Testnet (Chain ID 16602) |
| Verified actions | Send · Stake · Revenue distribution · Agent Escrow open/claim/withdraw |

---

## 17 · Fundraising Status

Not currently fundraising. Built as a hackathon submission demonstrating the full 0G agentic economy stack.

---

<div align="center">

**SmartChain Hub** · 0G APAC Hackathon 2026 · Track 3

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
