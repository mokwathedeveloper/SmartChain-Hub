<div align="center">

<img src="../logo/logo.png" alt="SmartChain Hub" width="80" />

# 🔐 SmartChain Hub — Secrets & Security Guide
### *What to rotate, what is safe, and what to do before going public*

[![Security](https://img.shields.io/badge/Status-Review_Before_Public-f59e0b?style=for-the-badge)](.)
[![gitignore](https://img.shields.io/badge/.env.local-NOT_Tracked_by_Git-10b981?style=for-the-badge)](.)

</div>

---

## ✅ Current Git Status — Verified

```
smartchain_hub_frontend/.env.local    NOT tracked by git  ✅ safe
ai-agent/.env                         NOT tracked by git  ✅ safe
blockchain/.env                       NOT tracked by git  ✅ safe
smartchain_hub_backend/.env           NOT tracked by git  ✅ safe
```

The root `.gitignore` explicitly covers all of these:
```
smartchain_hub_frontend/.env.local
smartchain_hub_frontend/.env
ai-agent/.env
blockchain/.env
smartchain_hub_backend/.env
```

**None of the secret files have ever been committed to git history.**
Running `git log --all --full-history -- smartchain_hub_frontend/.env.local` returns empty.

---

## 🔑 Secrets Inventory — `smartchain_hub_frontend/.env.local`

| Secret | Type | Risk if Exposed | Action Required |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Low — public by design | None — safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon JWT | Low — RLS protects data | None — safe to expose |
| `NEXT_PUBLIC_STORAGE_PRIVATE_KEY` | 0G wallet private key | 🔴 HIGH — funds at risk | Rotate before going public |
| `STORAGE_PRIVATE_KEY` | 0G wallet private key | 🔴 HIGH — funds at risk | Rotate before going public |
| `STRIPE_SECRET_KEY` | Stripe test secret key | 🟡 MEDIUM — test mode only | Rotate before production |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | 🟡 MEDIUM — test mode only | Rotate before production |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Low — public by design | None — safe to expose |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave test key | 🟡 MEDIUM — test mode only | Rotate before production |
| `FLUTTERWAVE_WEBHOOK_HASH` | Webhook hash | Low — custom string | None |

---

## 🚨 What Needs Rotating Before Repo Goes Public

### 1 · 0G Wallet Private Keys — 🔴 HIGH PRIORITY

The same private key is used in two places:
```
NEXT_PUBLIC_STORAGE_PRIVATE_KEY=0xc247c92e7bd4af9c839fbddfb2a7f1bf06c4dd2fae4eba149dd10b0078574b6c
STORAGE_PRIVATE_KEY=0xc247c92e7bd4af9c839fbddfb2a7f1bf06c4dd2fae4eba149dd10b0078574b6c
```

**Steps:**
```
1. Generate a new 0G wallet:
   npx hardhat run --network og_newton scripts/generateWallet.js
   OR use MetaMask → Create Account → Export Private Key

2. Fund the new wallet from hub.0g.ai/faucet

3. Update .env.local with the new key

4. Update Vercel dashboard:
   NEXT_PUBLIC_STORAGE_PRIVATE_KEY = <new key>
   STORAGE_PRIVATE_KEY = <new key>

5. The old wallet address: 0xc247...
   Transfer any remaining A0GI to new wallet
   Old key is now worthless
```

### 2 · Stripe Keys — 🟡 MEDIUM (test mode, low urgency)

```
STRIPE_SECRET_KEY=sk_test_51TRTPK3...
STRIPE_WEBHOOK_SECRET=whsec_QjWAeO2q...
```

These are **test mode** keys (`sk_test_` prefix) — they cannot process real payments.
For the hackathon demo this is acceptable. Before production:
```
1. Go to dashboard.stripe.com → Developers → API Keys
2. Roll the secret key
3. Update webhook secret in Stripe dashboard → Webhooks → Reveal secret
4. Update Vercel env vars
```

### 3 · Flutterwave Key — 🟡 MEDIUM (test mode, low urgency)

```
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-3f3602784e06460d3ca2aef9a79a7bca-X
```

This is a **test key** (`FLWSECK_TEST-` prefix) — cannot process real M-Pesa payments.
For the hackathon demo this is acceptable. Before production:
```
1. Go to app.flutterwave.com → Settings → API Keys
2. Generate new test/live keys
3. Update Vercel env vars
```

---

## ✅ What Is Already Safe

| Item | Why Safe |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URLs are public by design — RLS policies protect the data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon keys are public by design — Row Level Security is the protection layer |
| `STRIPE_PUBLISHABLE_KEY` | Publishable keys (`pk_test_`) are always public — embedded in frontend JS |
| Contract addresses | All public on-chain — visible on ChainScan |
| `NEXT_PUBLIC_AI_AGENT_URL` | Public URL — no secret |
| `FLUTTERWAVE_WEBHOOK_HASH` | Custom string, not a credential |

---

## 🛡️ Before Making Repo Public — Checklist

```
[ ] Rotate NEXT_PUBLIC_STORAGE_PRIVATE_KEY  (new 0G wallet)
[ ] Rotate STORAGE_PRIVATE_KEY              (same new wallet)
[ ] Verify git log shows no .env.local history:
    git log --all --full-history -- smartchain_hub_frontend/.env.local
    (should return empty)
[ ] Verify .gitignore covers .env.local:
    git check-ignore -v smartchain_hub_frontend/.env.local
    (should return: .gitignore:XX:smartchain_hub_frontend/.env.local)
[ ] Run git status — confirm no .env files staged
[ ] Stripe/Flutterwave: acceptable for hackathon (test keys only)
    Rotate before any real payment processing
```

---

## 🔧 How to Verify Nothing Is Tracked

```bash
# Check if .env.local is tracked
git ls-files smartchain_hub_frontend/.env.local
# Expected: empty output (not tracked)

# Check full git history for the file
git log --all --full-history -- smartchain_hub_frontend/.env.local
# Expected: empty output (never committed)

# Check what .gitignore covers
git check-ignore -v smartchain_hub_frontend/.env.local
# Expected: .gitignore:XX:smartchain_hub_frontend/.env.local

# Scan for any accidentally committed secrets
git grep -l "sk_test_\|FLWSECK\|0xc247" $(git log --all --format="%H") 2>/dev/null
# Expected: empty output
```

---

## 📋 Vercel Environment Variables — Production Setup

These must be set in the Vercel dashboard (not in `.env.local`) for production:

```
Settings → Environment Variables → Add

NEXT_PUBLIC_SUPABASE_URL              = https://zlopjichpibvthkaamuw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY         = eyJ... (anon key — safe to expose)
NEXT_PUBLIC_CONTRACT_ADDRESS          = 0xf95A1610be22046c334E3bD1b11D2B88519E6C52
NEXT_PUBLIC_PAYMENTS_CONTRACT         = 0x540aFf6B167F8B5889d852d124C545F5f876A7eB
NEXT_PUBLIC_AGENT_ID_CONTRACT         = 0x69C619374c6B901b99941Df7238fceb80d7DCd08
NEXT_PUBLIC_REVENUE_CONTRACT          = 0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08
NEXT_PUBLIC_AGENT_ESCROW_CONTRACT     = 0x0A3951414c4097AF78953a97e49ad38293e9eA17
NEXT_PUBLIC_STORAGE_PRIVATE_KEY       = 0x<new-rotated-key>
STORAGE_PRIVATE_KEY                   = 0x<new-rotated-key>
NEXT_PUBLIC_AI_AGENT_URL              = https://smartchain-ai-agent.onrender.com
STRIPE_SECRET_KEY                     = sk_test_...
STRIPE_WEBHOOK_SECRET                 = whsec_...
STRIPE_PUBLISHABLE_KEY                = pk_test_...
FLUTTERWAVE_SECRET_KEY                = FLWSECK_TEST-...
FLUTTERWAVE_WEBHOOK_HASH              = smartchain_flw_2026
```

---

<div align="center">

**SmartChain Hub** · Secrets & Security Guide

*The .env.local file is NOT in git. Rotate the 0G wallet key before going public.*

</div>
