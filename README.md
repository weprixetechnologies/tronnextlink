# Complete MLM System (Tron-based)

A full-stack Multi-Level Marketing (MLM) system built with Node.js, Express, PostgreSQL, and React (Vite). It features on-chain USDT (TRC-20) deposits, automated plan purchase logic, and a daily daily affiliate commission engine.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Frontend:** React (Vite) - User & Admin Panels
- **Blockchain:** TronWeb (TRC-20 USDT)
- **Auth:** JWT
- **Task Scheduling:** node-cron

## Project Structure
```
mlm-system/
├── backend/        # Express API + Cron Jobs
├── user-panel/     # React User Dashboard
├── admin-panel/    # React Admin Dashboard
└── database/       # SQL Schema
```

## Setup Instructions

### 1. Database Setup
1. Install PostgreSQL.
2. Create a database named `mlm_db`.
3. Run the SQL commands in `database/schema.sql` to initialize tables and seed default data.

### 2. Backend Configuration
1. Navigate to `backend/`.
2. Create a `.env` file based on `.env.example`.
3. Fill in your PostgreSQL credentials, JWT secret, TronGrid API key, and Master Wallet details.
4. Install dependencies: `npm install`.
5. Start the server: `node server.js`.

### 3. Frontend Setup (User Panel)
1. Navigate to `user-panel/`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`. (Port 5173 default)

### 4. Frontend Setup (Admin Panel)
1. Navigate to `admin-panel/`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev -- --port 5174`. (Port 5174 recommended)

## Key Features
- **Wallet Integration:** Automated USDT TRC-20 deposit detection via polling.
- **MLM Logic:** 75% Join Income to upline, 25% Platform Fee.
- **Affiliate Engine:** Daily 5% (L1) and 2% (L2) commissions with a $10 daily cap.
- **Secure Withdrawals:** User requests → Admin manual approval with txn hash.
- **Security:** AES-256 encrypted private keys, bcrypt hashed passwords, protected JWT routes.

## Admin Credentials (Initial Seed)
- **Email:** `admin@mlm.com`
- **Password:** `Admin@123` (Ensure the hash in `schema.sql` matches this or update accordingly)

## API Documentation Summary
- `/api/auth`: Signup, Login, Me
- `/api/plans`: Get active plans, Purchase plan
- `/api/wallet`: Balance, Transactions, Withdraw request
- `/api/network`: Tree view, Stats
- `/api/admin`: Dashboard, User management, Withdrawal processing, Ledger
# tronnextlink
