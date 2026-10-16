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

    return res.json({
      success: true,
      message: 'Administrator authenticated successfully!',
      adminToken: 'stp-admin-secret-token-' + Date.now(),
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
         WHERE id = ?`,
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
          id
        ]
      );

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
          userId || null,
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
      receiptNo
    } = req.body;

    if (!customerName || !customerEmail || !destinationName) {
      return res.status(400).json({ error: 'Customer name, email, and destination are required.' });
    }

    const pool = getPool();
    const finalReceiptNo = receiptNo || ('STP-' + Date.now().toString().slice(-6));

    const [result] = await pool.query(
      `INSERT INTO bookings
        (user_id, customer_name, customer_email, customer_phone, customer_address,
         destination_id, destination_name, hotel_name, hotel_price, transport_name,
         transport_price, total_price, receipt_no, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        userId || null,
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
        finalReceiptNo
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
app.patch('/api/admin/bookings/:id/status', async (req, res) => {
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

    let emailSent = booking.email_sent;
    if (status === 'Approved') {
      try {
        await sendTripApprovedEmail(booking);
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send approval email:', mailErr.message);
      }
    }

    await pool.query(
      `UPDATE bookings
       SET status = ?, email_sent = ?, email_sent_at = IF(? = 1, NOW(), email_sent_at)
       WHERE id = ?`,
      [status, emailSent, emailSent ? 1 : 0, id]
    );

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
