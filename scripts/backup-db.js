#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple SQLite Database Backup Script
 * Usage: npm run backup-db
 */

const DB_PATH = path.join(__dirname, '../db/zippify.db');
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 10; // Keep only last 10 backups

function createBackup() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('📁 Created backup directory:', BACKUP_DIR);
    }

    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.log('⚠️  Database file not found:', DB_PATH);
      return;
    }

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .split('T')[0] + '_' + 
      new Date().toISOString()
      .split('T')[1]
      .split('.')[0]
      .replace(/:/g, '-');
    
    const backupFileName = `zippify_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);
    
    // Get file size for logging
    const stats = fs.statSync(backupPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Database backup created successfully!');
    console.log(`📄 File: ${backupFileName}`);
    console.log(`📊 Size: ${fileSizeKB} KB`);
    console.log(`📍 Location: ${backupPath}`);

    // Clean old backups (keep only MAX_BACKUPS)
    cleanOldBackups();

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('zippify_backup_') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }

    console.log(`📋 Total backups kept: ${Math.min(files.length, MAX_BACKUPS)}`);

  } catch (error) {
    console.warn('⚠️  Warning: Could not clean old backups:', error.message);
  }
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 No backup directory found.');
      return;
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('zippify_backup_') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / 1024).toFixed(2) + ' KB',
          created: stats.mtime.toLocaleString()
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    if (files.length === 0) {
      console.log('📋 No backups found.');
    } else {
      console.log('\n📋 Available backups:');
      console.log('─'.repeat(80));
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   📊 Size: ${file.size} | 📅 Created: ${file.created}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error listing backups:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'create':
  case undefined:
    createBackup();
    break;
  case 'list':
    listBackups();
    break;
  case 'help':
    console.log(`
🗃️  SQLite Database Backup Tool

Usage:
  npm run backup-db         Create a new backup
  npm run backup-db create  Create a new backup  
  npm run backup-db list    List all existing backups
  npm run backup-db help    Show this help

Configuration:
  Database: ${DB_PATH}
  Backup Dir: ${BACKUP_DIR}
  Max Backups: ${MAX_BACKUPS}
`);
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Use "npm run backup-db help" for usage information.');
    process.exit(1);
} 