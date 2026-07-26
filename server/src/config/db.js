import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'resumeai_builder',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function ensureSchemaUpdates() {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'raw_extracted_text'");
    if (columns.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN raw_extracted_text LONGTEXT NULL');
      console.log('Successfully added raw_extracted_text column to resumes table');
    }
  } catch (err) {
    console.error('Schema update check warning:', err.message);
  }
}

ensureSchemaUpdates();

export default pool;
