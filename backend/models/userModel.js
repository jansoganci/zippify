/**
 * User Model
 * Provides database operations for the users table
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Database path constant
const DB_PATH = './db/zippify.db';

/**
 * Get a database connection
 * @returns {Promise<sqlite.Database>} Database connection
 */
async function getDbConnection() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

/**
 * Create a new user in the database
 * @param {string} email - User's email address
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {Promise<Object>} Created user object with id
 * @throws {Error} If user creation fails
 */
export async function createUser(email, hashedPassword) {
  const db = await getDbConnection();
  
  try {
    // Check if user with this email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Insert the new user
    const result = await db.run(
      'INSERT INTO users (email, password, plan) VALUES (?, ?, ?)',
      [email, hashedPassword, 'free']
    );
    
    if (!result || !result.lastID) {
      throw new Error('Failed to create user');
    }
    
    // Return the newly created user
    return {
      id: result.lastID,
      email,
      plan: 'free',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}

/**
 * Get a user by email
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User object or null if not found
 * @throws {Error} If database query fails
 */
export async function getUserByEmail(email) {
  const db = await getDbConnection();
  
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}

/**
 * Get a user by ID
 * @param {number} id - User's ID
 * @returns {Promise<Object|null>} User object or null if not found
 * @throws {Error} If database query fails
 */
export async function getUserById(id) {
  const db = await getDbConnection();
  
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    return user || null;
  } catch (error) {
    console.error('Error getting user by ID:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}
