const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { initDB, getPool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_DURATION_DAYS = 30;

app.use(cors());
app.use(express.json());

function getBearerToken(req) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+([a-f0-9]{64})$/i);
  return match ? match[1] : null;
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.role
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    req.authUser = user;
    return next();
  } catch (err) {
    console.error('Error authenticating request:', err);
    return res.status(500).json({ error: 'Unable to verify your session.' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Administrator access is required.' });
    req.authUser = user;
    return next();
  } catch (err) {
    console.error('Error authenticating administrator request:', err);
    return res.status(500).json({ error: 'Unable to verify administrator session.' });
  }
}

const fs = require('fs');
const clientDir = fs.existsSync(path.join(__dirname, '../client'))
  ? path.join(__dirname, '../client')
  : path.join(__dirname, 'client');

// Serve only the frontend files; keep server code and environment files private.
app.use(express.static(clientDir));

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

    // Prevent anyone from claiming the admin email
    if (cleanEmail === 'admin@gmail.com') {
      return res.status(400).json({ error: 'The email admin@gmail.com is reserved exclusively for the system administrator.' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user as customer
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "customer")',
      [name.trim(), cleanEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        role: 'customer'
      }
    });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return res.status(500).json({ error: 'Server error while registering user.' });
  }
});

// Customer Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [cleanEmail]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
      [tokenHash, user.id, expiresAt]
    );

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      }
    });
  } catch (err) {
    console.error('Error in /api/login:', err);
    return res.status(500).json({ error: 'Server error while logging in.' });
  }
});

// Dedicated Admin Login (Strictly restricted to the single Admin account)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Access Denied: Invalid administrator credentials.' });
    }

    const user = rows[0];

    // BLOCK regular customers from accessing admin login
    if (user.role !== 'admin' || cleanEmail !== 'admin@gmail.com') {
      return res.status(403).json({
        error: 'Access Denied: This is a customer account. Customers cannot access the Admin Portal.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Access Denied: Invalid administrator credentials.' });
    }

    const adminToken = crypto.randomBytes(32).toString('hex');
    const adminTokenHash = crypto.createHash('sha256').update(adminToken).digest('hex');
    const adminExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
      [adminTokenHash, user.id, adminExpiresAt]
    );

    return res.json({
      success: true,
      message: 'Administrator authenticated successfully!',
      adminToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Error in /api/admin/login:', err);
    return res.status(500).json({ error: 'Server error during admin authentication.' });
  }
});

