const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../config/db');
const { generateWallet } = require('../services/tronService');
const { encrypt } = require('../utils/encrypt');
const { generateReferralCode, formatResponse } = require('../utils/helpers');
require('dotenv').config();

const signup = async (req, res) => {
    const { full_name, email, password, referral_code } = req.body;

    if (!full_name || !email || !password || !referral_code) {
        return res.status(400).json(formatResponse(false, {}, 'All fields are required'));
    }

    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        // 1. Check if email already exists
        const [userRows] = await client.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length > 0) {
            throw new Error('Email already registered');
        }

        // 2. Find referral owner (upline)
        const [uplineRows] = await client.execute('SELECT id FROM users WHERE referral_code = ?', [referral_code]);
        if (uplineRows.length === 0) {
            throw new Error('Invalid referral code');
        }
        const referredBy = uplineRows[0].id;

        // 3. Generate new user data
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        const newReferralCode = generateReferralCode(8);
        const tronWallet = await generateWallet();
        const encryptedPrivateKey = encrypt(tronWallet.privateKey);

        // 4. Insert user
        await client.execute(
            `INSERT INTO users (id, full_name, email, password_hash, referral_code, referred_by, tron_address, tron_private_key_encrypted) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, full_name, email, passwordHash, newReferralCode, referredBy, tronWallet.address, encryptedPrivateKey]
        );

        // 5. Initialize wallet
        await client.execute('INSERT INTO wallets (id, user_id) VALUES (?, ?)', [uuidv4(), userId]);

        await client.commit();

        // 6. Generate JWT
        const token = jwt.sign(
            { id: userId, email: email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json(formatResponse(true, {
            token,
            user: {
                id: userId,
                full_name,
                email,
                role: 'user',
                referral_code: newReferralCode,
                tron_address: tronWallet.address,
                status: 'active',
                active_plan_id: null
            }
        }, 'Registration successful'));
    } catch (error) {
        await client.rollback();
        res.status(400).json(formatResponse(false, {}, error.message));
    } finally {
        client.release();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json(formatResponse(false, {}, 'Invalid email or password'));
        }

        if (user.status === 'blocked') {
            return res.status(403).json(formatResponse(false, {}, 'Your account has been blocked'));
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Fetch user's active plan if any
        const [planRows] = await pool.execute('SELECT plan_id FROM user_plans WHERE user_id = ? AND is_active = true LIMIT 1', [user.id]);
        const activePlanId = planRows[0]?.plan_id || null;

        res.json(formatResponse(true, {
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                referral_code: user.referral_code,
                tron_address: user.tron_address,
                status: user.status,
                active_plan_id: activePlanId
            }
        }, 'Login successful'));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getMe = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT u.id, u.full_name, u.email, u.role, u.referral_code, u.tron_address, u.status, up.plan_id as active_plan_id
             FROM users u
             LEFT JOIN user_plans up ON u.id = up.user_id AND up.is_active = true
             WHERE u.id = ?`,
            [req.user.id]
        );
        res.json(formatResponse(true, rows[0]));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const updateProfile = async (req, res) => {
    const { full_name } = req.body;
    const userId = req.user.id;

    if (!full_name) {
        return res.status(400).json(formatResponse(false, {}, 'Full name is required'));
    }

    try {
        await pool.execute('UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?', [full_name, userId]);
        const [rows] = await pool.execute(
            'SELECT id, full_name, email, role, referral_code, tron_address, status FROM users WHERE id = ?',
            [userId]
        );
        res.json(formatResponse(true, rows[0], 'Profile updated successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(current_password, user.password_hash))) {
            return res.status(401).json(formatResponse(false, {}, 'Current password incorrect'));
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await pool.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, userId]);

        res.json(formatResponse(true, {}, 'Password updated successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

const getReferrer = async (req, res) => {
    const { referralCode } = req.params;

    try {
        const [rows] = await pool.execute('SELECT full_name FROM users WHERE referral_code = ?', [referralCode]);
        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, {}, 'Referrer not found'));
        }
        res.json(formatResponse(true, { name: rows[0].full_name }));
    } catch (error) {
        res.status(500).json(formatResponse(false, {}, 'Server error'));
    }
};

module.exports = {
    signup,
    login,
    getMe,
    updateProfile,
    changePassword,
    getReferrer
};
