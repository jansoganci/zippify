import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

class Database {
  constructor() {
    this._db = null;
    this._connectionPromise = null;
  }

  async getConnection() {
    if (this._db) {
      return this._db;
    }

    if (this._connectionPromise) {
      return this._connectionPromise;
    }

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
      const dbPath = path.resolve(process.cwd(), 'db/zippify.db');
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      await Promise.all([
        db.run('PRAGMA foreign_keys = ON'),
        db.run('PRAGMA journal_mode = WAL'),
        db.run('PRAGMA busy_timeout = 5000')
      ]);

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

export const db = new Database();