async function createNotification({
  userId,
  title,
  message,
  type,
  bookingId = null,
  plannedTripId = null,
  dedupeKey
}) {
  if (!userId || !dedupeKey) return;
  const pool = getPool();
  await pool.query(
    `INSERT IGNORE INTO notifications
       (user_id, title, message, notification_type, booking_id, planned_trip_id, dedupe_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, message, type, bookingId, plannedTripId, dedupeKey]
  );
}

function parseDateKey(value) {
  if (!value) return null;
  const directDate = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDate) return directDate[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function runScheduledNotifications() {
  const pool = getPool();
  const [upcomingBookings] = await pool.query(
    `SELECT id, user_id, destination_name, trip_start_date
     FROM bookings
     WHERE user_id IS NOT NULL
       AND status = 'Approved'
       AND trip_start_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
  );
  for (const booking of upcomingBookings) {
    await createNotification({
      userId: booking.user_id,
      title: `Your ${booking.destination_name} trip is tomorrow`,
      message: `Your approved trip to ${booking.destination_name} starts tomorrow. Check your hotel details, transport arrangements, budget, and itinerary before departure.`,
      type: 'trip_reminder',
      bookingId: booking.id,
      dedupeKey: `trip-reminder:${booking.id}`
    });
  }

  const [completedBookings] = await pool.query(
    `SELECT id, user_id, destination_name
     FROM bookings
     WHERE user_id IS NOT NULL
       AND status = 'Approved'
       AND trip_start_date IS NOT NULL
       AND DATE_ADD(trip_start_date, INTERVAL duration_days DAY) <= CURDATE()`
  );
  for (const booking of completedBookings) {
    await createNotification({
      userId: booking.user_id,
      title: `How was your trip to ${booking.destination_name}?`,
      message: 'Share your experience with a quick destination or hotel review.',
      type: 'post_trip_review',
      bookingId: booking.id,
      dedupeKey: `post-trip-review:${booking.id}`
    });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const [plans] = await pool.query(
    `SELECT id, user_id, destination_id, destination_name, start_date, itinerary_data
     FROM planned_trips
     WHERE user_id IS NOT NULL
       AND start_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       AND itinerary_data IS NOT NULL
       AND itinerary_data != ''`
  );
  const itineraryReminders = new Map();
  for (const plan of plans) {
    let itinerary;
    try {
      itinerary = JSON.parse(plan.itinerary_data);
    } catch (err) {
      console.warn(`[Notifications] Skipping invalid itinerary JSON for planned trip ${plan.id}.`);
      continue;
    }
    if (!Array.isArray(itinerary)) continue;

    const activities = itinerary
      .filter(day => parseDateKey(day.dateISO || day.date) === tomorrowKey)
      .flatMap(day => Array.isArray(day.activities) ? day.activities : [])
      .map(activity => activity.name)
      .filter(name => typeof name === 'string' && name.trim());
    if (!activities.length) continue;

    const reminderKey = `${plan.user_id}:${plan.destination_id}:${tomorrowKey}`;
    const reminder = itineraryReminders.get(reminderKey) || {
      userId: plan.user_id,
      destinationName: plan.destination_name,
      plannedTripId: plan.id,
      activities: []
    };
    reminder.activities.push(...activities);
    itineraryReminders.set(reminderKey, reminder);
  }

  for (const [reminderKey, reminder] of itineraryReminders) {
    await createNotification({
      userId: reminder.userId,
      title: `Tomorrow's itinerary in ${reminder.destinationName}`,
      message: `Your scheduled sightseeing activities: ${[...new Set(reminder.activities)].slice(0, 8).join(', ')}. Review your itinerary and timings before heading out.`,
      type: 'itinerary_reminder',
      plannedTripId: reminder.plannedTripId,
      dedupeKey: `itinerary-reminder:${reminderKey}`
    });
  }

  await pool.query('DELETE FROM user_sessions WHERE expires_at <= NOW()');
}

app.get('/api/reviews/eligible-bookings', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [bookings] = await pool.query(
      `SELECT id, destination_name, hotel_name, trip_start_date, duration_days
       FROM bookings
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.authUser.id]
    );
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error('Error in GET /api/reviews/eligible-bookings:', err);
    return res.status(500).json({ error: 'Unable to load trips eligible for review.' });
  }
});

app.post('/api/reviews', requireAuth, async (req, res) => {
  try {
    const rawBookingId = req.body.bookingId;
    const bookingId = rawBookingId ? Number(rawBookingId) : null;
    let targetType = String(req.body.targetType || '').trim().toLowerCase();
    let targetName = typeof req.body.targetName === 'string' ? req.body.targetName.trim() : '';
    const rating = Number(req.body.rating);
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const tripType = typeof req.body.tripType === 'string' ? req.body.tripType.trim() : 'Solo';
    const tripTypes = ['Solo', 'Friends', 'Family', 'Couple'];

    if (!['destination', 'hotel'].includes(targetType)) {
      targetType = 'destination';
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars.' });
    }
    if (title.length < 3 || title.length > 120) {
      return res.status(400).json({ error: 'Review title must be between 3 and 120 characters.' });
    }
    if (description.length < 10 || description.length > 3000) {
      return res.status(400).json({ error: 'Review description must be between 10 and 3000 characters.' });
    }
    if (!tripTypes.includes(tripType)) {
      return res.status(400).json({ error: 'Choose a valid trip type.' });
    }

    const pool = getPool();
    let destinationId = null;
    let visitDate = req.body.visitDate ? String(req.body.visitDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
    let validatedBookingId = null;

    if (bookingId && Number.isInteger(bookingId) && bookingId > 0) {
      const [bookings] = await pool.query(
        `SELECT id, destination_id, destination_name, hotel_name, trip_start_date
         FROM bookings
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [bookingId, req.authUser.id]
      );
      if (bookings.length > 0) {
        validatedBookingId = bookings[0].id;
        destinationId = bookings[0].destination_id;
        if (!targetName) {
          targetName = targetType === 'destination' ? bookings[0].destination_name : bookings[0].hotel_name;
        }
        if (bookings[0].trip_start_date) {
          visitDate = bookings[0].trip_start_date;
        }
      }
    }

    if (!targetName) {
      return res.status(400).json({ error: 'Please choose or enter a destination or hotel to review.' });
    }

    // Try finding destination_id if not set
    if (!destinationId && targetType === 'destination') {
      try {
        const [dRows] = await pool.query('SELECT id FROM destinations WHERE LOWER(name) = LOWER(?) LIMIT 1', [targetName]);
        if (dRows.length > 0) destinationId = dRows[0].id;
      } catch (_) {}
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO reviews
           (user_id, booking_id, destination_id, target_type, target_name,
            rating, title, description, trip_type, visit_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.authUser.id,
          validatedBookingId,
          destinationId,
          targetType,
          targetName,
          rating,
          title,
          description,
          tripType,
          visitDate
        ]
      );
      return res.status(201).json({ success: true, reviewId: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `You have already reviewed this ${targetType}.` });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error in POST /api/reviews:', err);
    return res.status(500).json({ error: 'Unable to submit your review.' });
  }
});

