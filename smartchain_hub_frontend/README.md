<div align="center">

# 🌐 SmartChain Hub — Frontend
### *Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS v4*

[![Live](https://img.shields.io/badge/🌐_Live-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://vercel.com)

</div>

---

## Quick Start

```bash
cd smartchain_hub_frontend
cp .env.local.example .env.local   # fill in keys
npm install
npm run dev                         # → http://localhost:3000
```

---

## Page Map

```
/                   Landing — hero · features · CTA
/dashboard          AgentIDCard · fine-tune · stats · activity feed
/transactions       Optimize / Analyze / Simulate tabs
/revenue            Revenue sharing · claim earnings
/payments           Send / Stake / Agent Escrow tabs
/profile            Agent identity · memory root display
/history            Full transaction history
/console            Developer console · raw API calls
/onramp             Stripe + Flutterwave M-Pesa fiat on-ramp
/documentation      Full API + contract docs
/blog               Protocol updates
/about              Team + mission
/features           Full feature breakdown
/contact            Support
/login              Supabase auth
/signup             New account
```

---

## Key Components

```
AgentIDCard.tsx              Soulbound identity — mint · refresh · reset
AIDecisionTree.tsx           Real-time optimization visualization
AIDecisionFeed.tsx           Live inference event stream
AIOptimizationWidget.tsx     Optimization input + result display
OptimizationAnalytics.tsx    Savings charts + performance metrics
RevenueSharingWidget.tsx     Staking + earnings UI
BlockchainTransactionsWidget On-chain tx feed
TransactionList.tsx          Transaction history table
ProfileSection.tsx           User profile + agent stats
```

---

## API Routes (Next.js Serverless)

```
POST /api/storage-upload    0G Storage Log — MemData upload → Merkle root
GET  /api/agent-memory      0G Storage KV — read agent memory
POST /api/agent-memory      0G Storage KV — write agent memory
POST /api/zk-proof          Groth16 / SHA-256 ZK proof generation
```

---

## Core Utilities

```
utils/agentId.ts        SmartChainAgentID contract interactions
utils/agentMemory.ts    KV + localStorage dual-write memory layer
utils/agentEscrow.ts    SmartChainAgentEscrow contract interactions
utils/blockchain.ts     SmartChainTransaction contract interactions
utils/storage.ts        0G Storage client wrapper (singleton)
utils/zkProof.ts        ZK proof client — calls /api/zk-proof
utils/supabase.ts       Supabase client singleton
utils/api.ts            AI agent proxy with SSRF protection
utils/secureApi.ts      Allowlist-validated outbound HTTP
utils/secureLogger.ts   Log injection prevention
utils/chains.ts         0G network config (Galileo · Newton · Mainnet)
```

---

## 0G Integration Points

```
Component / Util              0G Module           What It Does
──────────────────────────────────────────────────────────────────
/api/storage-upload.ts        0G Storage Log      MemData upload → rootHash
/api/agent-memory.ts          0G Storage KV       Batcher write + KvClient read
/api/zk-proof.ts              0G Privacy          Groth16 / SHA-256 commitment
utils/agentId.ts              0G Chain            mintAgentID · updateMemory
utils/agentEscrow.ts          0G Chain            deposit · payPerCall · withdraw
utils/blockchain.ts           0G Chain            recordTransaction
context/Web3Context.tsx       0G Chain            MetaMask SDK · chain switching
```

---

## Memory Architecture

```
Write path:
  saveAgentMemory(memory)
        │
        ├── localStorage.setItem()     (instant, device-local)
        └── POST /api/agent-memory     (0G Storage KV, durable)
              └── Batcher.exec(signer)

Read path (on mount):
  hydrateAgentMemory(userId)
        │
        ├── GET /api/agent-memory?userId=...
        │     └── KvClient.getValue(STREAM_ID, key)
        │
        └── version comparison
              remote.version > local.version?
                YES → update localStorage cache
                NO  → keep local (already newest)
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=        # SmartChainTransaction
NEXT_PUBLIC_PAYMENTS_CONTRACT=       # SmartChainPayments
NEXT_PUBLIC_AGENT_ID_CONTRACT=       # SmartChainAgentID
NEXT_PUBLIC_AGENT_ESCROW_CONTRACT=   # SmartChainAgentEscrow
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=     # 0G Storage wallet (client)
STORAGE_PRIVATE_KEY=                 # 0G Storage wallet (server)
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:5000
```

---

## Scripts

```bash
npm run dev          # development server → localhost:3000
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm test             # Jest + React Testing Library
npm run test:watch   # watch mode
npm run test:coverage # coverage report
```

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.2.4` | SSR framework + API routes |
| `react` | `^19.0.0` | UI component tree |
| `typescript` | `6.0.3` | Full type safety |
| `tailwindcss` | `^4.2.4` | Utility-first styling |
| `ethers` | `^6.13.0` | Contract interactions |
| `@metamask/sdk` | `^0.34.0` | Wallet connection |
| `@0glabs/0g-ts-sdk` | `^0.3.3` | Storage Log + KV |
| `snarkjs` | `^0.7.6` | Groth16 ZK proofs |
| `@supabase/supabase-js` | `^2.45.0` | Database + auth |
| `stripe` | `^22.0.2` | Fiat on-ramp |

---

<div align="center">

**SmartChain Hub Frontend** · Next.js 16 · Deployed on Vercel

[🌐 Live Demo](https://smartchainhubfrontend.vercel.app) · [📊 ChainScan](https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08)

</div>
