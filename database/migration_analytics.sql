-- Migration: Add columns for withdrawal sourcing and on-chain balance tracking

-- 1. Update withdrawal_requests table
ALTER TABLE withdrawal_requests 
  ADD COLUMN sourcing_notes TEXT NULL,
  ADD COLUMN sourced_at TIMESTAMP NULL,
  ADD COLUMN completed_at TIMESTAMP NULL;

-- 2. Update wallets table
ALTER TABLE wallets
  ADD COLUMN balance_onchain DECIMAL(18,6) DEFAULT 0.000000,
  ADD COLUMN balance_synced_at TIMESTAMP NULL;
