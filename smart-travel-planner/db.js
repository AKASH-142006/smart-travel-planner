const mysql = require('mysql2/promise');
require('dotenv').config();

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

    console.log(`[DB] MySQL connected & tables initialized successfully (Database: ${dbName})`);

    // 5. Migrate saved_trips table if old schema exists (add new columns if missing)
    const migrateColumns = [
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS destination_id INT NOT NULL DEFAULT 0`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS category VARCHAR(60)`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS image_url TEXT`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS price INT DEFAULT 0`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS duration VARCHAR(100)`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0`,
      `ALTER TABLE saved_trips ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    ];
    for (const sql of migrateColumns) {
      try { await pool.query(sql); } catch (_) { /* column may already exist */ }
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
