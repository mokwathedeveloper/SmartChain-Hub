-- Safe migration — skips existing policies, only adds missing columns

-- Add storage_root column to transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS storage_root TEXT;

-- Add storage_scan_url column to transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS storage_scan_url TEXT;

-- Index on storage_root for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_storage_root
  ON transactions (storage_root)
  WHERE storage_root IS NOT NULL;
