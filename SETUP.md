# SmartChain Hub — Setup Checklist

Follow these steps in order. Each step maps to a gap that was fixed.

---

## Step 1 — Supabase (Gap 5: missing INSERT policies)

1. Go to your Supabase project → **SQL Editor → New query**
2. Paste and run `docs/backend/supabase_migration_001.sql`
3. Copy your project URL and anon key from **Settings → API**

---

## Step 2 — Frontend env (Gap 1 & 3)

```bash
cd smartchain_hub_frontend
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Settings → API
- `NEXT_PUBLIC_STORAGE_PRIVATE_KEY` — a funded 0G wallet private key (enables real 0G Storage uploads + agent memory)
- Leave `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_PAYMENTS_CONTRACT` blank until Step 3

---

## Step 3 — Deploy contracts (Gap 1: placeholder address)

```bash
cd blockchain
cp .env.example .env
# Edit .env → set PRIVATE_KEY to your funded 0G Mainnet wallet
npm install
npx hardhat run scripts/deploy.js --network og_mainnet
```

Copy the printed addresses back into `smartchain_hub_frontend/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=<SmartChainTransaction address>
NEXT_PUBLIC_PAYMENTS_CONTRACT=<SmartChainPayments address>
```

---

## Step 4 — AI Agent (Gap 2: OG_COMPUTE_API_KEY)

```bash
cd ai-agent
cp .env.example .env
# Edit .env → set OG_COMPUTE_API_KEY (from https://dashboard.0g.ai)
pip install -r requirements.txt
python3 server/app.py
```

Without `OG_COMPUTE_API_KEY` the server still works — it falls back to local TensorFlow.

---

## Step 5 — Start frontend

```bash
cd smartchain_hub_frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## What each gap fix does

| Gap | Fix | File(s) changed |
|-----|-----|-----------------|
| Contract address placeholder | `.env.local.example` + deploy instructions | `blockchain/.env.example`, `SETUP.md` |
| Hardcoded `localhost:5000` | Uses `NEXT_PUBLIC_AI_AGENT_URL` via `utils/api.ts` | `pages/transactions.tsx` |
| Storage key never used | `handleConfirm` now uploads to 0G Storage, saves `storage_root` | `pages/transactions.tsx` |
| No persistent agent memory | `utils/agentMemory.ts` — KV layer read/write, pre-fills form on load | `utils/agentMemory.ts`, `pages/transactions.tsx` |
| Missing INSERT policy | `supabase_migration_001.sql` adds INSERT policies + `storage_root` column | `docs/backend/supabase_migration_001.sql` |
| `dotenv` not loaded | Flask loads `.env`, Hardhat loads `.env` | `ai-agent/server/app.py`, `blockchain/hardhat.config.js` |
