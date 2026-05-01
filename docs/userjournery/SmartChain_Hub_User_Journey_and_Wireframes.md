<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="100" />

# ⛓ SmartChain Hub — User Journey & Wireframes
### *End-to-end user flows across all 16 pages*

[![Live](https://img.shields.io/badge/Live-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_Testnet-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-10b981?style=for-the-badge)](https://0g.ai)

</div>

---

## Complete User Journey

```
New User
    │
    ▼
[1] Landing Page (/)
    Hero section · Features · CTA
    → "Get Started" → /signup
    → "Connect Wallet" → MetaMask SDK
    │
    ▼
[2] Sign Up / Login (/signup · /login)
    Supabase email + password auth
    OR wallet-only (no Supabase session required for Agent ID)
    │
    ▼
[3] Dashboard (/dashboard)
    ├── AgentIDCard
    │     No Agent ID? → Mint Agent ID button
    │     Has Agent ID? → Shows reputation · memoryRoot · modelHash
    │     TEE badge (green) or Local AI badge (blue)
    │
    ├── Fine-tune AI Model panel
    │     Fetches storage_roots from Supabase
    │     Sends to /api/fine-tune → Flask AI Agent
    │     Returns: samples · loss · model_hash
    │
    ├── Stats cards: Transactions (30d) · Revenue · Agent Reputation
    ├── Transaction Volume bar chart (30 days)
    ├── Recent Activity table
    └── Route Performance table
    │
    ▼
[4] Transactions (/transactions)
    ├── Optimize tab
    │     Enter $amount · select priority (efficiency/speed/security)
    │     → POST /optimize → AI Agent
    │     Result: fee · savings · route · confidence · risk · congestion
    │     TEE badge (if 0G Compute available)
    │     → Confirm & Save:
    │         POST /api/zk-proof → ZK commitment (purple badge)
    │         POST /api/storage-upload → 0G Storage Log (rootHash)
    │         POST /api/agent-memory → 0G Storage KV
    │         supabase.insert('transactions')
    │         AgentID.updateMemory() → reputation++ on-chain
    │
    ├── Analyze tab
    │     Route breakdown bar chart
    │     Summary table: route · count · fees · savings · efficiency %
    │     Savings over time mini chart
    │
    └── Simulate tab
          Enter amount · select route
          Run Simulation → estimated fee · time · savings · risk
          (no real transaction executed)
    │
    ▼
[5] Payments (/payments)
    ├── Send tab
    │     Recipient address · amount · memo
    │     sendFunds() → 0.5% fee → stakers
    │
    ├── Stake tab
    │     Stake A0GI → 5% APY time-weighted
    │     Unstake → principal + accrued reward
    │
    ├── Withdraw tab
    │     Claimable earnings from revenue distribution
    │     claimEarnings() → pull-based
    │
    └── Agent Escrow tab
          Open channel: Agent B address · price/call · deposit amount
          Check channel state: balance · calls · active
          Claim per call (as Agent B)
          Withdraw remaining (as Agent A)
    │
    ▼
[6] Revenue (/revenue)
    Revenue shares from Supabase revenue_shares table
    Requires Supabase auth session
    On-chain earnings claimable via Payments → Withdraw tab
    │
    ▼
[7] Profile (/profile)
    Agent identity display
    Memory root (0G KV)
    Model hash (TF weights)
    Total optimizations · total savings
    │
    ▼
[8] History (/history)
    Full transaction history from Supabase
    Columns: tx hash · date · amount · fee · savings · route · status
    │
    ▼
[9] On-ramp (/onramp)
    Buy A0GI with:
    ├── Credit/Debit Card (Stripe Checkout)
    │     POST /api/onramp/stripe → Stripe session
    │     Webhook: /api/onramp/stripe-webhook
    │
    └── M-Pesa (Flutterwave STK Push)
          POST /api/onramp/mpesa → Flutterwave
          Webhook: /api/onramp/mpesa-webhook
          Kenya mobile money (+254XXXXXXXXX)
```

---

## Page-by-Page Wireframe Reference

### Landing Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo · Nav · Connect Wallet                │
├─────────────────────────────────────────────────────┤
│  HERO                                               │
│  "The First Sovereign AI Agent Economy on 0G"       │
│  [Get Started]  [View Demo]                         │
├─────────────────────────────────────────────────────┤
│  FEATURES (3 columns)                               │
│  🪪 Soulbound ID  🧠 Persistent Memory  🔬 TEE AI  │
├─────────────────────────────────────────────────────┤
│  STATS: Agents · Transactions · Revenue             │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
```

### Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR  │  AGENT ID CARD                          │
│           │  ┌─────────────────────────────────┐   │
│  Dashboard│  │ 0G Agent ID · Soulbound          │   │
│  Txns     │  │ Reputation: 3 · Since: Jan 2026  │   │
│  Payments │  │ Memory Root: 0x1a2b...           │   │
│  Revenue  │  │ Model Hash:  0x3c4d...           │   │
│  Profile  │  │ ✓ AI Inference Active — TF 2.16  │   │
│  History  │  │ [Refresh]  [Reset & Re-mint]     │   │
│  Console  │  └─────────────────────────────────┘   │
│  On-ramp  │                                         │
│           │  FINE-TUNE PANEL                        │
│           │  [Fine-tune Model]                      │
│           │                                         │
│           │  STATS: Txns · Revenue · Reputation     │
│           │                                         │
│           │  BAR CHART: 30-day volume               │
│           │                                         │
│           │  RECENT ACTIVITY TABLE                  │
└─────────────────────────────────────────────────────┘
```

### Transactions (`/transactions`)

```
┌─────────────────────────────────────────────────────┐
│  TABS: [Optimize] [Analyze] [Simulate]              │
├─────────────────────────────────────────────────────┤
│  STATS: Savings · Efficiency · Avg Confirmation     │
├─────────────────────────────────────────────────────┤
│  OPTIMIZE TAB                                       │
│  Amount: [$____]                                    │
│  Priority: [Efficiency] [Speed] [Security]          │
│  [Optimize Transaction]                             │
│                                                     │
│  RESULT (after optimize):                           │
│  Fee: $3.00  Savings: $18.85  Time: 8s              │
│  Route: 0G Chain Flash Route                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✓ AI Inference Active — TF 2.16  [0G AI]   │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✓ ZK Proof Generated  Commitment: 0x1a2b.. │   │
│  └─────────────────────────────────────────────┘   │
│  [Reset]  [Confirm & Save]                          │
└─────────────────────────────────────────────────────┘
```

### Payments (`/payments`)

```
┌─────────────────────────────────────────────────────┐
│  TABS: [Send] [Stake] [Withdraw] [Agent Escrow]     │
├─────────────────────────────────────────────────────┤
│  AGENT ESCROW TAB                                   │
│  Agent B Address: [0x____________________]          │
│  Price per call:  [0.001] A0GI                      │
│  Deposit amount:  [0.01]  A0GI                      │
│  [Open / Top-up Channel]                            │
│                                                     │
│  Channel State:                                     │
│  Balance: 0.01 A0GI · Price/call: 0.001 · Active   │
│                                                     │
│  [Claim Per Call (as Agent B)]                      │
│  [Withdraw Remaining (as Agent A)]                  │
└─────────────────────────────────────────────────────┘
```

---

## Screenshots

| Dashboard | Transaction Optimizer | Agent ID Card |
|---|---|---|
| ![Dashboard](../mockups/dashboard1.png) | ![Transactions](../mockups/transaction.png) | ![Profile](../mockups/profile.png) |

| Revenue Dashboard | Login | All Pages |
|---|---|---|
| ![Revenue](../mockups/revenuedashboard.png) | ![Login](../mockups/login.png) | ![All Pages](../mockups/allpagesmockups.png) |

---

## Key UX Decisions

| Decision | Rationale |
|---|---|
| Wallet-only mode (no Supabase required) | AgentIDCard works with wallet alone — no forced login |
| `hydrateAgentMemory()` on every mount | Cross-device sync happens automatically — user never loses state |
| Dual-write localStorage + 0G KV | Instant UI responsiveness + durable persistence |
| TEE badge vs Local AI badge | Transparent about inference source — builds trust |
| ZK badge on confirm | Visual proof that optimization is cryptographically verified |
| SHA-256 fallback for ZK | Groth16 requires compiled circuit — fallback keeps flow unblocked |
| `version` field in AgentMemory | Prevents stale cache overwrites on cross-device sync |
| `fetchingRef` guard in AgentIDCard | Prevents duplicate in-flight fetches on signer recreation |

---

<div align="center">

**SmartChain Hub** · User Journey & Wireframes · 0G APAC Hackathon 2026

`#BuildOn0G` · `#AgenticEconomy`

</div>
