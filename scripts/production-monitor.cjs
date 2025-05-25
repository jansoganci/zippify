#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 ZIPPIFY PRODUCTION HEALTH MONITOR');
console.log('=====================================');

const SERVER_IP = '64.23.195.7';
const LOG_FILE = 'monitoring.log';

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

const runServerCommand = (command, description, expectOutput = false) => {
  log(`Checking: ${description}`);
  try {
    const result = execSync(`ssh -o StrictHostKeyChecking=no root@${SERVER_IP} "${command}"`, { 
      encoding: 'utf-8',
      timeout: 30000 // 30 second timeout
    });
    
    if (expectOutput && result.trim()) {
      log(`✅ ${description} - OK`);
      return { success: true, output: result.trim() };
    } else if (!expectOutput) {
      log(`✅ ${description} - OK`);
      return { success: true, output: result };
    } else {
      log(`⚠️ ${description} - No output received`, 'WARN');
      return { success: false, output: '' };
    }
  } catch (error) {
    log(`❌ ${description} - FAILED: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
};

// Health checks
const healthChecks = [
  {
    name: 'PM2 Backend Status',
    command: 'pm2 status zippify-backend --no-color | grep zippify-backend || echo "NOT_RUNNING"',
    expectOutput: true
  },
  {
    name: 'Backend Health Endpoint',
    command: 'curl -s --max-time 10 http://localhost:3001/api/health',
    expectOutput: true
  },
  {
    name: 'Frontend Response',
    command: 'curl -s -I http://localhost/ | head -1',
    expectOutput: true
  },
  {
    name: 'Database File Integrity',
    command: 'cd /root/zippify/backend && sqlite3 db/zippify.db "SELECT count(*) FROM sqlite_master;" 2>/dev/null || echo "DB_ERROR"',
    expectOutput: true
  },
  {
    name: 'Disk Space Check',
    command: 'df -h / | tail -1 | awk "{print $5}" | sed "s/%//"',
    expectOutput: true
  },
  {
    name: 'Memory Usage',
    command: 'free -m | grep Mem | awk "{printf \"%.1f\", $3/$2 * 100.0}"',
    expectOutput: true
  },
  {
    name: 'Recent Error Logs',
    command: 'tail -5 /var/log/nginx/error.log 2>/dev/null | wc -l',
    expectOutput: true
  }
];

async function runHealthCheck() {
  log('🚀 Starting health check...');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: 'HEALTHY'
  };

  for (const check of healthChecks) {
    const result = runServerCommand(check.command, check.name, check.expectOutput);
    results.checks[check.name] = result;
    
    // Determine if this is a critical failure
    if (!result.success) {
      if (check.name.includes('Backend') || check.name.includes('Database')) {
        results.overall = 'CRITICAL';
      } else if (results.overall !== 'CRITICAL') {
        results.overall = 'WARNING';
      }
    }
  }

  // Special checks for critical values
  if (results.checks['Disk Space Check'].success) {
    const diskUsage = parseInt(results.checks['Disk Space Check'].output);
    if (diskUsage > 90) {
      log(`❌ CRITICAL: Disk usage is ${diskUsage}%`, 'ERROR');
      results.overall = 'CRITICAL';
    } else if (diskUsage > 80) {
      log(`⚠️ WARNING: Disk usage is ${diskUsage}%`, 'WARN');
      if (results.overall === 'HEALTHY') results.overall = 'WARNING';
    }
  }

  // Generate status report
  log('📊 HEALTH CHECK SUMMARY');
  log('======================');
  log(`Overall Status: ${results.overall}`);
  log(`Timestamp: ${results.timestamp}`);
  
  Object.entries(results.checks).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    const output = result.output ? ` (${result.output.substring(0, 50)})` : '';
    log(`${status} ${name}${output}`);
  });

  // Save results to JSON file
  try {
    fs.writeFileSync('health-check-results.json', JSON.stringify(results, null, 2));
    log('📄 Results saved to health-check-results.json');
  } catch (error) {
    log(`Failed to save results: ${error.message}`, 'ERROR');
  }

  return results;
}

// Auto-restart function
async function autoRestart() {
  log('🔧 Checking if auto-restart is needed...');
  
  const backendCheck = runServerCommand(
    'curl -s --max-time 5 http://localhost:3001/api/health',
    'Backend Health for Auto-restart Check',
    true
  );

  if (!backendCheck.success) {
    log('🚨 Backend is down! Attempting auto-restart...', 'WARN');
    
    // Stop backend
    runServerCommand('pm2 stop zippify-backend || true', 'Stopping backend');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start backend
    const startResult = runServerCommand(
      'cd /root/zippify/backend && NODE_ENV=production pm2 start server.js --name zippify-backend --update-env',
      'Starting backend'
    );
    
    if (startResult.success) {
      log('✅ Backend restarted successfully!');
      
      // Wait and verify
      await new Promise(resolve => setTimeout(resolve, 5000));
      const verifyResult = runServerCommand(
        'curl -s --max-time 10 http://localhost:3001/api/health',
        'Verifying backend after restart',
        true
      );
      
      if (verifyResult.success) {
        log('✅ Backend restart verification successful!');
      } else {
        log('❌ Backend restart verification failed!', 'ERROR');
      }
    } else {
      log('❌ Failed to restart backend!', 'ERROR');
    }
  } else {
    log('✅ Backend is healthy, no restart needed');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--restart')) {
    await autoRestart();
  } else if (args.includes('--help')) {
    console.log(`
Usage: node production-monitor.cjs [options]

Options:
  --restart    Check and auto-restart services if needed
  --help       Show this help message

Examples:
  node production-monitor.cjs              # Run health check
  node production-monitor.cjs --restart    # Check and restart if needed
    `);
  } else {
    await runHealthCheck();
  }
}

main().catch(error => {
  log(`Script failed: ${error.message}`, 'ERROR');
  process.exit(1);
}); 