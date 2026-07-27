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
    const [rawCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'raw_extracted_text'");
    if (rawCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN raw_extracted_text LONGTEXT NULL');
      console.log('Successfully added raw_extracted_text column to resumes table');
    }

    const [analysisCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'ats_analysis'");
    if (analysisCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN ats_analysis JSON NULL');
      console.log('Successfully added ats_analysis column to resumes table');
    }

    const userProfileCols = ['profile_image_url', 'linkedin_url', 'github_url', 'portfolio_url', 'bio'];
    for (const col of userProfileCols) {
      const [existing] = await pool.query(`SHOW COLUMNS FROM users LIKE '${col}'`);
      if (existing.length === 0) {
        const colType = col === 'bio' ? 'VARCHAR(255) NULL' : 'VARCHAR(500) NULL';
        await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${colType}`);
        console.log(`Successfully added ${col} column to users table`);
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        title VARCHAR(255) NULL,
        raw_text LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [tailoredCols] = await pool.query("SHOW COLUMNS FROM resumes LIKE 'tailored_for_jd_id'");
    if (tailoredCols.length === 0) {
      await pool.query('ALTER TABLE resumes ADD COLUMN tailored_for_jd_id INT NULL');
      console.log('Successfully added tailored_for_jd_id column to resumes table');
    }
  } catch (err) {
    console.error('Schema update check warning:', err.message);
  }
}

ensureSchemaUpdates();

export default pool;
