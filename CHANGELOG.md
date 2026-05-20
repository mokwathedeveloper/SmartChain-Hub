<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub Logo" width="90" />

# Changelog

[![Latest](https://img.shields.io/badge/Latest-v2.1.0-10b981?style=for-the-badge)](https://github.com/mokwathedeveloper/SmartChain-Hub)
[![Network](https://img.shields.io/badge/0G_Galileo_Testnet-Chain_16602-0ea5e9?style=for-the-badge&logo=ethereum&logoColor=white)](https://scan-testnet.0g.ai)
[![Track](https://img.shields.io/badge/Track_3-Agentic_Economy-6366f1?style=for-the-badge)](https://0g.ai)

All notable changes to **SmartChain Hub** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

</div>

---

## ![v2.1.0](https://img.shields.io/badge/v2.1.0-10b981?style=flat-square) — 2026-05-20 · UX Polish & Professional Documentation

### ✨ Added
- Demo video section on landing page — responsive Loom iframe embed between "How It Works" and CTA
- Demo mode amber watermark banner on success screen — "Demo Transaction · No real funds moved · No on-chain write"
- Animated processing skeleton during AI inference (1.8s wait feels polished, not jarring)
- Amount input validation — red border + inline error for zero, negative, and >$1M inputs
- "Connect Wallet — Try for Real" primary CTA on demo success screen
- `CONTRIBUTORS.md` — team background, GitHub/X/Telegram profile, responsibilities, timeline, contributing guide
- `CHANGELOG.md` — full version history from first commit to present
- `docs/performance/BENCHMARKS.md` — gas costs, AI latency, storage timing, E2E flow, scalability projections
- Troubleshooting section in `README.md` — 7 common issues with exact fix commands
- Submission links in README footer (CONTRIBUTORS, CHANGELOG, BENCHMARKS)

### 🔄 Changed
- Demo savings replaced fixed `0.015` rate with dynamic `savingsRate = max(0.005, 0.045 - congestion × 0.03)` formula
- Demo congestion now random 15–70% per run — affects fees, confidence, risk, and explanation text
- Demo risk set to "Medium" when congestion > 55%, "Low" otherwise
- Success screen copy differs: demo says "Simulated AI optimization" vs real says "permanently recorded on 0G"
- Pitch video and demo video previously had tab switcher — simplified to demo-only embed

---

## ![v2.0.0](https://img.shields.io/badge/v2.0.0-6366f1?style=flat-square) — 2026-05-18 · Track 3 Alignment + 0G Compute TeeML

### ✨ Added
- Track 3 (Agentic Economy & Autonomous Applications) — confirmed track alignment across all submission materials
- Mermaid flowchart architecture diagram in README
- Browser-side keepalive ping every 4 minutes to prevent Render free-tier cold starts
- Rate limiting on AI agent: 30 req/min on `/optimize`, 5 req/hr on `/fine-tune` (flask-limiter)
- Bearer token support on `/fine-tune` for authenticated Supabase session validation
- Sitemap generation via `getServerSideProps` for production SEO
- `robots.txt` for search engine crawling
- Hackathon submission docs: pitch deck slides, demo scripts, QA test cases

### 🔄 Changed
- Landing page stats updated to honest projections — labeled "at scale" / "estimated at capacity"
- Demo CTA moved to primary hero position — "Try Demo — No Wallet Needed" above "Launch App"
- Layout component updated with consistent navigation and Web3 context
- CORS policy hardened — explicit origin allowlist replacing bare `CORS(app)`
- AI agent fallback logic refined — graceful degradation from TeeML to local TF model

### 🐛 Fixed
- `triggerFineTune` access token passing for valid Supabase session
- Supabase session validation before processing fine-tune requests

---

## ![v1.6.0](https://img.shields.io/badge/v1.6.0-f59e0b?style=flat-square) — 2026-04-26 · AgentEscrow Deployment + QA Milestone

### ✨ Added
- `SmartChainAgentEscrow` deployed to 0G Galileo Testnet at `0x0A3951414c4097AF78953a97e49ad38293e9eA17`
- Render deployment guide with exact copy-paste environment variable values
- Full QA test report — 245 tests across 12 testing types, 15 bugs found and fixed

---

## ![v1.5.0](https://img.shields.io/badge/v1.5.0-f59e0b?style=flat-square) — 2026-04-25 · Data Integrity + Security Hardening

### ✨ Added
- Comprehensive `.gitignore` — env files, secrets, compiled models, Rust artifacts, ZK circuits

### 🔄 Changed
- README fully rewritten — accurate architecture with all 5 contracts, honest roadmap
- All dashboard stats replaced with real Supabase data — real bar chart, real percentages, real route table (no fake/hardcoded numbers)

### 🐛 Fixed
- `mintAgentID` guarded with A0GI balance check before calling contract
- Fine-tune 403 resolved — server-to-server calls exempt from CSRF middleware
- Debug `console.log` leaking wallet state removed
- Tx hash no longer uses `Math.random()` — computed from real route data
- `avgConf` calculated from real route timings, not hardcoded `+8.3%`
- `BigInt(0)` replaces `0n` literal for ES2019 compatibility
- Read/write contracts split — direct RPC for reads, signer-guarded for writes — resolves "Node cannot be found" error
- Sequential Supabase queries to prevent HTTP2 stream exhaustion
- Placeholder Stripe keys rejected with 503
- CSRF bypass strengthened for server-to-server fine-tune calls
- `triggerFineTune` route corrected to `/api/fine-tune` (Next.js route)
- Supabase migration 004 added — missing profile columns + complete RLS policies

---

## ![v1.4.0](https://img.shields.io/badge/v1.4.0-0ea5e9?style=flat-square) — 2026-04-24 · ZK Proofs + Agent Escrow + Fine-Tuning Pipeline

### ✨ Added
- `SmartChainAgentEscrow.sol` — agent-to-agent micropayment channels with `deposit → payPerCall → withdraw` (1% platform fee)
- `POST /api/zk-proof` — Groth16 ZK proof generation with SHA-256 commitment fallback; validates savings > 0, fee < 5%, rate < 10%
- `zkProof.ts` client utility for ZK proof generation
- ZK commitment badge (purple) in transaction result and success UI
- Full fine-tuning pipeline — reads real tx receipts from 0G Storage by Merkle root hash, converts to 6-feature vectors, incrementally trains TF model at `lr=0.0001`
- `POST /fine-tune` endpoint on AI agent — delegates to `fine_tuner.py` without code duplication
- `/api/fine-tune` Next.js API route with Supabase session guard
- `agentEscrow.ts` — frontend utility for AgentEscrow contract interactions
- Agent Escrow tab on Payments page — deposit, claim per call, withdraw, channel state display
- `hydrateAgentMemory()` — on-mount sync from 0G Storage KV; cross-device memory restoration
- 0G KV upgraded as source of truth — versioned writes prevent stale overwrites
- `/api/agent-memory` GET route added alongside existing POST (read + write from KV)
- `snarkjs` dependency for Groth16 ZK proofs
- Full implementation audit document

### 🔄 Changed
- `agentMemory.ts` upgraded — 0G KV as authoritative source, localStorage as cache
- `optimizeTransaction` and `getAgentHealth` refactored to use direct fetch calls
- ZK proof savings rate limit raised from 2% to 5% to avoid rejecting valid boundary cases
- ZK proof and `hydrateAgentMemory` wired into full transaction confirm flow

### 🐛 Fixed
- `app.py` `if __name__ == '__main__'` block restored after accidental removal

---

## ![v1.3.0](https://img.shields.io/badge/v1.3.0-ef4444?style=flat-square) — 2026-04-22 · Security Overhaul + TOTP 2FA + UI Polish

### ✨ Added
- OWASP Top 10 security mitigations — rate limiting, CSRF protection, input sanitisation, SSRF prevention
- Secure API client with SSRF protection and CSRF token handling
- Secure Flask server with rate limiting and input validation
- Secure logger with input sanitisation to prevent log injection (CWE-117)
- CSRF middleware and token endpoint wired into Express backend
- Full TOTP 2FA — QR code enrollment, 6-digit verify, unenroll with code confirmation on profile page
- Password change modal with strength meter
- Avatar upload with real photo shown in navbar
- Buy A0GI interface in wallet connect flow
- AgentIDCard redesigned — premium dark glassmorphism UI, zero colour clashing
- Security dependencies added across all 4 layers (frontend, backend, AI agent, blockchain)
- `SECURITY_FIXES.md` — full OWASP remediation documentation
- Codebase index, code quality analysis, comprehensive real-world sector applicability docs

### 🔄 Changed
- Landing page "How It Works" steps redesigned — clean dark cards, connector line removed
- Tailwind CSS upgraded v3 → v4 to match `@tailwindcss/postcss@4`
- `SmartChainRevenue` rewritten — proportional staker distribution with staker registry
- All `console.log` replaced with secure logger in Web3Context and components
- All `alert()` calls replaced with `addNotification` toast system

### 🐛 Fixed
- CWE-918 SSRF — URL reconstructed from validated components in `AIOptimizationWidget`
- CWE-117 log injection — `sanitizeForLog` applied to all log output
- Hardcoded `[REDACTED]` literals replaced with env-driven constants
- `AgentIDCard` always renders — connect prompt, loading, mint, and agent states all handled
- Navbar avatar loads from `profiles.avatar_url` (real uploaded photo)
- CSRF bypass for server-to-server calls fixed

---

## ![v1.2.0](https://img.shields.io/badge/v1.2.0-6366f1?style=flat-square) — 2026-04-21 · Production Deployment + Dark Theme Complete

### ✨ Added
- AI agent production deployment live on Render (`smartchain-hub.onrender.com`)
- `render.yaml` for Flask AI agent on Render.com
- `railway.toml`, `fly.toml` deployment configs for Railway and Fly.io alternatives
- Automated deployment script (`deploy.sh`) supporting Render, Railway, Fly.io, Docker
- `update-env.sh` for updating production AI agent URL across all `.env` files
- Full dark onramp page — Stripe card + M-Pesa with quick-amount buttons and status feedback
- Wallet connect modal — MetaMask connect + manual address input options
- History page dark badges + 0G Storage links wired
- `recordTransactionOnChain` wired into transaction confirm flow
- Payments page: modal prompt on all write actions
- Root `vercel.json` added to fix GitHub auto-deploy root directory issue
- `vercel.json` API function timeouts configured
- Verified deployment status report (`DEPLOYMENT_STATUS.md`)
- Node.js backend restored and enhanced with full 0G integration
- Production environment configuration template

### 🔄 Changed
- AI agent server binding updated to production host (`0.0.0.0`)
- TF model pre-trained during Docker build for faster cold starts
- Architecture docs updated to reflect Node.js backend re-integration

### 🐛 Fixed
- All remaining light theme classes across dashboard, profile, transactions, revenue, components
- Dashboard X-axis dates, TEE badge dark, all component dark theme
- `Connect Wallet` button — supports Galileo 16602, auto-reconnects, no-wallet toast
- `console.log` replaced with `console.info` across all components

---

## ![v1.1.0](https://img.shields.io/badge/v1.1.0-0ea5e9?style=flat-square) — 2026-04-20 · Agent Identity + 0G Storage SDK + Dark Theme

### ✨ Added
- `SmartChainAgentID.sol` soulbound NFT — stores `memoryRoot`, `modelHash`, `reputation` on 0G Chain; non-transferable (`transfer()` always reverts); NatSpec documented
- `agentId.ts` — frontend utility for `mintAgentID()`, `updateAgentMemory()`, `hasAgentID()`
- `AgentIDCard` component — soulbound identity display with mint button, reputation, memory root, model hash, TEE badge
- `/api/storage-upload` — server-side 0G Storage Log upload via `@0glabs/0g-ts-sdk` MemData; returns Merkle root + storageScanUrl
- `/api/agent-memory` POST — server-side 0G Storage KV write via `KvClient` Batcher
- `storage.ts` rewritten as client wrapper delegating to `/api/storage-upload`
- `agentMemory.ts` — dual-write to 0G KV + localStorage; versioned writes
- `ErrorBoundary` component for production-grade error handling; wraps entire app
- `NotificationContext` — app-wide toast notification system
- `supabase_migration_001.sql` — INSERT policies + `storage_root` column
- `supabase_migration_002.sql` — safe column additions only
- `render.yaml` for Render deployment; `vercel.json` with API timeouts
- Webpack fallbacks + Turbopack config for Vercel deployment compatibility
- SETUP.md step-by-step configuration guide
- Live Vercel deployment URL added to README
- `docs/audit/`, `docs/security/` folder structure established
- `SmartChainRevenue.sol` and `SmartChainTransaction.sol` NatSpec documentation added
- `AgentIDCard` wired into Dashboard

### 🔄 Changed
- `transactions.tsx` confirm flow wired: ZK proof → 0G Storage upload → Supabase insert → agent memory update → on-chain Agent ID update
- `SmartChainAgentID` added to deploy script and standalone deploy script
- Galileo testnet chainId corrected to `16602`
- AI agent: 0G broker pattern, `debug=False`, `.env` loaded via `dotenv`
- All `alert()` replaced with `addNotification` toast (payments, revenue, Web3Context, components)
- All `console.log` replaced with `console.info`
- Hardcoded `localhost` replaced with `NEXT_PUBLIC_AI_AGENT_URL`
- All pages and components renamed from PayOptimize → SmartChain Hub
- App wrapped with `NotificationProvider`

### 🐛 Fixed
- CORS — explicit origin allowlist replacing bare `CORS(app)` on Flask server
- `ethers` pinned to `6.13.1` for 0G SDK compatibility
- Environment credentials removed from git tracking; added to `.gitignore`

---

## ![v1.0.1](https://img.shields.io/badge/v1.0.1-0ea5e9?style=flat-square) — 2026-04-17 · AI Model Upgrade + Responsiveness Fixes

### ✨ Added
- AI model upgraded to 6 features: `amount_norm`, `priority_one_hot[3]`, `congestion`, `time_of_day`
- 900 training samples — real confidence, risk, and congestion output heads
- Training data generator + retrain script
- `estimated_time_s` field in optimizer response; displayed in transaction UI
- 59 blockchain + AI agent + frontend tests passing
- QA report: 111 tests (functional, integration, exploratory)
- QA report: 190 tests across all 12 testing types

### 🐛 Fixed
- AI optimizer: correct fee / savings / time calculation
- Dashboard: mock data removed — real confirmed transactions only; nodescore from real data
- User avatar + Dashboard link shown correctly on public pages when logged in
- Responsiveness: `overflow-x-auto` on all tables, responsive grids, mobile layout fixed across all pages

---

## ![v1.0.0](https://img.shields.io/badge/v1.0.0-0ea5e9?style=flat-square) — 2026-04-16 · Initial Release

### ✨ Added

**Frontend — Next.js 16 + React 19 + TypeScript**
- 16 pages: `dashboard`, `transactions`, `revenue`, `payments`, `profile`, `history`, `console`, `documentation`, `blog`, `about`, `onramp`, `contact`, `features`, `login`, `signup`, `404`
- `dashboard.tsx` — Agent ID card, live stats, activity feed, savings chart, CSV export
- `transactions.tsx` — full optimize → confirm flow with demo mode; Optimize / Analyze / Simulate tabs
- `revenue.tsx` — DonutChart revenue share, claim flow, staker table
- `payments.tsx` — Send / Stake / Withdraw tabs
- `profile.tsx` — user details, avatar, edit, stats
- Global dark theme, Tailwind CSS v4, Jakarta font, animations
- `useAuth` hook — session persistence across navigation
- `Web3Context` — MetaMask wallet connection, signer management, network switching
- `Header` — navigation, avatar, auth state, wallet badge
- `Sidebar` — responsive with mobile drawer
- `Footer` — 4-column layout with Blog / Contact / GitHub
- `AgentIDCard`, `AIDecisionTree`, `AIDecisionFeed`, `AIOptimizationWidget`
- `OptimizationAnalytics`, `RevenueSharingWidget`, `BlockchainTransactionsWidget`
- `TransactionList`, `StatCard`, `LoadingSkeleton`, `EmptyState`, `Tooltip`, `OnChainBadge`
- `FeaturesSection`, `HeroSection`, `ProfileSection`
- Jest + React Testing Library setup with unit tests for Header and TransactionOptimizer
- `@0glabs/0g-ts-sdk` dependency added

**AI Agent — Flask + TensorFlow 2.16**
- `POST /optimize` — route optimization with TEE-verified LLaMA 3.1 8B via 0G Compute broker; fallback to local TF model
- `GET /health` — broker + model health status
- `SavingsModel` — TensorFlow neural network with 3 output heads
- `TransactionOptimizer` — route selection with priority (efficiency / speed / security)
- `ZeroGStorageService` — 0G SDK integration for metadata storage
- Dockerfile + Docker Compose for containerised deployment
- TF model pre-trained during Docker build
- AI agent `.env.example` with 0G Compute broker config

**Smart Contracts — Solidity 0.8.20 + Hardhat**
- `SmartChainTransaction.sol` — immutable on-chain transaction records; `nonReentrant` on all write functions
- `SmartChainRevenue.sol` — proportional revenue distribution to stakers; `nonReentrant`; NatSpec docs
- `SmartChainPayments.sol` — `sendFunds()` (0.5% fee), `stake()` (5% APY = 500 BPS), `withdraw()`
- `SmartChainAgentEscrow.sol` — micropayment channels with 1% platform fee
- Hardhat config for 0G Newton Testnet + Galileo Testnet (Chain ID 16602)
- Deploy scripts for all contracts including contract address export
- Rust WASM optimizer module (`Cargo.toml`, Rust source)
- Contract tests for SmartChainTransaction and SmartChainRevenue

**Database — Supabase PostgreSQL**
- `supabase_schema.sql` — `profiles`, `transactions`, `revenue_shares` tables
- Row Level Security enabled on all tables
- `supabase_migration_001–003.sql` — INSERT policies, `storage_root` column, indexes

**Backend — Node.js + Express**
- `transactionController.js` — optimize, retrieve, create endpoints
- `aiService.js` — AI agent proxy with error handling
- `blockchainService.js` — smart contract interactions via ethers.js
- CORS, JSON parsing, security middleware

**Documentation**
- `README.md` — project overview, architecture, tech stack, quick start, environment variables
- `TECH_STACK.md` — 300-line full technical reference
- `docs/` structure: mockups (12 images), demo scripts, QA plan, roadmap, user journeys
- Full roadmap with 0G module mapping
- Hackathon submission document
- 12 UI mockups in `docs/mockups/`
- MIT License; `.env.example` for all 4 layers
- `add root .gitignore` — excludes `.env*`, `node_modules`, `__pycache__`, build artifacts

---

## Deployed Contracts — Stable Across All Versions

> All 5 contracts first deployed Apr 16–26, 2026. Addresses unchanged since deployment.

| Contract | Address | Explorer |
|---|---|---|
| ![AgentID](https://img.shields.io/badge/🤖_AgentID-0ea5e9?style=flat-square) | `0x69C619374c6B901b99941Df7238fceb80d7DCd08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08) |
| ![Escrow](https://img.shields.io/badge/🔒_Escrow-6366f1?style=flat-square) | `0x0A3951414c4097AF78953a97e49ad38293e9eA17` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x0A3951414c4097AF78953a97e49ad38293e9eA17) |
| ![Payments](https://img.shields.io/badge/💸_Payments-10b981?style=flat-square) | `0x540aFf6B167F8B5889d852d124C545F5f876A7eB` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x540aFf6B167F8B5889d852d124C545F5f876A7eB) |
| ![Revenue](https://img.shields.io/badge/📊_Revenue-f59e0b?style=flat-square) | `0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08) |
| ![Transaction](https://img.shields.io/badge/📝_Transaction-ef4444?style=flat-square) | `0xf95A1610be22046c334E3bD1b11D2B88519E6C52` | [ChainScan ↗](https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52) |

**Network:** 0G Galileo Testnet · Chain ID `16602` · RPC `https://evmrpc-testnet.0g.ai`

---

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-SmartChain--Hub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mokwathedeveloper/SmartChain-Hub)
[![ChainScan](https://img.shields.io/badge/Contracts-Verified_on_ChainScan-0ea5e9?style=for-the-badge&logo=ethereum&logoColor=white)](https://scan-testnet.0g.ai)

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
