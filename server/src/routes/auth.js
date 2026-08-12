import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleAvatarUpload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

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
        email: normalizedEmail,
        profile_image_url: null,
        linkedin_url: null,
        github_url: null,
        portfolio_url: null,
        bio: null,
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
    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );
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
        email: user.email,
        profile_image_url: user.profile_image_url,
        linkedin_url: user.linkedin_url,
        github_url: user.github_url,
        portfolio_url: user.portfolio_url,
        bio: user.bio,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Verify a Google ID token and issue our own JWT.
 *          Creates a new account or links to an existing one by email.
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID is not set in environment variables.');
      return res.status(500).json({ message: 'Server configuration error: Google auth not set up.' });
    }

    // ── Step 1: Verify the ID token with Google ──────────────────────────────
    // This confirms: correct audience (our Client ID), valid signature from
    // Google's public keys, token not expired, and correct issuer.
    const client = new OAuth2Client(googleClientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ message: 'Invalid or expired Google token. Please try again.' });
    }

    // ── Step 2: Require a verified email ────────────────────────────────────
    // Google includes `email_verified` in the payload. We require it to be
    // true — unverified emails are a security risk (anyone can claim them).
    if (!payload.email_verified) {
      return res.status(403).json({
        message: 'Your Google account email is not verified. Please verify it with Google first.',
      });
    }

    const { sub: googleId, email, name, picture: profilePicture } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    // ── Step 3: Upsert the user ──────────────────────────────────────────────
    // Lookup order: google_id first (fast, exact), then email (handles the
    // case where the user previously signed up with email/password).
    const [byGoogleId] = await pool.query(
      'SELECT id, name, email, password_hash, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE google_id = ?',
      [googleId]
    );

    let user;

    if (byGoogleId.length > 0) {
      // ── Existing Google-linked account ────────────────────────────────────
      user = byGoogleId[0];

      // Refresh name and profile picture if Google has newer data.
      // Never overwrite a manually-uploaded avatar (only update if still
      // pointing at a Google URL or if there's no avatar at all).
      const shouldUpdatePicture =
        !user.profile_image_url ||
        user.profile_image_url.startsWith('https://lh3.googleusercontent.com');

      await pool.query(
        `UPDATE users
           SET name = ?,
               profile_image_url = IF(?, ?, profile_image_url)
           WHERE id = ?`,
        [
          name,
          shouldUpdatePicture && profilePicture ? 1 : 0,
          profilePicture || user.profile_image_url,
          user.id,
        ]
      );

      // Re-fetch to get updated values.
      const [refreshed] = await pool.query(
        'SELECT id, name, email, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE id = ?',
        [user.id]
      );
      user = refreshed[0];

    } else {
      // ── No google_id match — check by email ──────────────────────────────
      const [byEmail] = await pool.query(
        'SELECT id, name, email, password_hash, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE email = ?',
        [normalizedEmail]
      );

      if (byEmail.length > 0) {
        // ── Existing email/password account — link Google to it ─────────────
        // Link Google ID to the existing row. Set profile picture only if
        // the user has never uploaded one.
        user = byEmail[0];
        const shouldSetPicture = !user.profile_image_url && profilePicture;

        await pool.query(
          `UPDATE users
             SET google_id = ?,
                 profile_image_url = IF(?, ?, profile_image_url)
             WHERE id = ?`,
          [
            googleId,
            shouldSetPicture ? 1 : 0,
            profilePicture || user.profile_image_url,
            user.id,
          ]
        );

        const [refreshed] = await pool.query(
          'SELECT id, name, email, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE id = ?',
          [user.id]
        );
        user = refreshed[0];

      } else {
        // ── Brand-new user — create account from Google profile ──────────────
        const [result] = await pool.query(
          'INSERT INTO users (name, email, google_id, profile_image_url, password_hash) VALUES (?, ?, ?, ?, NULL)',
          [name, normalizedEmail, googleId, profilePicture || null]
        );

        const [newUser] = await pool.query(
          'SELECT id, name, email, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE id = ?',
          [result.insertId]
        );
        user = newUser[0];
      }
    }

    // ── Step 4: Issue our own JWT — identical shape to normal login ──────────
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Google sign-in successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Internal server error during Google sign-in.' });
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

/**
 * @route   POST /api/auth/me/avatar
 * @desc    Upload user profile image (JPEG, PNG, WebP max 2MB)
 * @access  Private (Protected by JWT)
 */
router.post('/me/avatar', authenticateToken, handleAvatarUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const newImageUrl = `/uploads/avatars/${req.file.filename}`;

    // Old file replacement strategy: delete existing avatar file from disk if present
    const oldImageUrl = req.user.profile_image_url;
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/avatars/')) {
      const oldFilename = path.basename(oldImageUrl);
      const oldFilePath = path.join(process.cwd(), 'uploads/avatars', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn(`Failed to delete old profile image file ${oldFilePath}:`, unlinkErr.message);
        }
      }
    }

    // Save new profile image URL to database
    await pool.query('UPDATE users SET profile_image_url = ? WHERE id = ?', [newImageUrl, req.user.id]);

    // Fetch updated user profile
    const [updatedRows] = await pool.query(
      'SELECT id, name, email, profile_image_url, linkedin_url, github_url, portfolio_url, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      message: 'Profile image updated successfully',
      profile_image_url: newImageUrl,
      user: updatedRows[0],
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ message: 'Internal server error uploading avatar image' });
  }
});

export default router;
