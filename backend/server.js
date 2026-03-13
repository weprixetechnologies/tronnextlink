const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Configs
const { pool } = require('./src/config/db');

// Services (Start cron jobs)
require('./src/services/depositPoller');
require('./src/services/affiliateCron');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/plans', require('./src/routes/plans'));
app.use('/api/wallet', require('./src/routes/wallet'));
app.use('/api/network', require('./src/routes/network'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/admin/analytics', require('./src/routes/analytics'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5100;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Basic DB connection test
    try {
        await pool.query('SELECT NOW()');
        console.log('MySQL connected successfully');
    } catch (err) {
        console.error('Database connection failed', err);
    }
});