app.get('/api/reviews/targets', async (req, res) => {
  const fallbackList = [
    { targetType: 'destination', targetName: 'Goa' },
    { targetType: 'destination', targetName: 'Manali' },
    { targetType: 'destination', targetName: 'Jaipur' },
    { targetType: 'destination', targetName: 'Kerala Backwaters (Alleppey)' },
    { targetType: 'destination', targetName: 'Varanasi' },
    { targetType: 'destination', targetName: 'Udaipur' },
    { targetType: 'destination', targetName: 'Agra' },
    { targetType: 'destination', targetName: 'Leh Ladakh' },
    { targetType: 'hotel', targetName: 'Taj Fort Aguada Resort' },
    { targetType: 'hotel', targetName: 'The Himalayan Resort & Spa' },
    { targetType: 'hotel', targetName: 'Rambagh Palace' },
    { targetType: 'hotel', targetName: 'Kumarakom Lake Resort' },
    { targetType: 'hotel', targetName: 'The Oberoi Amarvilas' }
  ];

  try {
    const pool = getPool();
    const [targets] = await pool.query(
      `SELECT DISTINCT target_type AS targetType, target_name AS targetName
       FROM (
         SELECT 'destination' AS target_type, name AS target_name FROM custom_destinations WHERE name IS NOT NULL AND name != ''
         UNION ALL
         SELECT 'destination' AS target_type, destination_name AS target_name FROM bookings WHERE destination_name IS NOT NULL AND destination_name != ''
         UNION ALL
         SELECT 'hotel' AS target_type, hotel_name AS target_name FROM bookings WHERE hotel_name IS NOT NULL AND hotel_name != ''
         UNION ALL
         SELECT target_type, target_name FROM reviews WHERE target_name IS NOT NULL AND target_name != ''
       ) AS review_targets
       ORDER BY targetType, targetName`
    );

    const targetMap = new Map();
    fallbackList.forEach(t => targetMap.set(`${t.targetType}|${t.targetName}`, t));
    (targets || []).forEach(t => {
      if (t.targetType && t.targetName) {
        targetMap.set(`${t.targetType}|${t.targetName}`, { targetType: t.targetType, targetName: t.targetName });
      }
    });

    return res.json({ success: true, targets: [...targetMap.values()] });
  } catch (err) {
    console.error('Error in GET /api/reviews/targets:', err);
    return res.json({ success: true, targets: fallbackList });
  }
});

