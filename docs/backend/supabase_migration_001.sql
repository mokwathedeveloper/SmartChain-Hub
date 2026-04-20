-- ── Migration: fix missing INSERT policies + add storage_root column ──────────
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. Allow users to insert their own transactions (was missing — caused silent failures)
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to insert their own profile (needed on first signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Add storage_root column to transactions (stores 0G Storage Merkle root hash)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS storage_root TEXT;

-- 4. Add storage_scan_url for direct link to storagescan explorer
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS storage_scan_url TEXT;

-- 5. Index on storage_root for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_storage_root
  ON transactions (storage_root)
  WHERE storage_root IS NOT NULL;
