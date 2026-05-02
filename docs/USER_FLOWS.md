<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub" width="100" />

# ⛓ SmartChain Hub — User Flows
### *Every path a user can take, mapped from source code*

[![Live](https://img.shields.io/badge/🌐_Live-smartchainhubfrontend.vercel.app-6366f1?style=for-the-badge)](https://smartchainhubfrontend.vercel.app)
[![0G Galileo](https://img.shields.io/badge/Network-0G_Galileo_16602-0ea5e9?style=for-the-badge)](https://scan-testnet.0g.ai)
[![Track 3](https://img.shields.io/badge/Track_3-Agentic_Economy-10b981?style=for-the-badge)](https://0g.ai)

> All flows verified against actual source code in `smartchain_hub_frontend/src/pages/`

</div>

---

## Flow 1 — New User Onboarding

```
Landing Page (/)
│
│  User sees: Hero · Stats · 6 Features · How It Works · Flywheel CTA
│  Auto-redirect: if Supabase session exists → /dashboard
│
├── [Get Started →]  ──────────────────────────────────► /signup
│
└── [Connect Wallet] (header) ──────────────────────────► MetaMask SDK
      │
      ├── MetaMask installed?
      │     YES → eth_requestAccounts
      │           → switch to 0G Galileo (Chain ID 16602)
      │           → signer set in Web3Context
      │
      └── NO  → "No wallet detected" toast
                Install MetaMask link shown
```

---

## Flow 2 — Sign Up

```
/signup
│
│  Fields: Full Name · Email · Password · Confirm Password · ToS checkbox
│  Auto-redirect: if session exists → /dashboard
│
├── Submit form
│     supabase.auth.signUp({ email, password, options: { data: { full_name } } })
│     │
│     ├── Success → router.push('/dashboard')
│     └── Error   → red error banner shown inline
│
└── "Already have an account?" → /login
```

---

## Flow 3 — Sign In

```
/login
│
│  Fields: Email · Password (show/hide toggle)
│  Auto-redirect: if session exists → /dashboard
│
├── Submit form
│     supabase.auth.signInWithPassword({ email, password })
│     │
│     ├── Success → router.push('/dashboard')
│     └── Error   → red error banner shown inline
│
└── "No account?" → /signup
```

---

## Flow 4 — Dashboard (Core Hub)

```
/dashboard
│
│  Auth: useAuth(false) — wallet-only mode, no forced redirect
│  On mount: hydrateAgentMemory(user.id) → 0G Storage KV sync
│  Real-time: Supabase channel subscription on 'transactions'
│
├── [A] AgentIDCard
│     │
│     ├── Wallet not connected?
│     │     → "Connect Wallet" button
│     │
│     ├── Wallet connected, no Agent ID?
│     │     → "Mint Agent ID" button
│     │         mintAgentID(signer) → SmartChainAgentID.mintAgentID(modelHash)
│     │         → reputation: 0, memoryRoot: 0x0, modelHash: keccak256(...)
│     │         → "Agent ID minted successfully ✓" notification
│     │
│     └── Agent ID exists?
│           → Shows: Reputation · Optimizations · Since date
│           → Memory Root (0G KV) · Model Hash (TF weights)
│           → TEE badge (green) or Local AI badge (blue)
│           → [Refresh] → re-fetch from chain
│           → [Reset & Re-mint] → resetMint(address) → re-mint flow
│
├── [B] Fine-tune AI Model Panel
│     │
│     └── [Fine-tune Model] button
│           triggerFineTune([], false)
│           → POST /api/fine-tune
│               → Supabase: fetch last 100 transactions with savings > 0
│               → POST /fine-tune → Flask AI Agent
│               → transactions_to_features() → model.fit(X, y, epochs=50)
│               → Returns: { ok, samples, epochs, final_loss, model_hash }
│           → Success: "✓ Fine-tuned on N samples · Loss: X · Hash: 0x..."
│           → Error:   "✗ insufficient_samples (N samples)"
│
├── [C] Stats Cards (30-day window)
│     Transactions · Revenue Earned · Agent Reputation
│     Growth % vs previous 30 days
│
├── [D] Transaction Volume Bar Chart
│     30 daily buckets from Supabase transactions
│
├── [E] Recent Activity Table
│     Last 4 transactions: tx_hash · type · amount · status
│
└── [F] Route Performance Table
      Routes grouped from activity: count · total savings · avg savings
```

---

## Flow 5 — Transaction Optimization (Core Feature)

```
/transactions
│
│  On mount: hydrateAgentMemory(user.id)
│            → pre-fills amount + priority from 0G KV memory
│
├── [TAB: Optimize] ─────────────────────────────────────────────────
│     │
│     ├── Enter $amount · select priority (efficiency / speed / security)
│     │
│     ├── [Optimize Transaction]
│     │     POST /optimize → Flask AI Agent
│     │     │
│     │     ├── 0G Compute TeeML available?
│     │     │     YES → LLaMA 3.1 8B inference
│     │     │           X-TEE-Proof header → tee_verified: true
│     │     │           Blue TEE badge shown
│     │     │
│     │     └── NO  → TF 2.16 local fallback
│     │               6-feature model → savings_rate · confidence · risk
│     │               Blue "Local AI" badge shown
│     │
│     ├── Result card shows:
│     │     Fee · Savings · Est. Time · Route · Risk · Congestion %
│     │     Confidence bar · Explanation text
│     │     TEE badge (blue) or Local AI badge
│     │
│     └── [Confirm & Save]
│           │
│           ├── [1] POST /api/zk-proof
│           │         validateInputs(amount, fee, savings)
│           │         snarkjs.groth16 OR sha256 commitment
│           │         → Purple ZK badge shown
│           │
│           ├── [2] POST /api/storage-upload
│           │         @0glabs/0g-ts-sdk MemData upload
│           │         → rootHash (Merkle root)
│           │         → storageScanUrl
│           │
│           ├── [3] POST /api/agent-memory
│           │         mergeOptimizationIntoMemory()
│           │         version++ → Batcher.exec(signer)
│           │         → 0G Storage KV write
│           │
│           ├── [4] supabase.insert('transactions')
│           │         amount · fee · savings · route
│           │         storage_root · tx_hash · storage_scan_url
│           │
│           └── [5] Wallet connected?
│                     YES → hasAgentID(signer)
│                           → if no ID: mintAgentID(signer)
│                           → updateAgentMemory(signer, rootHash, savings)
│                               SmartChainAgentID.updateMemory()
│                               reputation++ on-chain
│                           → recordTransactionOnChain(signer, amount, fee, route)
│                               SmartChainTransaction.recordTransaction()
│                           → supabase.update status → 'confirmed'
│                     NO  → supabase.update status → 'confirmed'
│                           (0G Storage receipt is source of truth)
│
├── [TAB: Analyze] ───────────────────────────────────────────────────
│     Reads txList from Supabase
│     Route breakdown bar chart (savings per route)
│     Summary table: route · count · fees · savings · efficiency %
│     Savings over time mini bar chart
│
└── [TAB: Simulate] ──────────────────────────────────────────────────
      Enter amount · select route (0G Chain Flash / Standard / High Speed / Economy)
      [Run Simulation] → 1s delay → local calculation
      Shows: estimated fee · time · savings · risk · success rate
      Note: "This is a simulation only — no funds are moved"
```

---

## Flow 6 — Payments

```
/payments
│
│  Wallet check: isConnected OR manualAddress entered
│
├── NOT CONNECTED
│     → [Connect with MetaMask] button
│     → OR enter address manually (read-only mode)
│
└── CONNECTED — 5 tabs:
│
├── [TAB: Send]
│     Recipient address · Amount (A0GI) · Memo (optional)
│     [Send Funds]
│       SmartChainPayments.sendFunds(to, memo, { value })
│       0.5% fee deducted → distributed to stakers
│       FundsSent event emitted
│
├── [TAB: Receive]
│     Shows wallet address
│     [Copy Address] → navigator.clipboard.writeText()
│
├── [TAB: Stake]
│     Shows: Your Stake · Pending Reward · APY (5%)
│     Enter amount → [Stake Now]
│       Balance check: stakeAmt + 0.01 A0GI gas buffer
│       SmartChainPayments.stake({ value })
│       Staked event emitted
│
├── [TAB: Withdraw]
│     Shows: Staked Balance · Claimable Earnings
│     [Unstake N A0GI]
│       SmartChainPayments.unstake()
│       Returns principal + accrued 5% APY reward
│     [Claim N A0GI]
│       SmartChainPayments.claimEarnings()
│       Pull-based revenue claim
│
└── [TAB: Agent Escrow]
      ┌── Open Channel (Agent A → Agent B)
      │     Agent B address · Price per call · Deposit amount
      │     [Open / Top-up Channel]
      │       depositToChannel(signer, agentB, pricePerCall, depositAmount)
      │       SmartChainAgentEscrow.deposit()
      │       ChannelOpened event emitted
      │
      ├── Claim Payment (Agent B only)
      │     Agent A address field
      │     [Claim Per Call (as Agent B)]
      │       settleCall(signer, agentA)
      │       SmartChainAgentEscrow.payPerCall()
      │       1% platform fee deducted · net to Agent B
      │       CallSettled event emitted
      │
      ├── Withdraw Balance (Agent A only)
      │     Agent B address field
      │     [Withdraw Remaining Balance (as Agent A)]
      │       withdrawFromChannel(signer, agentB)
      │       SmartChainAgentEscrow.withdraw()
      │       Channel closed · ChannelWithdrawn event emitted
      │
      └── Check Channel State
            Agent A address · Agent B address
            [Check Channel]
              getChannelState(provider, agentA, agentB)
              Shows: balance · pricePerCall · totalCalls · totalPaid · active
```

---

## Flow 7 — Revenue

```
/revenue
│
│  Auth: useAuth(false) — wallet-only mode
│  On mount (wallet connected):
│    SmartChainPayments.pendingEarnings(address) → on-chain claimable
│    SmartChainPayments.getStake(address) → stake + reward
│  On mount (Supabase session):
│    supabase.from('revenue_shares').select() → DB records
│
├── On-chain stats (wallet connected):
│     Claimable Earnings · Your Stake · Staking Reward (accruing)
│
├── Supabase stats:
│     Total Revenue Pool · Your Share · Next Payout date
│
├── Donut chart: Your Share % of total pool
│
├── [Claim Now] (if earnings > 0)
│     Wallet connected?
│       YES → SmartChainPayments.claimEarnings()
│             → setOnChainEarnings("0")
│       Supabase session?
│         YES → supabase.update revenue_shares SET claimed=true
│               → supabase.update profiles SET balance += unclaimedAmt
│
└── Recent Payouts table
      Date · Amount · Status (Claimed / Unclaimed)
```

---

## Flow 8 — Profile & Security

```
/profile
│
│  Auth: useAuth() — redirects to /login if no session
│  On mount:
│    supabase.from('profiles').select(full_name, phone, avatar_url, two_fa_enabled)
│    supabase.auth.mfa.listFactors() → check TOTP enrollment
│
├── Avatar Card
│     Click avatar → file input → upload to Supabase Storage (avatars bucket)
│     → supabase.update profiles SET avatar_url
│
├── Personal Information
│     Full Name · Email (read-only) · Phone
│     [Save Changes] → supabase.update profiles
│
└── Security Settings
      │
      ├── [Change Password]
      │     Modal: Current · New · Confirm password
      │     Strength bar (4 levels)
      │     supabase.auth.updateUser({ password: newPw })
      │
      ├── [Two-Factor Authentication toggle]
      │     ENABLE:
      │       supabase.auth.mfa.enroll({ factorType: 'totp' })
      │       → QR code shown (scan with Google Authenticator / Authy)
      │       → Manual secret key shown
      │       → Enter 6-digit code → supabase.auth.mfa.challenge() + verify()
      │       → supabase.update profiles SET two_fa_enabled=true
      │     DISABLE:
      │       Enter 6-digit code → challenge + verify
      │       → supabase.auth.mfa.unenroll({ factorId })
      │       → supabase.update profiles SET two_fa_enabled=false
      │
      └── [Sign Out]
            supabase.auth.signOut()
            → router.push('/login')
```

---

## Flow 9 — Transaction History

```
/history
│
│  Auth: useAuth()
│  On mount: supabase.from('transactions').select(*).eq(user_id).order(created_at desc)
│  Real-time: Supabase channel subscription → auto-refresh on changes
│
├── Stats: Total Transactions · Total Savings · Confirmed On-Chain
│
├── Search: filter by tx_hash or route (client-side)
│
├── Filter tabs: all · confirmed · pending · failed
│
└── Table columns:
      Transaction (hash → ChainScan link if valid 64-char hex)
      Amount · Fee · Savings · Route
      Storage (0G Storage link if storage_root present)
      Status badge (confirmed / pending / failed)
```

---

## Flow 10 — On-Ramp (Buy A0GI)

```
/onramp
│
│  Wallet check: MetaMask OR manual address entry
│
├── NOT CONNECTED
│     [Connect with MetaMask]
│     OR enter address manually → [Use]
│
└── CONNECTED — 3 payment methods:
│
├── [💳 Card] (Stripe)
│     Amount input ($10 / $25 / $50 / $100 quick select)
│     Conversion: 1 USD = 2 A0GI
│     [Pay $N with Card]
│       POST /api/onramp/stripe
│         { amount, walletAddress, paymentType: "card" }
│       → Stripe Checkout session created
│       → window.location.href = data.url (redirect to Stripe)
│       → On return: ?status=success → success message
│                    ?status=cancelled → info message
│
├── [🏦 Bank Transfer]
│     POST /api/onramp/stripe (bank transfer flow)
│     → Stripe shows bank account details
│     → 1–3 business days delivery
│
└── [📱 M-Pesa] (Flutterwave)
      Amount + Phone number (+254 Kenya format)
      [Pay $N via M-Pesa]
        POST /api/onramp/mpesa
          { amount, phone, walletAddress }
        → Flutterwave STK Push to phone
        → User confirms PIN on phone
        → A0GI delivered ~2 minutes
        → Success: "You will receive N A0GI after confirming your PIN"
```

---

## Flow 11 — Wallet Connection (Global)

```
Web3Context (wraps entire app)
│
│  On mount: MetaMask SDK v0.34 init
│            → auto-reconnect if already authorised
│
├── connectWallet()
│     connectingRef guard (prevents duplicate clicks)
│     ethereum.request({ method: 'eth_requestAccounts' })
│     → _connect(ethereum, accounts[0])
│         new ethers.BrowserProvider(ethereum)
│         chainId === '16602'?
│           YES → set provider + signer + address
│           NO  → wallet_switchEthereumChain to 0G Galileo
│                 if 4902 error → wallet_addEthereumChain
│                 → retry connect
│
├── disconnectWallet()
│     Clear: address · provider · signer · chainId
│     sdk.disconnect()
│
├── switchToOG()
│     wallet_switchEthereumChain({ chainId: '0x40DA' })
│     if 4902 → wallet_addEthereumChain (Galileo config)
│
└── Event listeners:
      accountsChanged → update address or disconnect
      chainChanged    → window.location.reload()
```

---

## Flow 12 — Agent Memory Sync (Cross-Device)

```
App mount (any page with user session)
│
└── hydrateAgentMemory(userId)
      │
      ├── GET /api/agent-memory?userId=...
      │     KvClient.getValue(STREAM_ID, key)
      │     → authoritative 0G KV state
      │
      └── version comparison
            remote.version > local.version?
              YES → localStorage.setItem(key, remote)
                    return remote
              NO  → return local (already newest)

After every optimization confirm:
│
└── saveAgentMemory(memory)
      ├── localStorage.setItem() — instant
      └── POST /api/agent-memory
            Batcher.exec(signer)
            → 0G KV versioned write
            → returns rootHash
```

---

## Flow 13 — ZK Proof Generation

```
POST /api/zk-proof
  { amount, fee, savings, route, userId }
│
├── validateInputs()
│     amount > 0
│     fee >= 0 AND fee < amount * 0.05
│     savings >= 0 AND savings / amount <= 0.10
│     → 422 if invalid
│
├── buildCommitment(amount, fee, savings, userId)
│     sha256(`${amount}:${fee}:${savings}:${userId}`)
│     → always computed as fallback
│
├── circuits/*.wasm + *.zkey present?
│     YES → snarkjs.groth16.fullProve(input, wasm, zkey)
│           groth16.verify(vkey, publicSignals, proof)
│           → { proof, publicSignals, verified: true, method: "groth16" }
│
└── NO  → { proof: null, verified: true,
│           commitment, method: "commitment-sha256",
│           fallback: true }
│
UI: Purple ZK badge shown on confirmation
    "Proves: savings > 0, fee < 2%, rate in valid range"
```

---

## Flow 14 — AI Fine-Tuning Loop

```
Dashboard → [Fine-tune Model]
│
└── triggerFineTune([], false)
      POST /api/fine-tune
      │
      ├── Supabase: SELECT amount, optimized_fee, savings, route, storage_root
      │             WHERE savings > 0 AND amount > 0
      │             ORDER BY created_at DESC LIMIT 100
      │
      ├── samples < 10?
      │     → { ok: false, reason: "insufficient_samples", samples: N }
      │     → Dashboard shows: "✗ Need at least 10 transactions"
      │
      └── samples >= 10
            POST /fine-tune → Flask AI Agent
              transactions_to_features(transactions)
              → 6-feature vectors + [savings_rate, confidence, risk] labels
              model.compile(Adam lr=0.0001)
              model.fit(X, y, epochs=50)
              model.save(tf_savings_model.keras)
              SHA-256(weights bytes) → model_hash
            → { ok: true, samples, epochs, final_loss, model_hash }
            → Dashboard shows: "✓ Fine-tuned on N samples · Loss: X · Hash: 0x..."
```

---

## Page → Route Map

| Page | Route | Auth Required | Wallet Required |
|---|---|---|---|
| Landing | `/` | No (redirects if session) | No |
| Sign Up | `/signup` | No (redirects if session) | No |
| Sign In | `/login` | No (redirects if session) | No |
| Dashboard | `/dashboard` | No (wallet-only OK) | Recommended |
| Transactions | `/transactions` | Yes (Supabase) | Optional |
| Payments | `/payments` | No | Yes (or manual addr) |
| Revenue | `/revenue` | No (wallet-only OK) | Recommended |
| Profile | `/profile` | Yes (Supabase) | No |
| History | `/history` | Yes (Supabase) | No |
| On-Ramp | `/onramp` | No | Yes (or manual addr) |
| Console | `/console` | No | No |
| Documentation | `/documentation` | No | No |
| Blog | `/blog` | No | No |
| About | `/about` | No | No |
| Features | `/features` | No | No |
| Contact | `/contact` | No | No |

---

## Error States & Fallbacks

| Scenario | Fallback Behaviour |
|---|---|
| 0G Compute broker unavailable | TF 2.16 local model used · `tee_verified: false` |
| 0G Storage upload fails | SHA-256 hash used as rootHash · flow continues |
| ZK circuit files missing | SHA-256 commitment fallback · `method: "commitment-sha256"` |
| 0G KV write fails | localStorage write already succeeded · UI unaffected |
| Agent ID contract timeout | `staticNetwork` provider skips detection · direct RPC used |
| Supabase unavailable | Empty state shown · no crash |
| MetaMask not installed | "No wallet detected" toast · Install MetaMask link |
| Wrong chain | Auto-switch to 0G Galileo (16602) · add chain if needed |
| Insufficient A0GI | Balance check before mint · "Get tokens from faucet" message |
| Fine-tune < 10 samples | `insufficient_samples` error · user informed |

---

<div align="center">

**SmartChain Hub** · User Flows · Verified from Source Code · 0G APAC Hackathon 2026

`#BuildOn0G` · `#AgenticEconomy` · `#0GHackathon`

</div>