app.get('/api/reviews/summary', async (req, res) => {
  try {
    const targetType = String(req.query.targetType || '').trim().toLowerCase();
    const targetName = String(req.query.targetName || '').trim();
    if (!['destination', 'hotel'].includes(targetType) || !targetName || targetName.length > 150) {
      return res.status(400).json({ error: 'Choose a valid destination or hotel.' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS totalReviews, ROUND(AVG(rating), 1) AS averageRating
       FROM reviews WHERE target_type = ? AND target_name = ?`,
      [targetType, targetName]
    );
    return res.json({
      success: true,
      totalReviews: Number(rows[0].totalReviews),
      averageRating: Number(rows[0].averageRating || 0)
    });
  } catch (err) {
    console.error('Error in GET /api/reviews/summary:', err);
    return res.status(500).json({ error: 'Unable to load the review summary.' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const targetType = String(req.query.targetType || '').trim().toLowerCase();
    const targetName = String(req.query.targetName || '').trim();
    const rating = req.query.rating ? Number(req.query.rating) : null;
    const sort = req.query.sort === 'highest' ? 'highest' : 'newest';
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    if (targetType && !['destination', 'hotel'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid review target type.' });
    }
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating filter must be between 1 and 5.' });
    }
    if (targetName.length > 150) {
      return res.status(400).json({ error: 'Review target is too long.' });
    }

    const filters = [];
    const values = [];
    if (targetType) { filters.push('r.target_type = ?'); values.push(targetType); }
    if (targetName) { filters.push('r.target_name = ?'); values.push(targetName); }
    if (rating !== null) { filters.push('r.rating = ?'); values.push(rating); }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const pool = getPool();
    const orderBy = sort === 'highest' ? 'r.rating DESC, r.created_at DESC' : 'r.created_at DESC';
    const [reviews] = await pool.query(
      `SELECT r.id, r.target_type AS targetType, r.target_name AS targetName,
              r.rating, r.title, r.description, r.trip_type AS tripType,
              r.visit_date AS visitDate, r.created_at AS createdAt, u.name AS reviewerName
       FROM reviews r JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...values, limit, (page - 1) * limit]
    );
    return res.json({ success: true, reviews, page, hasMore: reviews.length === limit });
  } catch (err) {
    console.error('Error in GET /api/reviews:', err);
    return res.status(500).json({ error: 'Unable to load reviews.' });
  }
});

app.get('/api/notifications/unread-count', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.authUser.id]
    );
    return res.json({ success: true, unreadCount: Number(rows[0].unreadCount) });
  } catch (err) {
    console.error('Error in GET /api/notifications/unread-count:', err);
    return res.status(500).json({ error: 'Unable to load unread notification count.' });
  }
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const pool = getPool();
    const [notifications] = await pool.query(
      `SELECT id, title, message, notification_type AS type, is_read AS isRead,
              booking_id AS bookingId, planned_trip_id AS plannedTripId, created_at AS createdAt
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [req.authUser.id, limit, (page - 1) * limit]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.authUser.id]
    );
    return res.json({
      success: true,
      notifications,
      unreadCount: Number(countRows[0].unreadCount),
      page,
      hasMore: notifications.length === limit
    });
  } catch (err) {
    console.error('Error in GET /api/notifications:', err);
    return res.status(500).json({ error: 'Unable to load notifications.' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({ error: 'Invalid notification ID.' });
    }
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, req.authUser.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error in PATCH /api/notifications/:id/read:', err);
    return res.status(500).json({ error: 'Unable to mark notification as read.' });
  }
});

// Fetch a single booking for the authenticated user to show confirmed ticket & receipt
app.get('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId) || bookingId < 1) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM bookings WHERE id = ? AND (user_id = ? OR ? = 'admin') LIMIT 1`,
      [bookingId, req.authUser.id, req.authUser.role]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error('Error in GET /api/bookings/:id:', err);
    return res.status(500).json({ error: 'Unable to fetch booking details.' });
  }
});

