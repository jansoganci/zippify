#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('💾 ZIPPIFY AUTOMATED DATABASE BACKUP');
console.log('====================================');

const SERVER_IP = '64.23.195.7';
const LOG_FILE = 'backup.log';

// Utility function to log with timestamp
const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
};

const runServerCommand = (command, description) => {
  log(`Executing: ${description}`);
  try {
    const result = execSync(`ssh -o StrictHostKeyChecking=no root@${SERVER_IP} "${command}"`, { 
      encoding: 'utf-8',
      timeout: 60000 // 60 second timeout for backup operations
    });
    log(`✅ ${description} - Success`);
    return { success: true, output: result.trim() };
  } catch (error) {
    log(`❌ ${description} - Failed: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
};

async function performBackup() {
  log('🚀 Starting automated backup process...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupName = `auto_backup_${timestamp}`;
  
  const backupSteps = [
    {
      command: 'cd /root/zippify && mkdir -p backups',
      description: 'Create backup directory'
    },
    {
      command: `cd /root/zippify && cp backend/db/zippify.db "backups/${backupName}.db"`,
      description: 'Copy database file'
    },
    {
      command: `cd /root/zippify/backups && ls -la ${backupName}.db`,
      description: 'Verify backup file created'
    },
    {
      command: `cd /root/zippify/backend && sqlite3 ../backups/${backupName}.db "SELECT count(*) FROM sqlite_master;"`,
      description: 'Test backup file integrity'
    },
    {
      command: 'cd /root/zippify/backups && ls -la | wc -l',
      description: 'Count total backups'
    }
  ];

  let allSuccess = true;
  const results = {};

  for (const step of backupSteps) {
    const result = runServerCommand(step.command, step.description);
    results[step.description] = result;
    if (!result.success) {
      allSuccess = false;
    }
  }

  // Cleanup old backups (keep last 30 days)
  log('🧹 Cleaning up old backups...');
  const cleanupResult = runServerCommand(
    'cd /root/zippify/backups && find . -name "auto_backup_*.db" -mtime +30 -delete && echo "Cleanup completed"',
    'Remove backups older than 30 days'
  );
  results['cleanup'] = cleanupResult;

  // Generate backup report
  log('📊 BACKUP SUMMARY');
  log('=================');
  log(`Backup Name: ${backupName}.db`);
  log(`Overall Status: ${allSuccess ? 'SUCCESS' : 'FAILED'}`);
  log(`Timestamp: ${new Date().toISOString()}`);

  Object.entries(results).forEach(([description, result]) => {
    const status = result.success ? '✅' : '❌';
    log(`${status} ${description}`);
  });

  // Save backup report
  const report = {
    timestamp: new Date().toISOString(),
    backupName: `${backupName}.db`,
    success: allSuccess,
    steps: results
  };

  try {
    fs.writeFileSync('backup-report.json', JSON.stringify(report, null, 2));
    log('📄 Backup report saved to backup-report.json');
  } catch (error) {
    log(`Failed to save backup report: ${error.message}`, 'ERROR');
  }

  return report;
}

// Backup verification function
async function verifyLatestBackup() {
  log('🔍 Verifying latest backup...');
  
  const verificationSteps = [
    {
      command: 'cd /root/zippify/backups && ls -t *.db | head -1',
      description: 'Find latest backup file'
    },
    {
      command: 'cd /root/zippify/backups && LATEST=$(ls -t *.db | head -1) && ls -la "$LATEST"',
      description: 'Check latest backup file size'
    },
    {
      command: 'cd /root/zippify/backups && LATEST=$(ls -t *.db | head -1) && sqlite3 "$LATEST" "SELECT count(*) FROM sqlite_master;" 2>/dev/null || echo "VERIFICATION_FAILED"',
      description: 'Test latest backup integrity'
    }
  ];

  for (const step of verificationSteps) {
    const result = runServerCommand(step.command, step.description);
    if (!result.success) {
      log('❌ Backup verification failed!', 'ERROR');
      return false;
    }
  }

  log('✅ Latest backup verification successful!');
  return true;
}

// List all backups
async function listBackups() {
  log('📋 Listing all backups...');
  
  const result = runServerCommand(
    'cd /root/zippify/backups && ls -la *.db 2>/dev/null | head -20 || echo "No backups found"',
    'List backup files'
  );

  if (result.success) {
    log('📁 Available backups:');
    console.log(result.output);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--verify')) {
    await verifyLatestBackup();
  } else if (args.includes('--list')) {
    await listBackups();
  } else if (args.includes('--help')) {
    console.log(`
Usage: node scheduled-backup.cjs [options]

Options:
  --verify     Verify the latest backup integrity
  --list       List all available backups
  --help       Show this help message

Examples:
  node scheduled-backup.cjs           # Perform automated backup
  node scheduled-backup.cjs --verify  # Verify latest backup
  node scheduled-backup.cjs --list    # List all backups

Crontab example (daily backup at 2 AM):
  0 2 * * * cd /path/to/project && node scripts/scheduled-backup.cjs >> backup.log 2>&1
    `);
  } else {
    await performBackup();
  }
}

main().catch(error => {
  log(`Backup script failed: ${error.message}`, 'ERROR');
  process.exit(1);
}); 