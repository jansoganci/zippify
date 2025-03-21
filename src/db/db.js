import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

class Database {
  constructor() {
    this._db = null;
    this._connectionPromise = null;
  }

  async getConnection() {
    // Return existing connection if available
    if (this._db) {
      return this._db;
    }

    // Return in-progress connection attempt if exists
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    // Create new connection
    this._connectionPromise = this._connect();
    try {
      this._db = await this._connectionPromise;
      return this._db;
    } finally {
      this._connectionPromise = null;
    }
  }

  async _connect() {
    try {
      const db = await open({
        filename: './db/zippify.db',
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await db.run('PRAGMA foreign_keys = ON');
      
      // Enable WAL mode for better concurrency
      await db.run('PRAGMA journal_mode = WAL');
      
      // Set busy timeout to handle concurrent requests
      await db.run('PRAGMA busy_timeout = 5000');

      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async close() {
    if (this._db) {
      await this._db.close();
      this._db = null;
    }
  }

  async get(query, params = []) {
    const db = await this.getConnection();
    return db.get(query, params);
  }

  async all(query, params = []) {
    const db = await this.getConnection();
    return db.all(query, params);
  }

  async run(query, params = []) {
    const db = await this.getConnection();
    return db.run(query, params);
  }

  async exec(query) {
    const db = await this.getConnection();
    return db.exec(query);
  }

  async transaction(callback) {
    const db = await this.getConnection();
    try {
      await db.run('BEGIN TRANSACTION');
      await callback(db);
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  }
}

// Export a singleton instance
export const db = new Database();
