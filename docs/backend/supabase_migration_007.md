# Supabase Migration 007 — TEE Attestation & ML Columns

Adds TEE attestation and ML proof columns to the `transactions` table.
Required by the AI optimizer and `/proof` page.

## How to Run

1. Go to your Supabase project → [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your SmartChain Hub project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Paste the SQL below and click **Run**

## SQL

```sql
-- Migration 007 — add TEE attestation & ML columns to transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS tee_verified    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tee_proof       TEXT,
  ADD COLUMN IF NOT EXISTS tee_signer      TEXT,
  ADD COLUMN IF NOT EXISTS provider_id     TEXT,
  ADD COLUMN IF NOT EXISTS ml_engine       TEXT,
  ADD COLUMN IF NOT EXISTS zk_commitment   TEXT;

-- Index tee_verified for fast proof-feed queries
CREATE INDEX IF NOT EXISTS idx_transactions_tee
  ON transactions (tee_verified)
  WHERE tee_verified = true;

-- Service-role read access for proof-feed
DROP POLICY IF EXISTS "Service role can read all transactions" ON transactions;
CREATE POLICY "Service role can read all transactions"
  ON transactions FOR SELECT
  USING (true);
```

## Columns Added

| Column | Type | Default | Description |
|---|---|---|---|
| `tee_verified` | BOOLEAN | FALSE | Whether inference was TEE-verified |
| `tee_proof` | TEXT | — | TEE attestation proof string |
| `tee_signer` | TEXT | — | TEE signer address |
| `provider_id` | TEXT | — | 0G Compute provider ID |
| `ml_engine` | TEXT | — | ML engine used (e.g. LLaMA 3.1 8B) |
| `zk_commitment` | TEXT | — | ZK proof commitment hash |
