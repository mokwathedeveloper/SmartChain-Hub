-- Migration 005 — confirm existing pending transactions
-- Transactions with a valid storage_root have been confirmed via 0G Storage
-- Update them to confirmed status

UPDATE transactions
SET status = 'confirmed'
WHERE status = 'pending'
  AND storage_root IS NOT NULL
  AND storage_root != '';

-- For transactions without storage_root (older ones), also confirm them
-- since they were manually created and represent real optimizations
UPDATE transactions
SET status = 'confirmed'
WHERE status = 'pending'
  AND amount > 0
  AND savings > 0;
