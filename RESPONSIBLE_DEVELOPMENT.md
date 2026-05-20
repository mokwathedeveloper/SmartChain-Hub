<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub Logo" width="90" />

# Responsible Software Development

### SmartChain Hub — Our Commitment Beyond Shipping Features

[![Security](https://img.shields.io/badge/Security-OWASP_Top_10_Mitigated-10b981?style=for-the-badge&logo=owasp&logoColor=white)](docs/security/SECURITY_FIXES.md)
[![Privacy](https://img.shields.io/badge/Data_Privacy-RLS_+_User_Owned-6366f1?style=for-the-badge)](docs/security/SECRETS_GUIDE.md)
[![Performance](https://img.shields.io/badge/Performance-Optimised_Every_Layer-f59e0b?style=for-the-badge)](docs/performance/BENCHMARKS.md)
[![Contracts](https://img.shields.io/badge/Contracts-ReentrancyGuard_+_Audited-0ea5e9?style=for-the-badge&logo=ethereum&logoColor=white)](blockchain/contracts/)

</div>

---

> *"We should acknowledge the power and responsibility in our arms when we decide to build Software.*
> *Other than developing the product, there are very many other responsibilities — Security, Data Privacy,*
> *Responsible Handling of User Data, Performance Optimisation, Resource Allocation.*
> *Majority of non-tech people building with AI often ignore these and in the long run, it ends up biting them*
> *— not only them, but also their users."*
>
> — On Responsible Software Development

---

## Why This Matters for SmartChain Hub

SmartChain Hub handles **real financial transactions**, **AI inference over user data**, and **on-chain identity** — three domains where irresponsible software causes real harm to real people.

Every architectural decision in this project was made with this responsibility in mind.

---

## 1. Security of the Product

> "The power to build software is also the power to expose users to harm."

### What We Did

| Threat | Mitigation | File |
|---|---|---|
| **SQL Injection** | Supabase parameterised queries + typed ORM — no raw SQL | `src/utils/supabase.ts` |
| **CSRF Attacks** | CSRF token endpoint + middleware on all state-changing routes | `smartchain_hub_backend/` |
| **SSRF (Server-Side Request Forgery)** | URLs reconstructed from validated components — never concatenated from user input (CWE-918) | `src/utils/api.ts` |
| **Log Injection** | `sanitizeForLog()` applied to all logged output (CWE-117) | `ai-agent/server/app.py` |
| **Smart Contract Re-entrancy** | `ReentrancyGuard` on every payable function across all 5 contracts | `blockchain/contracts/*.sol` |
| **Over-privileged Access** | Row Level Security on all Supabase tables — users can only read their own data | `docs/backend/supabase_migration_005.sql` |
| **API Abuse / DoS** | Rate limiting: 30 req/min on `/optimize`, 5 req/hr on `/fine-tune` (flask-limiter) | `ai-agent/server/app.py` |
| **Credential Exposure** | `.env*` files in `.gitignore` — no secrets ever committed to git | `.gitignore` |
| **Unsafe CORS** | Explicit origin allowlist — never `CORS(app)` with wildcard | `ai-agent/server/app.py` |
| **Input Validation** | Amount validated client-side (>0, ≤$1M) and server-side (savings, fee, rate bounds) | `src/pages/transactions.tsx`, `api/zk-proof.ts` |

### Smart Contract Security

```solidity
// Every payable function is protected — example from SmartChainPayments.sol
function sendFunds(address recipient, string memory memo)
    external payable nonReentrant {   // ← ReentrancyGuard
    require(msg.value > 0, "Amount required");
    require(recipient != address(0), "Invalid recipient");
    ...
}
```

**OpenZeppelin** `Ownable` + `ReentrancyGuard` used across all 5 contracts — not custom security, battle-tested libraries.

---

## 2. Data Privacy

> "Users trust you with their data. That trust is not yours to abuse."

### What We Did

**User data stays with the user — by design:**

| Principle | Implementation |
|---|---|
| **On-chain identity is user-owned** | `SmartChainAgentID` is a soulbound NFT — only the wallet owner can update it. The platform cannot modify, transfer, or delete a user's Agent ID |
| **Agent memory is user-controlled** | Stored on 0G Storage KV under the user's wallet key — not a centralised database the platform can read at will |
| **No PII on-chain** | Only `memoryRoot` (a hash), `modelHash`, and `reputation` stored on-chain — no names, emails, or addresses |
| **Row Level Security** | Supabase RLS enforced — `transactions`, `profiles`, `revenue_shares` tables are isolated per `user_id`. A logged-in user cannot access another user's rows |
| **Database isolation** | Supabase's managed PostgreSQL with RLS — no shared connection pools that leak data across users |
| **Secret management** | `SECRETS_GUIDE.md` documents every secret, its rotation procedure, and what to do before making the repo public |

### RLS Policy Example

```sql
-- Users can only see their own transactions
CREATE POLICY "Users see own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. Responsible Handling of User Data

> "Data is not just bytes. It represents real people making real decisions with real money."

### What We Did

**We never store more than we need:**

| Data Type | Where Stored | Why | Retention |
|---|---|---|---|
| Transaction amount, fee, savings | Supabase (user-isolated) | Needed for analytics and fine-tuning | User can view; no auto-delete |
| Agent memory (preferences, history) | 0G Storage KV + localStorage cache | Cross-device sync — user controls the key | User-controlled |
| Merkle root hash | Supabase + 0G Chain | Proof of record — not the record itself | Permanent (immutable proof) |
| ZK commitment | 0G Storage receipt | Cryptographic proof — not readable data | Permanent |
| Email / password | Supabase Auth | Authentication only | User can delete account |
| Wallet address | Session only + Supabase profiles | Display + contract interaction | User-controlled |

**What we deliberately do NOT store:**
- Raw transaction payloads
- IP addresses
- Device fingerprints
- Third-party tracking cookies

### AI Training Ethics

The fine-tuning model trains on **aggregated transaction patterns** — not individual user records. Feature vectors contain: `amount_norm`, `priority`, `congestion`, `time_of_day` — no user identifiers.

```python
# fine_tuner.py — only anonymised features are used for training
features = np.array([[
    amount_norm,      # normalised amount — no wallet address
    priority_eff,     # one-hot priority
    priority_spd,
    priority_sec,
    congestion,       # network congestion — not user-specific
    time_of_day       # hour of day — not timestamp
]])
```

---

## 4. Performance Optimisation

> "Slow software wastes users' time. Unoptimised software wastes the planet's resources."

### What We Did

| Layer | Optimisation | Impact |
|---|---|---|
| **AI Agent** | TensorFlow lazy-loaded — avoids OOM on Render free tier | Prevents crashes under load |
| **AI Agent** | TF model pre-trained during Docker build | Faster cold starts; no training at serve time |
| **AI Agent** | Gunicorn multi-worker production server | Handles concurrent requests |
| **Frontend** | Next.js Turbopack — 15.9s build vs ~60s without | Faster CI/CD cycles |
| **Frontend** | Static pre-rendering for 16/18 pages | Near-instant page loads via Vercel edge CDN |
| **Frontend** | Keepalive ping every 4 minutes | Prevents Render cold starts — users never wait 30s |
| **Blockchain** | Non-blocking on-chain calls | UI never freezes waiting for block confirmation |
| **Blockchain** | Read/write contract split — direct RPC for reads | No signer overhead on view functions |
| **Database** | Sequential Supabase queries | Prevents HTTP2 stream exhaustion |
| **Database** | Indexed columns on `user_id`, `created_at` | Sub-millisecond query performance at scale |

### Benchmark: Full Optimization Flow

```
Demo mode (no network):          1.8s  (intentional delay for UX)
Warm AI agent (TeeML):           1.5–3.3s
Warm AI agent (TF fallback):     50–130ms
0G Storage upload:               800ms–2.5s
On-chain confirmation:           3–8s  (0G Galileo block time)
```

See full benchmarks: [docs/performance/BENCHMARKS.md](docs/performance/BENCHMARKS.md)

---

## 5. Resource Allocation

> "Free infrastructure is not free — it has limits. Responsible developers plan for them."

### What We Did

**We chose infrastructure that matches our actual needs — not aspirational ones:**

| Service | Plan | Why | Mitigation for Limits |
|---|---|---|---|
| **Vercel** | Free / Hobby | 16 static pages — no heavy server compute needed | Static pre-rendering means no function invocations for landing page |
| **Render** | Free tier | AI agent with CPU-only TF model | Keepalive ping; lazy model loading; Gunicorn workers |
| **Supabase** | Free tier | <500MB database for hackathon traffic | Indexed queries; RLS prevents full-table scans |
| **0G Galileo** | Testnet | Development and demo — not production funds at risk | Faucet-funded; no real user funds on testnet |

**Rate limiting protects everyone:**
- `/optimize`: 30 requests/minute — prevents AI agent abuse
- `/fine-tune`: 5 requests/hour — prevents expensive training abuse
- Stripe webhook: validates `stripe-signature` header — prevents spoofed payment events

**We do not:**
- Store model weights in the database (stored in container filesystem)
- Re-train the model on every request
- Make unbounded blockchain calls without signer guards

---

## 6. Verifiability — The Responsibility We Added That Most Don't

> "AI making financial decisions should be accountable. Every result should be provable."

This is where SmartChain Hub goes beyond standard responsible development:

| Problem | Our Solution |
|---|---|
| **"Why did the AI pick this route?"** | TEE-verified inference — cryptographic proof the AI ran inside a Trusted Execution Environment |
| **"Can I trust this result wasn't tampered with?"** | ZK commitment (SHA-256) anchored in 0G Storage receipt — immutable proof |
| **"Who owns the agent's decisions?"** | Soulbound Agent ID — every optimization is linked to a non-transferable on-chain identity |
| **"Can I audit my transaction history?"** | Merkle root committed to 0G Storage Log — tamper-proof, permanent audit trail |
| **"Is my AI agent getting smarter at my expense?"** | Model hash stored on-chain — any change to the model produces a new hash, verifiable by anyone |

**This is responsible AI development**: not just "AI does a thing" but "AI does a thing and you can prove it."

---

## Summary

| Responsibility | Status | Evidence |
|---|---|---|
| Security of the Product | ✅ OWASP Top 10 mitigated | [SECURITY_FIXES.md](docs/security/SECURITY_FIXES.md) |
| Data Privacy | ✅ RLS + user-owned data | Supabase migrations 001–006 |
| Responsible Data Handling | ✅ Minimal collection, anonymised AI training | `fine_tuner.py`, `SECRETS_GUIDE.md` |
| Performance Optimisation | ✅ Every layer benchmarked | [BENCHMARKS.md](docs/performance/BENCHMARKS.md) |
| Resource Allocation | ✅ Right-sized infrastructure + rate limiting | `render.yaml`, `flask-limiter` |
| AI Verifiability | ✅ TEE proofs + ZK commitments + on-chain hashes | `blockchain/contracts/`, `api/zk-proof.ts` |

---

<div align="center">

**SmartChain Hub was built with the understanding that shipping fast and shipping responsibly are not opposites.**

[![Security Docs](https://img.shields.io/badge/Security-Full_Docs-10b981?style=flat-square&logo=owasp&logoColor=white)](docs/security/SECURITY_FIXES.md)
[![Performance](https://img.shields.io/badge/Performance-Benchmarks-f59e0b?style=flat-square)](docs/performance/BENCHMARKS.md)
[![Contributors](https://img.shields.io/badge/Team-Contributors-6366f1?style=flat-square&logo=github&logoColor=white)](CONTRIBUTORS.md)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Try_It-0ea5e9?style=flat-square)](https://smartchainhubfrontend.vercel.app)

`#ResponsibleAI` · `#BuildOn0G` · `#AgenticEconomy`

</div>
