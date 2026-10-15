const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { initDB, getPool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve only the frontend files; keep server code and environment files private.
app.use(express.static(path.join(__dirname, '../client')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Travel Planner API' });
});

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail
      }
    });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return res.status(500).json({ error: 'Server error while registering user.' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error in /api/login:', err);
    return res.status(500).json({ error: 'Server error while logging in.' });
  }
});

// ─── TRIP CART APIs ────────────────────────────────────────────────────────

// Save (add) a destination to the user's cart in MySQL
app.post('/api/trips/save', async (req, res) => {
  try {
    const { userId, destination } = req.body;
    if (!userId || !destination) {
      return res.status(400).json({ error: 'userId and destination are required.' });
    }
    const pool = getPool();
    await pool.query(
      `INSERT INTO saved_trips
         (user_id, destination_id, destination_name, category, image_url, price, duration, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE added_at = NOW()`,
      [
        userId,
        destination.id,
        destination.name,
        destination.category || null,
        destination.img || null,
        destination.price || 0,
        destination.duration || null,
        destination.rating || 0
      ]
    );
    return res.json({ success: true, message: 'Destination saved to your trip cart.' });
  } catch (err) {
    console.error('Error in /api/trips/save:', err);
    return res.status(500).json({ error: 'Server error while saving trip.' });
  }
});

// Remove a destination from the user's cart in MySQL
app.delete('/api/trips/remove', async (req, res) => {
  try {
    const { userId, destinationId } = req.body;
    if (!userId || !destinationId) {
      return res.status(400).json({ error: 'userId and destinationId are required.' });
    }
    const pool = getPool();
    await pool.query(
      'DELETE FROM saved_trips WHERE user_id = ? AND destination_id = ?',
      [userId, destinationId]
    );
    return res.json({ success: true, message: 'Destination removed from your trip cart.' });
  } catch (err) {
    console.error('Error in /api/trips/remove:', err);
    return res.status(500).json({ error: 'Server error while removing trip.' });
  }
});

// Fetch all saved trips for a user from MySQL
app.get('/api/trips/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT destination_id AS id, destination_name AS name, category, image_url AS img,
              price, duration, rating, added_at
       FROM saved_trips WHERE user_id = ? ORDER BY added_at DESC`,
      [userId]
    );
    return res.json({ success: true, trips: rows });
  } catch (err) {
    console.error('Error in /api/trips/:userId:', err);
    return res.status(500).json({ error: 'Server error while fetching trips.' });
  }
});

// Start server after initializing DB
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Could not connect to MySQL. Ensure MySQL is running and .env credentials are correct.');
    console.error('Database error:', err.message);
  });
