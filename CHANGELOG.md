<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub Logo" width="80" />

# Changelog

[![Latest](https://img.shields.io/badge/Latest-v2.1.0-10b981?style=flat-square)](https://github.com/mokwathedeveloper/SmartChain-Hub)
[![Network](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=flat-square&logo=ethereum&logoColor=white)](https://scan-testnet.0g.ai)
[![Track](https://img.shields.io/badge/Track_2-Agentic_Trading_Arena-6366f1?style=flat-square)](https://0g.ai)

All notable changes to **SmartChain Hub** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

</div>

---

## ![v2.1.0](https://img.shields.io/badge/v2.1.0-10b981?style=flat-square) — 2026-05-20 · UX Polish & Documentation

### ✨ Added
- Demo video embedded on landing page — responsive Loom iframe between "How It Works" and CTA section
- Demo mode watermark — amber "Demo Transaction · No real funds moved" banner on success screen
- Processing skeleton — animated pulse skeleton during AI inference (1.8s wait feels polished, not jarring)
- Amount input validation — red border + inline error for zero, negative, and >$1M inputs
- "Connect Wallet — Try for Real" CTA on demo success screen
- Variable congestion in demo mode — random 15–70% congestion affects fees, savings (0.5–4.5%), risk, and explanation text
- CONTRIBUTORS.md — team background, timeline, contribution guide
- CHANGELOG.md — full version history

### Changed
- Demo savings calculation replaced fixed 0.015 rate with dynamic `savingsRate = max(0.005, 0.045 - congestion * 0.03)` formula
- Demo confidence per route: efficiency 94%, speed 91%, balanced 96%, security 99%
- Demo risk dynamically set to "Medium" when congestion > 55%
- Success screen description differs for demo vs real transaction

---

## ![v2.0.0](https://img.shields.io/badge/v2.0.0-6366f1?style=flat-square) — 2026-05-18 · 0G Compute TeeML + Full Stack Hardening

### ✨ Added
- Track 2 pivot — repositioned as Agentic Trading Arena (Verifiable Finance)
- Mermaid architecture diagram in README
- Browser-side keepalive ping every 4 minutes to prevent Render free tier cold starts
- Rate limiting on AI agent: 30 req/min on `/optimize`, 5 req/hr on `/fine-tune` (flask-limiter)
- Bearer token support on `/fine-tune` for authenticated session validation
- 0G Compute TeeML integration — LLaMA 3.1 8B via broker.0g.ai with `X-TEE-Proof` response header
- TEE verification badge (blue) on optimization result card
- ZK commitment proof badge (purple) with SHA-256 anchoring
- 0G Storage receipt badge (green) with Merkle root link to ChainScan
- `hydrateAgentMemory()` — on mount sync from 0G Storage KV, cross-device memory restoration
- Sitemap generation via `getServerSideProps` for SEO
- `robots.txt` for search engine indexing
- 9 AI agent test suites: unit, integration, e2e, performance, security, functional, exploratory, API, regression
- Hardhat contract test suite (4 files)
- Supabase migrations 004–006: storage_root column, agent_memory table, RLS policies
- DEPLOYMENT_STATUS.md — live service URLs + health check commands
- SUBMISSION_CHECKLIST.md — 287-line self-assessment against all 5 judging criteria
- IMPLEMENTATION_AUDIT.md — feature status by component
- REAL_WORLD_APPLICABILITY.md — 4 market sectors with size + comparable companies
- SECURITY_FIXES.md — OWASP Top 10 mitigations documented
- SECRETS_GUIDE.md — environment variable rotation procedures

### Changed
- Landing page stats updated to honest projections (labeled "at scale" / "estimated at capacity")
- Demo CTA moved to primary position — "Try Demo — No Wallet Needed" above "Launch App"
- Layout component updated for consistent navigation + Web3 context
- AI agent fallback logic improved — gracefully degrades from TeeML to local TF model

### Fixed
- `triggerFineTune` access token passing for valid Supabase session
- Transaction page state reset on wallet disconnect
- Agent memory versioning — prevents stale overwrites on concurrent writes

---

## ![v1.5.0](https://img.shields.io/badge/v1.5.0-f59e0b?style=flat-square) — 2026-05-01 · Payments, Revenue & On-Ramp

### ✨ Added
- SmartChainAgentEscrow contract — agent-to-agent micropayment channels (`deposit → payPerCall → withdraw`)
- 1% platform fee on escrow withdrawals
- Agent Escrow tab in Payments page UI
- Stripe on-ramp integration — card-to-crypto for SE Asia, Latin America, EU
- Flutterwave M-Pesa on-ramp — East Africa mobile money integration
- `payments.tsx` — Send / Stake / Agent Escrow tabs
- Revenue sharing UI — DonutChart, claim button, staker table
- `revenue.tsx` — live staking balance, APY display, claim flow
- Incremental TF model fine-tuning — `POST /fine-tune` fetches tx receipts by Merkle root from 0G Storage
- `fine_tuner.py` — 6-feature vector conversion, `lr=0.0001` to prevent catastrophic forgetting
- Minimum 10 samples enforced before training
- 12 UI mockups in `docs/mockups/`
- Demo scripts and pitch deck in `docs/demo/`

### Changed
- Dashboard layout redesigned — Agent ID card prominent in hero position
- Transaction optimizer form — priority selector (efficiency / speed / security) with descriptions

---

## ![v1.0.0](https://img.shields.io/badge/v1.0.0-0ea5e9?style=flat-square) — 2026-04-16 · Initial Release

### ✨ Added
- Project initialized — Next.js 16 + React 19 + TypeScript frontend
- Supabase auth — email/password signup + login with session management
- `useAuth` hook — session persistence across page navigation
- `Web3Context` — MetaMask wallet connection, signer management
- 5 Solidity contracts deployed to 0G Galileo Testnet (Chain ID 16602):
  - `SmartChainAgentID` — soulbound NFT, `mintAgentID()`, `updateMemory()`, non-transferable
  - `SmartChainTransaction` — immutable on-chain transaction records
  - `SmartChainPayments` — send funds (0.5% fee), stake (5% APY), withdraw
  - `SmartChainRevenue` — proportional revenue distribution to stakers
  - `SmartChainAgentEscrow` — micropayment channels between agents
- Flask AI agent server — `POST /optimize`, `GET /health`
- 6-feature TensorFlow 2.16 neural network: `amount_norm`, `priority_one_hot[3]`, `congestion`, `time_of_day`
- 3 output heads: `savings_rate`, `confidence`, `risk_score`
- `@0glabs/0g-ts-sdk` — 0G Storage Log upload via MemData
- 0G Storage KV — agent memory persistence with versioned writes
- `/api/storage-upload` — Merkle root upload + storageScanUrl
- `/api/agent-memory` — KvClient read/write with Batcher
- `/api/zk-proof` — SHA-256 commitment generation and validation
- `AgentIDCard.tsx` — live soulbound identity display
- `AIDecisionTree.tsx` + `AIDecisionFeed.tsx` — real-time optimization visualization
- `RevenueSharingWidget.tsx` — staking earnings display
- `OptimizationAnalytics.tsx` — savings charts
- 16 pages: dashboard, transactions, revenue, payments, profile, history, console, documentation, blog, about, onramp, contact, features, login, signup, 404
- `dashboard.tsx` — Agent ID card, live stats, activity feed, savings chart
- `transactions.tsx` — full optimize → confirm → on-chain flow with demo mode
- Hardhat deploy scripts for all 5 contracts
- Rust WASM optimizer module for route calculation
- Supabase migrations 001–003: profiles, transactions, revenue_shares tables + indexes
- `docs/` structure — 30+ markdown files covering architecture, security, setup, QA, demo
- MIT License
- `.env.example` files for all 4 layers (frontend, AI agent, blockchain, backend)

---

## Deployed Contracts — Stable Across All Versions

> All 5 contracts deployed on Apr 16, 2026. Addresses unchanged across all versions.

| Contract | Address | Explorer |
|---|---|---|
| ![AgentID](https://img.shields.io/badge/🤖_SmartChainAgentID-0ea5e9?style=flat-square) | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) |
| ![Escrow](https://img.shields.io/badge/🔒_AgentEscrow-6366f1?style=flat-square) | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) |
| ![Payments](https://img.shields.io/badge/💸_SmartChainPayments-10b981?style=flat-square) | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| ![Revenue](https://img.shields.io/badge/📊_SmartChainRevenue-f59e0b?style=flat-square) | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) |
| ![Transaction](https://img.shields.io/badge/📝_SmartChainTransaction-ef4444?style=flat-square) | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) |

**Network:** 0G Galileo Testnet · Chain ID `16602` · RPC `https://evmrpc-testnet.0g.ai`

---

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-SmartChain--Hub-181717?style=for-the-badge&logo=github)](https://github.com/mokwathedeveloper/SmartChain-Hub)

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
