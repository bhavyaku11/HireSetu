import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert User
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash]
    );

    const userId = result.insertId;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Sign 7-day JWT Token
    const token = jwt.sign({ id: userId, email: normalizedEmail }, jwtSecret, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const [users] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Sign 7-day JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
});

/**
 * Helper to validate URL format (or empty string/null)
 */
const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string' || urlStr.trim() === '') {
    return true;
  }
  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user profile
 * @access  Private (Protected by JWT)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error('/me error:', error);
    return res.status(500).json({ message: 'Internal server error fetching user profile' });
  }
});

/**
 * @route   PUT /api/auth/me
 * @desc    Update user profile fields (name, linkedin_url, github_url, portfolio_url, bio)
 * @access  Private (Protected by JWT)
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, linkedin_url, github_url, portfolio_url, bio } = req.body;

    // Validate Name if provided
    let updatedName = req.user.name;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updatedName = name.trim();
    }

    // Validate Bio if provided (max 200 chars)
    let updatedBio = req.user.bio;
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ message: 'Bio must be a text string' });
      }
      if (bio.length > 200) {
        return res.status(400).json({ message: 'Bio cannot exceed 200 characters' });
      }
      updatedBio = bio.trim() || null;
    }

    // Validate URLs if provided
    const urlFields = { linkedin_url, github_url, portfolio_url };
    const updatedUrls = {
      linkedin_url: req.user.linkedin_url,
      github_url: req.user.github_url,
      portfolio_url: req.user.portfolio_url,
    };

    for (const [key, value] of Object.entries(urlFields)) {
      if (value !== undefined) {
        if (value === null || value === '') {
          updatedUrls[key] = null;
        } else {
          if (!isValidUrl(value)) {
            return res.status(400).json({ message: `Invalid URL format for ${key}. URL must start with http:// or https://` });
          }
          updatedUrls[key] = value.trim();
        }
      }
    }

    // Update database (EXCLUDING profile_image_url)
    await pool.query(
      `UPDATE users 
       SET name = ?, linkedin_url = ?, github_url = ?, portfolio_url = ?, bio = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedUrls.linkedin_url,
        updatedUrls.github_url,
        updatedUrls.portfolio_url,
        updatedBio,
        req.user.id,
      ]
    );

    // Fetch updated user profile
    const [updatedRows] = await pool.query(
      'SELECT id, name, email, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedRows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal server error updating user profile' });
  }
});

export default router;
