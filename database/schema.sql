-- MySQL / MariaDB compatible schema (Audit Corrected)

-- 1. users
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by VARCHAR(36),
  tron_address VARCHAR(100) UNIQUE NOT NULL,
  tron_private_key_encrypted TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',   -- active / blocked
  role VARCHAR(20) DEFAULT 'user',       -- user / admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referred_by) REFERENCES users(id)
);

-- 2. plans
CREATE TABLE plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  price_usdt DECIMAL(12,6) NOT NULL,
  slots INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. user_plans
CREATE TABLE user_plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  plan_id VARCHAR(36),
  slots_total INTEGER NOT NULL,
  slots_used INTEGER DEFAULT 0,
  slots_remaining INTEGER NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- 4. wallets
CREATE TABLE wallets (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) UNIQUE,
  balance_usdt DECIMAL(12,6) DEFAULT 0,
  total_earned DECIMAL(12,6) DEFAULT 0,
  total_withdrawn DECIMAL(12,6) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. transactions
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  from_user_id VARCHAR(36),
  to_user_id VARCHAR(36),
  type VARCHAR(50) NOT NULL,
  -- types: deposit / join_income / platform_fee /
  --        affiliate_l1 / affiliate_l2 / withdrawal
  amount DECIMAL(12,6) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  txn_hash VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- 6. deposits (tracks on-chain deposits to prevent double credit)
CREATE TABLE deposits (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  tron_txn_id VARCHAR(200) UNIQUE NOT NULL,
  amount_usdt DECIMAL(12,6) NOT NULL,
  from_address VARCHAR(100),
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. affiliate_daily_log
CREATE TABLE affiliate_daily_log (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  log_date DATE NOT NULL,
  total_affiliate_earned DECIMAL(12,6) DEFAULT 0,
  cap_remaining DECIMAL(12,6) DEFAULT 10.00,
  cap_reached BOOLEAN DEFAULT false,
  UNIQUE(user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. withdrawal_requests
CREATE TABLE withdrawal_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  amount DECIMAL(12,6) NOT NULL,
  to_tron_address VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  -- pending / approved / rejected
  admin_note TEXT,
  txn_hash VARCHAR(200),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. platform_earnings
CREATE TABLE platform_earnings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  source_user_id VARCHAR(36),
  amount DECIMAL(12,6) NOT NULL,
  type VARCHAR(50),   -- plan_fee / affiliate_payout
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_user_id) REFERENCES users(id)
);

-- Seed default plans
INSERT INTO plans (id, name, price_usdt, slots, description) VALUES
  ('plan-1', 'Starter', 20.00, 3, 'Entry level plan - 3 recruitment slots'),
  ('plan-2', 'Basic',   50.00, 6, 'Basic plan - 6 recruitment slots'),
  ('plan-3', 'Pro',    100.00, 12, 'Pro plan - 12 recruitment slots'),
  ('plan-4', 'Elite',  200.00, 24, 'Elite plan - 24 recruitment slots');

-- Seed Admin User
-- Password: Admin@123
INSERT INTO users (id, full_name, email, password_hash, referral_code, tron_address, tron_private_key_encrypted, role) VALUES
  ('admin-uuid', 'Admin', 'admin@mlm.com', '$2b$10$RpR2Z8eW1JogkMyJqgQhKOT8H4MPqG1/035Uhq/YCIkkYS9pk/0Yy', 'ADMIN001', 'TAdminAddressXXXXXXXXXXXXXXX0001', 'ENCRYPTED_PRIVATE_KEY', 'admin');

-- Seed Admin Wallet
INSERT INTO wallets (id, user_id, balance_usdt) VALUES
  ('admin-wallet-uuid', 'admin-uuid', 10000.00);