app.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [req.authUser.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Error in PATCH /api/notifications/read-all:', err);
    return res.status(500).json({ error: 'Unable to mark notifications as read.' });
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

// ─── PLANNED TRIPS & CUSTOM ITINERARY APIs ─────────────────────────────────

// 1. Create or Save a Planned Trip
app.post('/api/planned-trips', async (req, res) => {
  try {
    const {
      id,
      userId,
      title,
      destinationId,
      destinationName,
      startDate,
      durationDays,
      travellers,
      groupType,
      paceStyle,
      budget,
      activityCost,
      hotelName,
      hotelPrice,
      transportName,
      transportPrice,
      interests,
      itineraryData,
      notes,
      status
    } = req.body;

    if (!destinationName) {
      return res.status(400).json({ error: 'Destination name is required.' });
    }

    let savedPlanUserId = null;
    if (userId) {
      const authenticatedUser = await getAuthenticatedUser(req);
      if (!authenticatedUser) {
        return res.status(401).json({ error: 'Please log in again before saving a trip plan.' });
      }
      if (Number(userId) !== authenticatedUser.id) {
        return res.status(403).json({ error: 'You can only save plans to your own account.' });
      }
      savedPlanUserId = authenticatedUser.id;
    }

    const pool = getPool();
    const finalTitle = title ? title.trim() : `${durationDays || 3}-Day ${destinationName} Plan`;
    const finalInterests = typeof interests === 'object' ? JSON.stringify(interests) : (interests || '');
    const finalItinerary = typeof itineraryData === 'object' ? JSON.stringify(itineraryData) : (itineraryData || '[]');
    const finalStatus = status || 'Planning';

    if (id) {
      // Update existing planned trip
      await pool.query(
        `UPDATE planned_trips SET
           title = ?, destination_id = ?, destination_name = ?, start_date = ?,
           duration_days = ?, travellers = ?, group_type = ?, pace_style = ?,
           budget = ?, activity_cost = ?, hotel_name = ?, hotel_price = ?,
           transport_name = ?, transport_price = ?, interests = ?,
           itinerary_data = ?, notes = ?, status = ?
         WHERE id = ? AND user_id <=> ?`,
        [
          finalTitle,
          destinationId || 1,
          destinationName.trim(),
          startDate || '',
          durationDays || 3,
          travellers || 1,
          groupType || 'solo',
          paceStyle || 'balanced',
          budget || 0,
          activityCost || 0,
          hotelName || '',
          hotelPrice || 0,
          transportName || '',
          transportPrice || 0,
          finalInterests,
          finalItinerary,
          notes || '',
          finalStatus,
          id,
          savedPlanUserId
        ]
      );
      const [updatedPlan] = await pool.query(
        'SELECT id FROM planned_trips WHERE id = ? AND user_id <=> ? LIMIT 1',
        [id, savedPlanUserId]
      );
      if (!updatedPlan.length) {
        return res.status(404).json({ error: 'Trip plan not found.' });
      }
      const estimatedCost = Number(activityCost || 0) + Number(hotelPrice || 0) + Number(transportPrice || 0);
      if (savedPlanUserId && Number(budget) > 0 && estimatedCost > Number(budget)) {
        await createNotification({
          userId: savedPlanUserId,
          title: `Budget alert for ${destinationName.trim()}`,
          message: `Your estimated trip cost of ₹${estimatedCost.toLocaleString('en-IN')} is above your selected budget of ₹${Number(budget).toLocaleString('en-IN')}.`,
          type: 'budget_alert',
          plannedTripId: id,
          dedupeKey: `budget-alert:plan:${id}`
        });
      }

      return res.json({
        success: true,
        message: 'Trip plan updated successfully!',
        planId: id
      });
    } else {
      // Insert new planned trip
      const [result] = await pool.query(
        `INSERT INTO planned_trips
           (user_id, title, destination_id, destination_name, start_date,
            duration_days, travellers, group_type, pace_style, budget,
            activity_cost, hotel_name, hotel_price, transport_name,
            transport_price, interests, itinerary_data, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          savedPlanUserId,
          finalTitle,
          destinationId || 1,
          destinationName.trim(),
          startDate || '',
          durationDays || 3,
          travellers || 1,
          groupType || 'solo',
          paceStyle || 'balanced',
          budget || 0,
          activityCost || 0,
          hotelName || '',
          hotelPrice || 0,
          transportName || '',
          transportPrice || 0,
          finalInterests,
          finalItinerary,
          notes || '',
          finalStatus
        ]
      );

      const estimatedCost = Number(activityCost || 0) + Number(hotelPrice || 0) + Number(transportPrice || 0);
      if (savedPlanUserId && Number(budget) > 0 && estimatedCost > Number(budget)) {
        await createNotification({
          userId: savedPlanUserId,
          title: `Budget alert for ${destinationName.trim()}`,
          message: `Your estimated trip cost of ₹${estimatedCost.toLocaleString('en-IN')} is above your selected budget of ₹${Number(budget).toLocaleString('en-IN')}.`,
          type: 'budget_alert',
          plannedTripId: result.insertId,
          dedupeKey: `budget-alert:plan:${result.insertId}`
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Trip plan saved successfully! You can access and manage it anytime.',
        planId: result.insertId
      });
    }
  } catch (err) {
    console.error('Error in POST /api/planned-trips:', err);
    return res.status(500).json({ error: 'Server error while saving planned trip.' });
  }
});

// 2. Fetch all planned trips for a user
app.get('/api/planned-trips/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM planned_trips WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );

    const plans = rows.map(p => {
      let parsedItinerary = [];
      let parsedInterests = [];
      try { parsedItinerary = JSON.parse(p.itinerary_data || '[]'); } catch (_) {}
      try { parsedInterests = JSON.parse(p.interests || '[]'); } catch (_) {
        parsedInterests = p.interests ? p.interests.split(',') : [];
      }
      return {
        ...p,
        itineraryData: parsedItinerary,
        interests: parsedInterests
      };
    });

    return res.json({ success: true, plans });
  } catch (err) {
    console.error('Error in GET /api/planned-trips/user/:userId:', err);
    return res.status(500).json({ error: 'Server error while fetching planned trips.' });
  }
});

// 3. Fetch single planned trip details
app.get('/api/planned-trips/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM planned_trips WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip plan not found.' });
    }
    const plan = rows[0];
    let parsedItinerary = [];
    let parsedInterests = [];
    try { parsedItinerary = JSON.parse(plan.itinerary_data || '[]'); } catch (_) {}
    try { parsedInterests = JSON.parse(plan.interests || '[]'); } catch (_) {
      parsedInterests = plan.interests ? plan.interests.split(',') : [];
    }

    return res.json({
      success: true,
      plan: {
        ...plan,
        itineraryData: parsedItinerary,
        interests: parsedInterests
      }
    });
  } catch (err) {
    console.error('Error in GET /api/planned-trips/detail/:id:', err);
    return res.status(500).json({ error: 'Server error while fetching trip plan detail.' });
  }
});

// 4. Delete planned trip
app.delete('/api/planned-trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM planned_trips WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Trip plan deleted successfully.' });
  } catch (err) {
    console.error('Error in DELETE /api/planned-trips/:id:', err);
    return res.status(500).json({ error: 'Server error while deleting trip plan.' });
  }
});

const {
  sendTripPlannedEmail,
  sendTripApprovedEmail,
  sendCustomNotificationEmail
} = require('./emailService');

// ─── BOOKINGS & APPROVAL APIs ─────────────────────────────────────────────

// 1. Create a customer booking / trip plan
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      destinationId,
      destinationName,
      hotelName,
      hotelPrice,
      transportName,
      transportPrice,
      totalPrice,
      receiptNo,
      tripStartDate,
      durationDays,
      itineraryData,
      budget
    } = req.body;

    if (!customerName || !customerEmail || !destinationName) {
      return res.status(400).json({ error: 'Customer name, email, and destination are required.' });
    }
    const startDate = typeof tripStartDate === 'string' ? tripStartDate.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(new Date(`${startDate}T00:00:00`).getTime())) {
      return res.status(400).json({ error: 'Choose a valid trip start date.' });
    }
    const tripDays = Number(durationDays);
    if (!Number.isInteger(tripDays) || tripDays < 1 || tripDays > 60) {
      return res.status(400).json({ error: 'Trip duration must be between 1 and 60 days.' });
    }

    let bookingUserId = null;
    if (userId || getBearerToken(req)) {
      const authenticatedUser = await getAuthenticatedUser(req);
      if (!authenticatedUser) {
        return res.status(401).json({ error: 'Please log in again before booking.' });
      }
      if (userId && Number(userId) !== authenticatedUser.id) {
        return res.status(403).json({ error: 'A booking can only be associated with your own account.' });
      }
      bookingUserId = authenticatedUser.id;
    }

    const pool = getPool();
    const [dateCheck] = await pool.query(
      'SELECT (? >= CURDATE()) AS valid_start_date',
      [startDate]
    );
    if (!dateCheck[0].valid_start_date) {
      return res.status(400).json({ error: 'Trip start date must be today or later.' });
    }
    const finalReceiptNo = receiptNo || ('STP-' + Date.now().toString().slice(-6));

    const [result] = await pool.query(
      `INSERT INTO bookings
        (user_id, customer_name, customer_email, customer_phone, customer_address,
         destination_id, destination_name, hotel_name, hotel_price, transport_name,
         transport_price, total_price, receipt_no, status, trip_start_date,
         duration_days, itinerary_data, budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`,
      [
        bookingUserId,
        customerName.trim(),
        customerEmail.trim(),
        customerPhone || '',
        customerAddress || '',
        destinationId || 1,
        destinationName.trim(),
        hotelName || '',
        hotelPrice || 0,
        transportName || '',
        transportPrice || 0,
        totalPrice || 0,
        finalReceiptNo,
        startDate,
        tripDays,
        typeof itineraryData === 'string' ? itineraryData : JSON.stringify(itineraryData || []),
        Math.max(0, Number(budget) || 0)
      ]
    );

    const booking = {
      id: result.insertId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      destination_name: destinationName,
      hotel_name: hotelName,
      transport_name: transportName,
      total_price: totalPrice,
      receipt_no: finalReceiptNo,
      status: 'Pending'
    };

    const selectedBudget = Number(budget) || 0;
    if (bookingUserId && selectedBudget > 0 && Number(totalPrice || 0) > selectedBudget) {
      await createNotification({
        userId: bookingUserId,
        title: `Budget alert for ${destinationName.trim()}`,
        message: `Your booking estimate of ₹${Number(totalPrice).toLocaleString('en-IN')} is above your selected budget of ₹${selectedBudget.toLocaleString('en-IN')}.`,
        type: 'budget_alert',
        bookingId: result.insertId,
        dedupeKey: `budget-alert:booking:${result.insertId}`
      });
    }

    // Send email notification to customer that trip is planned & under review
    try {
      await sendTripPlannedEmail(booking);
    } catch (mailErr) {
      console.error('Failed to send trip planned email:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Trip plan submitted! Notification email sent to your email address.',
      booking
    });
  } catch (err) {
    console.error('Error in POST /api/bookings:', err);
    return res.status(500).json({ error: 'Server error while creating booking.' });
  }
});

// 2. Fetch all bookings for Admin
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );
    return res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error('Error in GET /api/admin/bookings:', err);
    return res.status(500).json({ error: 'Server error while fetching bookings.' });
  }
});

// 3. Admin updates booking status (Approve / Reject)
app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved', 'Rejected', 'Pending'

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = rows[0];

    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    let emailSent = booking.email_sent;
    if (status === 'Approved') {
      try {
        await sendTripApprovedEmail(booking);
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send approval email:', mailErr.message);
      }
    }

    if (status === 'Approved') {
      await pool.query(
        `UPDATE bookings
         SET email_sent = ?, email_sent_at = IF(? = 1, NOW(), email_sent_at)
         WHERE id = ?`,
        [emailSent, emailSent ? 1 : 0, id]
      );
    }

    if (status === 'Approved' && booking.user_id) {
      await createNotification({
        userId: booking.user_id,
        title: `Your ${booking.destination_name} booking is confirmed`,
        message: `Your trip to ${booking.destination_name} has been approved. Review your hotel, transport, and trip details before departure.`,
        type: 'booking_confirmation',
        bookingId: booking.id,
        dedupeKey: `booking-confirmation:${booking.id}`
      });
    }

    return res.json({
      success: true,
      message: status === 'Approved'
        ? 'Trip approved and confirmation email sent to customer!'
        : `Booking status updated to ${status}.`,
      status,
      emailSent
    });
  } catch (err) {
    console.error('Error in PATCH /api/admin/bookings/:id/status:', err);
    return res.status(500).json({ error: 'Server error while updating booking status.' });
  }
});

// 4. Admin sends custom email notification
app.post('/api/admin/send-email', async (req, res) => {
  try {
    const { recipientEmail, customerName, subject, message, bookingId } = req.body;
    if (!recipientEmail || !subject || !message) {
      return res.status(400).json({ error: 'Recipient, subject, and message are required.' });
    }

    await sendCustomNotificationEmail(recipientEmail, customerName, subject, message, bookingId);
    return res.json({ success: true, message: 'Notification email dispatched to customer successfully.' });
  } catch (err) {
    console.error('Error in POST /api/admin/send-email:', err);
    return res.status(500).json({ error: 'Failed to dispatch email.' });
  }
});

// 5. Admin email logs
app.get('/api/admin/emails', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM email_notifications ORDER BY sent_at DESC LIMIT 50`
    );
    return res.json({ success: true, emails: rows });
  } catch (err) {
    console.error('Error in GET /api/admin/emails:', err);
    return res.status(500).json({ error: 'Server error while fetching email logs.' });
  }
});

// ─── ADMIN TRIP & CART CREATION APIs ───────────────────────────────────────

// 6. Add new trip package (Destination)
app.post('/api/admin/destinations', async (req, res) => {
  try {
    const {
      name,
      category,
      season,
      price,
      duration,
      rating,
      reviews,
      description,
      attractions,
      imageUrl
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO custom_destinations
        (name, category, season, price, duration, rating, reviews, description, attractions, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category || 'Holiday',
        season || 'All Year',
        parseInt(price) || 0,
        duration || '3 Days / 2 Nights',
        parseFloat(rating) || 4.8,
        parseInt(reviews) || 120,
        description || '',
        attractions || '',
        imageUrl || 'assets/goa.jpg'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'New trip package added successfully!',
      destination: {
        id: result.insertId,
        name,
        category,
        season,
        price,
        duration,
        rating,
        reviews,
        desc: description,
        attractions: attractions ? attractions.split(',').map(s => s.trim()) : [],
        img: imageUrl
      }
    });
  } catch (err) {
    console.error('Error in POST /api/admin/destinations:', err);
    return res.status(500).json({ error: 'Server error while adding destination.' });
  }
});

// 7. Get custom destinations added by Admin
app.get('/api/admin/destinations', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM custom_destinations ORDER BY created_at DESC`
    );
    return res.json({ success: true, destinations: rows });
  } catch (err) {
    console.error('Error in GET /api/admin/destinations:', err);
    return res.status(500).json({ error: 'Server error while fetching destinations.' });
  }
});

// 8. Delete a custom destination
app.delete('/api/admin/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM custom_destinations WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Trip package deleted.' });
  } catch (err) {
    console.error('Error in DELETE /api/admin/destinations/:id:', err);
    return res.status(500).json({ error: 'Server error while deleting destination.' });
  }
});

// 9. Assign trip to a customer's cart
app.post('/api/admin/assign-cart', async (req, res) => {
  try {
    const { userId, destination } = req.body;
    if (!userId || !destination || !destination.name) {
      return res.status(400).json({ error: 'User ID and destination info are required.' });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO saved_trips
         (user_id, destination_id, destination_name, category, image_url, price, duration, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE added_at = NOW()`,
      [
        userId,
        destination.id || Date.now(),
        destination.name,
        destination.category || 'Package',
        destination.img || 'assets/goa.jpg',
        destination.price || 0,
        destination.duration || 'Custom Trip',
        destination.rating || 4.8
      ]
    );

    return res.json({ success: true, message: `Trip successfully added to customer cart!` });
  } catch (err) {
    console.error('Error in POST /api/admin/assign-cart:', err);
    return res.status(500).json({ error: 'Server error while assigning trip to cart.' });
  }
});

