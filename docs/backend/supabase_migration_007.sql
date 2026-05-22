-- Migration 007 — add TEE attestation & ML columns to transactions
-- These columns are required by the AI optimizer and /proof page.
-- Run in the Supabase SQL editor before deploying the frontend.

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS tee_verified    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tee_proof       TEXT,
  ADD COLUMN IF NOT EXISTS tee_signer      TEXT,
  ADD COLUMN IF NOT EXISTS provider_id     TEXT,
  ADD COLUMN IF NOT EXISTS ml_engine       TEXT,
  ADD COLUMN IF NOT EXISTS zk_commitment   TEXT;

-- Index tee_verified for fast proof-feed queries (status = confirmed AND tee_verified = true)
CREATE INDEX IF NOT EXISTS idx_transactions_tee
  ON transactions (tee_verified)
  WHERE tee_verified = true;

-- Service-role read access for proof-feed (reads all confirmed rows, not just own)
DROP POLICY IF EXISTS "Service role can read all transactions" ON transactions;
CREATE POLICY "Service role can read all transactions"
  ON transactions FOR SELECT
  USING (true);
