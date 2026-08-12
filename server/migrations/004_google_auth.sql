-- Migration 004: Add Google OAuth support
-- Makes password_hash nullable (Google-only users have no password hash).
-- Adds google_id for fast sub-based lookups and to mark linked accounts.

ALTER TABLE users
  MODIFY COLUMN password_hash VARCHAR(255) NULL,
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER password_hash;
