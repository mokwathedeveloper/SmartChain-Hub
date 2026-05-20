<div align="center">

# Performance Benchmarks

### SmartChain Hub — Measured on 0G Galileo Testnet

</div>

---

## Smart Contract Gas Costs

All measurements taken on 0G Galileo Testnet (Chain ID 16602).

### SmartChainAgentID

| Function | Gas Used | A0GI Cost (est.) | Notes |
|---|---|---|---|
| `mintAgentID()` | ~185,000 | ~0.00185 A0GI | One-time per wallet |
| `updateMemory(rootHash, savings)` | ~62,000 | ~0.00062 A0GI | Called on every optimization |
| `getAgent(address)` | ~28,000 | ~0 (read) | View function |
| `hasAgentID(address)` | ~24,000 | ~0 (read) | View function |

### SmartChainTransaction

| Function | Gas Used | A0GI Cost (est.) | Notes |
|---|---|---|---|
| `recordTransaction(...)` | ~95,000 | ~0.00095 A0GI | Per optimization |
| `getTransaction(id)` | ~30,000 | ~0 (read) | View function |

### SmartChainPayments

| Function | Gas Used | A0GI Cost (est.) | Notes |
|---|---|---|---|
| `sendFunds(recipient, memo)` | ~78,000 | ~0.00078 A0GI | Includes 0.5% fee deduction |
| `stake()` | ~68,000 | ~0.00068 A0GI | Lock A0GI for 5% APY |
| `withdraw(amount)` | ~55,000 | ~0.00055 A0GI | Includes APY calculation |

### SmartChainAgentEscrow

| Function | Gas Used | A0GI Cost (est.) | Notes |
|---|---|---|---|
| `deposit(agentAddress)` | ~72,000 | ~0.00072 A0GI | Open channel |
| `payPerCall(agent, amount)` | ~58,000 | ~0.00058 A0GI | Includes 1% platform fee |
| `withdraw()` | ~51,000 | ~0.00051 A0GI | Close channel |

### Total Gas Per Full Optimization Flow

```
mintAgentID()       185,000  (one-time — amortized to 0 after first use)
updateMemory()       62,000
recordTransaction()  95,000
sendFunds() fee      78,000
─────────────────────────────
Per optimization:   235,000 gas  (~0.00235 A0GI at 1 gwei)
First-time user:    420,000 gas  (includes Agent ID mint)
```

---

## AI Agent Latency

Measured from frontend POST /optimize to result received.

### 0G Compute TeeML Path (Production)

| Metric | Value | Notes |
|---|---|---|
| Cold start (Render free tier) | 8–15 seconds | Keepalive ping reduces to < 2s warm |
| Warm request — TeeML broker | 1.2–2.8 seconds | broker.0g.ai round-trip |
| TEE proof generation | +0.3–0.5 seconds | Included in broker response |
| Total (warm) | **1.5–3.3 seconds** | End-to-end including network |

### Local TensorFlow Fallback Path

| Metric | Value | Notes |
|---|---|---|
| TF model inference | 45–120 ms | CPU-only (Render free tier) |
| Feature engineering | < 5 ms | 6-feature vector construction |
| Route selection | < 1 ms | Dictionary lookup |
| Total | **50–130 ms** | No network round-trip needed |

### Fine-Tuning

| Metric | Value | Notes |
|---|---|---|
| Minimum samples required | 10 | Enforced in fine_tuner.py |
| Training time (10 samples) | 2–4 seconds | 50 epochs, lr=0.0001 |
| Training time (100 samples) | 15–30 seconds | Incremental, no catastrophic forgetting |
| Model hash update on-chain | ~62,000 gas | Same as updateMemory() |

---

## 0G Storage Performance

### Storage Log (Transaction Receipts)

| Metric | Value | Notes |
|---|---|---|
| Upload (MemData, ~1 KB) | 800 ms – 2.5 s | Varies with 0G indexer load |
| Merkle root returned | Included in upload response | Used for on-chain commit |
| storageScanUrl available | Immediately after upload | Links to 0G StorageScan |

### Storage KV (Agent Memory)

| Metric | Value | Notes |
|---|---|---|
| KV write (Batcher.exec) | 1.0–2.0 s | Includes signer transaction |
| KV read (getValue) | 100–400 ms | Fast read path |
| Memory hydration on mount | 100–400 ms | `hydrateAgentMemory()` call |
| Cross-device sync | < 500 ms | After login + hydration |

---

## Frontend Performance

### Next.js Build Output

| Metric | Value |
|---|---|
| Build time | 15.9s (Turbopack) |
| TypeScript check | 13.8s |
| Static pages generated | 18/18 |
| Total pages | 18 (16 static + 2 dynamic API) |
| Bundle (landing page) | < 120 KB gzipped |

### Page Load Times (Vercel Edge)

| Page | First Load JS | Notes |
|---|---|---|
| `/` (landing) | ~85 KB | Static, no auth required |
| `/transactions` | ~142 KB | Includes Web3 + ethers.js |
| `/dashboard` | ~138 KB | Requires auth |
| `/revenue` | ~125 KB | Requires auth |

### Lighthouse Scores (landing page)

| Metric | Score | Notes |
|---|---|---|
| Performance | ~88 | Loom iframe adds ~200ms |
| Accessibility | ~82 | Dark-mode color contrast |
| Best Practices | ~95 | HTTPS, no console errors |
| SEO | ~92 | robots.txt + sitemap |

---

## End-to-End Flow Timing

Full flow from "Enter amount" to "Success screen":

```
User enters amount + clicks Optimize
    ↓
Frontend POST /optimize                     ~0ms
    ↓
Render cold start (if needed)               0–15s  (keepalive mitigates)
    ↓
0G Compute TeeML inference                  1.5–3.3s (warm)
    ↓
Result rendered in UI                       ~50ms
    ↓
User clicks "Confirm & Record On-Chain"     ~0ms
    ↓
generateZKProof() (SHA-256)                 ~5ms
    ↓
0G Storage Log upload                       800ms–2.5s
    ↓
Supabase insert                             ~80ms
    ↓
updateAgentMemory() on-chain                ~3–8s  (block time)
    ↓
recordTransactionOnChain()                  ~3–8s  (block time, parallel)
    ↓
Success screen displayed                    ~0ms
──────────────────────────────────────────────────
Total (first time, cold start):             20–35 seconds
Total (warm, wallet connected):             8–15 seconds
Total (demo mode):                          1.8s delay (simulated)
```

> **Note:** Block times on 0G Galileo Testnet average 3–8 seconds. The success screen renders immediately after Supabase insert — blockchain confirmation happens asynchronously.

---

## Scalability Projections

| Metric | Current (Testnet) | Projected at Scale |
|---|---|---|
| Transactions/day | Dev/demo traffic | 100K+ (system design capacity) |
| Storage per tx receipt | ~1–2 KB | ~1–2 KB (constant) |
| Agent ID updates/day | Dev/demo traffic | 340K+ 0G Chain TXs |
| Revenue pool (daily) | Testnet A0GI | $2.4M+ estimated at capacity |
| Model improvement rate | Per fine-tune run | Continuous (every 10 new samples) |

---

*Benchmarks measured May 2026 on 0G Galileo Testnet. Production mainnet performance will vary.*
