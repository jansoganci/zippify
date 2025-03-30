-- Zippify SQLite Schema
-- This schema defines the database structure for the Zippify application

-- Table for tracking keyword analysis requests per user
-- Used for implementing rate limiting on the SEO & Keyword Analysis feature
CREATE TABLE IF NOT EXISTS keyword_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,  -- Stored in YYYY-MM-DD format
  request_count INTEGER NOT NULL DEFAULT 0,
  
  -- Ensure we only have one record per user per day
  UNIQUE(user_id, date)
);

-- Create index for faster lookups by user_id and date
CREATE INDEX IF NOT EXISTS idx_keyword_requests_user_date ON keyword_requests(user_id, date);
