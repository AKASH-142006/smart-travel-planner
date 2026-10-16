const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDB() {
  try {
    // 1. First connect without specifying DB to ensure database exists
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    const dbName = process.env.DB_NAME || 'smart_travel_planner';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Create pool connected to our database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName
    });

    // 3. Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create trips/saved destinations table with full card data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        destination_id INT NOT NULL,
        destination_name VARCHAR(150) NOT NULL,
        category VARCHAR(60),
        image_url TEXT,
        price INT DEFAULT 0,
        duration VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_dest (user_id, destination_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create customer bookings table for admin approval flow
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_address TEXT,
        destination_id INT NOT NULL,
        destination_name VARCHAR(150) NOT NULL,
        hotel_name VARCHAR(150),
        hotel_price INT DEFAULT 0,
        transport_name VARCHAR(150),
        transport_price INT DEFAULT 0,
        total_price INT DEFAULT 0,
        receipt_no VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pending',
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5b. Create planned_trips table for saving & continuing full customized itineraries
    await pool.query(`
      CREATE TABLE IF NOT EXISTS planned_trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(200) NOT NULL,
        destination_id INT NOT NULL,
        destination_name VARCHAR(150) NOT NULL,
        start_date VARCHAR(50),
        duration_days INT DEFAULT 3,
        travellers INT DEFAULT 1,
        group_type VARCHAR(50) DEFAULT 'solo',
        pace_style VARCHAR(50) DEFAULT 'balanced',
        budget INT DEFAULT 0,
        activity_cost INT DEFAULT 0,
        hotel_name VARCHAR(150),
        hotel_price INT DEFAULT 0,
        transport_name VARCHAR(150),
        transport_price INT DEFAULT 0,
        interests TEXT,
        itinerary_data LONGTEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Planning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create custom destinations table added by Admin
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(60) NOT NULL,
        season VARCHAR(60) NOT NULL,
        price INT NOT NULL,
        duration VARCHAR(100) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 4.80,
        reviews INT DEFAULT 120,
        description TEXT,
        attractions TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create email notifications log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NULL,
        recipient_email VARCHAR(150) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`[DB] MySQL connected & tables initialized successfully (Database: ${dbName})`);

    // 8. Safely migrate saved_trips table columns using INFORMATION_SCHEMA
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'saved_trips'`,
      [dbName]
    );
    const existingColNames = cols.map(c => c.COLUMN_NAME.toLowerCase());
    const neededColumns = [
      { name: 'destination_id', sql: 'ALTER TABLE saved_trips ADD COLUMN destination_id INT NOT NULL DEFAULT 0' },
      { name: 'category', sql: 'ALTER TABLE saved_trips ADD COLUMN category VARCHAR(60)' },
      { name: 'image_url', sql: 'ALTER TABLE saved_trips ADD COLUMN image_url TEXT' },
      { name: 'price', sql: 'ALTER TABLE saved_trips ADD COLUMN price INT DEFAULT 0' },
      { name: 'duration', sql: 'ALTER TABLE saved_trips ADD COLUMN duration VARCHAR(100)' },
      { name: 'rating', sql: 'ALTER TABLE saved_trips ADD COLUMN rating DECIMAL(3,2) DEFAULT 0' },
      { name: 'added_at', sql: 'ALTER TABLE saved_trips ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    for (const col of neededColumns) {
      if (!existingColNames.includes(col.name)) {
        try { await pool.query(col.sql); } catch (e) { console.warn(`Migration notice for ${col.name}:`, e.message); }
      }
    }

    // 9. Safely migrate users table for role column
    const [userCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [dbName]
    );
    const existingUserCols = userCols.map(c => c.COLUMN_NAME.toLowerCase());
    if (!existingUserCols.includes('role')) {
      try {
        await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer'");
      } catch (_) {}
    }

    // 10. Seed the single designated Admin account (admin@gmail.com / admin123)
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@gmail.com';
    const [adminRows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (adminRows.length === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['System Administrator', adminEmail, adminHash, 'admin']
      );
      console.log(`[DB] Single Admin account initialized: ${adminEmail} (password: admin123)`);
    } else {
      await pool.query('UPDATE users SET role = "admin" WHERE email = ?', [adminEmail]);
    }

    return pool;
  } catch (error) {
    console.error('[DB Error] Failed to initialize MySQL database:', error.message);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = { initDB, getPool };
