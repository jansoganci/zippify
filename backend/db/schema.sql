-- Zippify SQLite Schema
-- This schema defines the database structure for the Zippify application

-- Table for tracking keyword analysis requests per user
-- Used for implementing rate limiting on the SEO & Keyword Analysis feature
CREATE TABLE IF NOT EXISTS keyword_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT (datetime('now')),
  date TEXT NOT NULL,  -- Stored in YYYY-MM-DD format
  request_count INTEGER NOT NULL DEFAULT 0,
  
  -- Ensure we only have one record per user per day
  UNIQUE(user_id, date)
);

-- Create index for faster lookups by user_id and date
CREATE INDEX IF NOT EXISTS idx_keyword_requests_user_date ON keyword_requests(user_id, date);

-- Table for user accounts
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table for user profiles
-- Stores additional user information separate from authentication
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  store_name TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'light',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

CREATE TABLE IF NOT EXISTS user_quota (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  feature TEXT NOT NULL,
  date TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  UNIQUE(user_id, feature, date)
);

-- Listings table for storing generated Etsy listing results
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,         -- JSON string of tag array
  alt_texts TEXT NOT NULL,    -- JSON string of alt texts
  original_prompt TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'etsy',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index to optimize user-based listing queries
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Google Trends Cache Table
-- Stores cached Google Trends API responses to minimize API calls and improve performance
CREATE TABLE IF NOT EXISTS google_trends_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  trend_data TEXT NOT NULL,           -- JSON string of trend data (interest over time)
  related_queries TEXT,               -- JSON string of related queries (top & rising)
  related_topics TEXT,                -- JSON string of related topics
  geographic_data TEXT,               -- JSON string of geographic interest data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,           -- Cache expiration timestamp (24 hours from creation)
  
  -- Ensure unique cache entries per keyword
  UNIQUE(keyword)
);

-- Index for faster keyword lookups in cache
CREATE INDEX IF NOT EXISTS idx_google_trends_cache_keyword ON google_trends_cache(keyword);

-- Index for cleanup operations (finding expired entries)
CREATE INDEX IF NOT EXISTS idx_google_trends_cache_expires_at ON google_trends_cache(expires_at);
