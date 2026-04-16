# SmartChain Hub — QA & Test Plan

## Test Matrix

| Area | Test Type | Tool | Status |
|------|-----------|------|--------|
| Smart Contracts | Unit + Integration | Hardhat / Mocha | ✅ |
| AI Agent API | Unit | PyTest | ✅ |
| Frontend Components | Unit | Jest + RTL | ✅ |
| 0G Storage upload | Integration | Jest (mocked SDK) | ✅ |
| 0G Compute inference | Integration | PyTest (mocked broker) | ✅ |
| E2E user flow | E2E | Playwright | 🔜 |

---

## 1. Smart Contract Tests

```bash
cd blockchain
npm install
npx hardhat test
```

Tests cover:
- `recordTransaction` — stores tx, emits `TransactionRecorded`, reverts on duplicate hash
- `validateTransaction` — only owner can validate, reverts if already validated
- `distributeRevenue` — calculates 10% share correctly
- `claimEarnings` — transfers ETH, resets balance, reentrancy protection

```bash
# Coverage report
npx hardhat coverage
```

Expected coverage: **>90%** on both contracts.

---

## 2. AI Agent Tests

```bash
cd ai-agent
pip install pytest
pytest tests/ -v
```

Tests cover:
- `TransactionOptimizer.optimize()` — returns valid fee/savings/route for all priorities
- `SavingsModel.predict_savings()` — output in [0, 1] range
- `/optimize` endpoint — 200 with valid JSON, 400 on missing amount
- `/health` endpoint — returns `status: healthy`
- 0G Compute fallback — local TF used when `OG_COMPUTE_API_KEY` unset

---

## 3. Frontend Tests

```bash
cd smartchain_hub_frontend
npm test
```

Tests cover:
- `storage.ts` — `uploadMetadata` returns a non-empty string root hash
- `storageService` singleton — same instance returned on multiple calls
- Login form — renders email + password fields, submit calls supabase
- Transactions page — Optimize/Analyze/Simulate tabs render correct content

---

## 4. Critical Path Checklist (Manual)

Run through this before submission:

- [ ] Sign up with email → redirected to `/dashboard`
- [ ] Enter amount in Optimize tab → AI result appears with TEE badge
- [ ] Confirm transaction → row appears in Recommendations table
- [ ] Switch to Analyze tab → route breakdown chart renders
- [ ] Switch to Simulate tab → simulation result shows fee/time/risk
- [ ] Revenue page → donut chart renders, claim button visible if unclaimed
- [ ] Profile page → name saves to Supabase, email is read-only
- [ ] Blockchain page → search by tx hash filters correctly
- [ ] Contract deployed → ChainScan shows `TransactionRecorded` event

---

## 5. 0G Integration Proof Points

These must be visible in the demo video:

| Proof | Where to see it |
|-------|----------------|
| 0G Compute TEE badge | Transactions → Optimize tab result panel |
| 0G Storage root hash | Browser console log after confirming a transaction |
| 0G Chain event | ChainScan → contract address → Events tab |
| Mainnet contract | `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` |

---

## 6. Security Checklist

- [x] Private keys never in client-side code (storage key is server-side only)
- [x] Supabase RLS policies on all tables
- [x] Smart contracts use `ReentrancyGuard` on all state-changing functions
- [x] `onlyOwner` on admin functions (`validateTransaction`, `distributeRevenue`)
- [x] Input validation on AI agent endpoints (amount type check, null check)
