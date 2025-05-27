-- Add theme column to profiles table
ALTER TABLE profiles ADD COLUMN theme VARCHAR(10) DEFAULT 'light';

-- Add plan column to users table  
ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'free'; 