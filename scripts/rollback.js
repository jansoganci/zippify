#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rollback Script for Zippify
 * Usage: npm run rollback
 */

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../backend/db/zippify.db');

function rollbackDatabase() {
  try {
    console.log('🔄 Starting database rollback...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      console.error('❌ No backup directory found:', BACKUP_DIR);
      return false;
    }

    // Find the latest pre-deployment backup
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('pre_deploy_backup_') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    if (files.length === 0) {
      console.error('❌ No pre-deployment backup found');
      return false;
    }

    const latestBackup = files[0];
    console.log(`📋 Found latest backup: ${latestBackup.name}`);
    console.log(`📅 Created: ${latestBackup.time.toLocaleString()}`);

    // Create a backup of current state before rollback
    const rollbackTimestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .split('T')[0] + '_' + 
      new Date().toISOString()
      .split('T')[1]
      .split('.')[0]
      .replace(/:/g, '-');
    
    const rollbackBackupPath = path.join(BACKUP_DIR, `rollback_backup_${rollbackTimestamp}.db`);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, rollbackBackupPath);
      console.log(`💾 Current database backed up to: rollback_backup_${rollbackTimestamp}.db`);
    }

    // Restore the database
    fs.copyFileSync(latestBackup.path, DB_PATH);
    
    console.log('✅ Database rollback completed successfully!');
    console.log(`🔄 Restored from: ${latestBackup.name}`);
    console.log(`📍 Database location: ${DB_PATH}`);

    return true;

  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    return false;
  }
}

function listAvailableBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 No backup directory found.');
      return;
    }

    const preDeployBackups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('pre_deploy_backup_') && file.endsWith('.db'))
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

    if (preDeployBackups.length === 0) {
      console.log('📋 No pre-deployment backups found.');
    } else {
      console.log('\n📋 Available pre-deployment backups:');
      console.log('─'.repeat(80));
      preDeployBackups.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   📊 Size: ${file.size} | 📅 Created: ${file.created}`);
        if (index === 0) {
          console.log('   ⭐ Latest (will be used for rollback)');
        }
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
  case 'rollback':
  case undefined:
    console.log('🔄 Zippify Database Rollback Tool');
    console.log('================================');
    if (rollbackDatabase()) {
      console.log('\n⚠️  IMPORTANT: Remember to restart your backend service!');
      console.log('   pm2 restart zippify-backend');
    }
    break;
    
  case 'list':
    listAvailableBackups();
    break;
    
  case 'help':
    console.log(`
🔄 Zippify Database Rollback Tool

Usage:
  npm run rollback           Rollback to latest pre-deployment backup
  npm run rollback list      List all available pre-deployment backups
  npm run rollback help      Show this help

What it does:
  - Finds the latest pre_deploy_backup_*.db file
  - Creates a backup of current database (rollback_backup_*.db)
  - Restores the pre-deployment backup
  - You need to manually restart the backend service afterwards

Configuration:
  Database: ${DB_PATH}
  Backup Dir: ${BACKUP_DIR}
`);
    break;
    
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Use "npm run rollback help" for usage information.');
    process.exit(1);
} 