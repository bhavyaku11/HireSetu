import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? 'defaultdb' : 'resumeai_builder');

// Determine SSL requirements
const isAiven = Boolean(dbHost && dbHost.includes('aivencloud.com'));
const sslEnv = (process.env.DB_SSL || '').toLowerCase();
const isSslRequested = sslEnv === 'true' || sslEnv === 'required' || sslEnv === '1' || isAiven;

let sslConfig = null;
if (isSslRequested) {
  let caContent = process.env.DB_SSL_CA;
  if (!caContent && process.env.DB_SSL_CA_PATH) {
    try {
      caContent = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
    } catch (e) {
      console.error('[DB] Warning: Could not read CA certificate from DB_SSL_CA_PATH:', e.message);
    }
  }

  if (caContent) {
    sslConfig = {
      ca: caContent,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  } else {
    // If no custom CA certificate is provided, default to rejecting unauthorized unless explicitly overridden
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true;
    if (!rejectUnauthorized) {
      console.warn('[DB] WARNING: SSL certificate verification disabled via DB_SSL_REJECT_UNAUTHORIZED=false. For production security, configure DB_SSL_CA.');
    }
    sslConfig = { rejectUnauthorized };
  }
}

// Log connection diagnostics without sensitive credentials
console.log(`[DB] MySQL pool configured: host=${dbHost}, port=${dbPort}, database=${dbName}, user=${dbUser}, ssl=${sslConfig ? 'enabled' : 'disabled'}`);

const poolConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '15000', 10),
};

if (sslConfig) {
  poolConfig.ssl = sslConfig;
}

const pool = mysql.createPool(poolConfig);

/**
 * Health check helper to test active connectivity
 */
export async function checkDatabaseHealth() {
  try {
    const [rows] = await pool.query('SELECT 1 as ping');
    return { healthy: true, ping: rows[0]?.ping === 1 };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

/**
 * Idempotent schema initialization and migration helper.
 * Verifies required tables and column compatibility without dropping data.
 */
export async function ensureSchemaUpdates() {
  try {
    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        google_id VARCHAR(255) NULL,
        profile_image_url VARCHAR(500) NULL,
        linkedin_url VARCHAR(500) NULL,
        github_url VARCHAR(500) NULL,
        portfolio_url VARCHAR(500) NULL,
        bio VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Resumes table (created before job_descriptions to satisfy FK constraints)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        raw_extracted_text LONGTEXT NULL,
        ats_analysis JSON NULL,
        tailored_for_jd_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_resumes_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Job descriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        title VARCHAR(255) NULL,
        raw_text LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        INDEX idx_jd_resume_id (resume_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Resume sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resume_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        section_type ENUM(
          'personal_info',
          'education',
          'experience',
          'projects',
          'skills',
          'certifications',
          'achievements',
          'positions_of_responsibility',
          'languages',
          'interests'
        ) NOT NULL,
        content JSON NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        INDEX idx_sections_resume_id (resume_id),
        INDEX idx_sections_sort (resume_id, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Ensure nullable password_hash for Google auth compatibility
    const [pwCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'password_hash'");
    if (pwCol.length > 0 && pwCol[0].Null === 'NO') {
      await pool.query('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL');
      console.log('[DB] Updated users.password_hash to permit NULL for OAuth.');
    }

    // 6. Ensure user profile and google_id columns exist
    const userProfileCols = ['google_id', 'profile_image_url', 'linkedin_url', 'github_url', 'portfolio_url', 'bio'];
    for (const col of userProfileCols) {
      const [existing] = await pool.query(`SHOW COLUMNS FROM users LIKE '${col}'`);
      if (existing.length === 0) {
        const colType = (col === 'bio' || col === 'google_id') ? 'VARCHAR(255) NULL' : 'VARCHAR(500) NULL';
        await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${colType}`);
        console.log(`[DB] Added missing ${col} column to users table.`);
      }
    }

    // 7. Ensure resume feature columns exist
    const [rawCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'raw_extracted_text'");
    if (rawCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN raw_extracted_text LONGTEXT NULL');
      console.log('[DB] Added raw_extracted_text column to resumes table.');
    }

    const [analysisCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'ats_analysis'");
    if (analysisCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN ats_analysis JSON NULL');
      console.log('[DB] Added ats_analysis column to resumes table.');
    }

    const [tailoredCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'tailored_for_jd_id'");
    if (tailoredCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN tailored_for_jd_id INT NULL');
      console.log('[DB] Added tailored_for_jd_id column to resumes table.');
    }

    console.log('[DB] Database schema verified successfully.');
    return { ready: true };
  } catch (err) {
    console.error('[DB] Schema verification notice:', err.message);
    return { ready: false, error: err.message };
  }
}

// Perform initial schema check asynchronously during startup without blocking pool export
ensureSchemaUpdates();

export default pool;