// 10. Admin users list with their saved trips
app.get('/api/admin/users', async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      `SELECT id, name, email, created_at FROM users ORDER BY id DESC`
    );
    const [trips] = await pool.query(
      `SELECT * FROM saved_trips ORDER BY added_at DESC`
    );
    const [plannedTrips] = await pool.query(
      `SELECT * FROM planned_trips ORDER BY updated_at DESC`
    );

    const usersWithCarts = users.map(u => ({
      ...u,
      cart: trips.filter(t => t.user_id === u.id),
      plannedTrips: plannedTrips.filter(p => p.user_id === u.id)
    }));

    return res.json({ success: true, users: usersWithCarts });
  } catch (err) {
    console.error('Error in GET /api/admin/users:', err);
    return res.status(500).json({ error: 'Server error while fetching users.' });
  }
});

// 11. Admin dashboard statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const pool = getPool();
    const [bookingStats] = await pool.query(`
      SELECT 
        COUNT(*) AS totalBookings,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingBookings,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approvedBookings,
        COALESCE(SUM(total_price), 0) AS totalRevenue
      FROM bookings
    `);
    const [userStats] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`);
    const [destStats] = await pool.query(`SELECT COUNT(*) AS totalCustomDestinations FROM custom_destinations`);

    return res.json({
      success: true,
      stats: {
        totalBookings: bookingStats[0].totalBookings || 0,
        pendingBookings: bookingStats[0].pendingBookings || 0,
        approvedBookings: bookingStats[0].approvedBookings || 0,
        totalRevenue: bookingStats[0].totalRevenue || 0,
        totalUsers: userStats[0].totalUsers || 0,
        totalCustomDestinations: destStats[0].totalCustomDestinations || 0
      }
    });
  } catch (err) {
    console.error('Error in GET /api/admin/stats:', err);
    return res.status(500).json({ error: 'Server error while fetching stats.' });
  }
});

let reminderJobRunning = false;
function startNotificationScheduler() {
  const run = async () => {
    if (reminderJobRunning) return;
    reminderJobRunning = true;
    try {
      await runScheduledNotifications();
    } catch (err) {
      console.error('[Notifications] Scheduled notification run failed:', err);
    } finally {
      reminderJobRunning = false;
    }
  };
  void run();
  setInterval(run, 15 * 60 * 1000);
}

// Start server after initializing DB
initDB()
  .then(() => {
    startNotificationScheduler();
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Could not connect to MySQL. Ensure MySQL is running and .env credentials are correct.');
    console.error('Database error:', err.message);
  });
