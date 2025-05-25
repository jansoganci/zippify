#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📊 ZIPPIFY PRODUCTION DASHBOARD');
console.log('===============================');

const SERVER_IP = '64.23.195.7';

const runServerCommand = (command) => {
  try {
    const result = execSync(`ssh -o StrictHostKeyChecking=no root@${SERVER_IP} "${command}"`, { 
      encoding: 'utf-8',
      timeout: 15000
    });
    return result.trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function showDashboard() {
  console.log(`🕐 Current Time: ${new Date().toLocaleString()}`);
  console.log('');

  // System Information
  console.log('🖥️  SYSTEM STATUS');
  console.log('================');
  
  const uptime = runServerCommand('uptime');
  console.log(`⏱️  Server Uptime: ${uptime}`);
  
  const diskUsage = runServerCommand('df -h / | tail -1');
  console.log(`💾 Disk Usage: ${diskUsage}`);
  
  const memUsage = runServerCommand('free -h');
  console.log(`🧠 Memory Usage:`);
  console.log(memUsage);
  console.log('');

  // Service Status
  console.log('🔧 SERVICE STATUS');
  console.log('=================');
  
  const pm2Status = runServerCommand('pm2 status zippify-backend --no-color');
  console.log('📦 PM2 Backend Status:');
  console.log(pm2Status);
  console.log('');

  const nginxStatus = runServerCommand('systemctl is-active nginx');
  console.log(`🌐 Nginx Status: ${nginxStatus === 'active' ? '✅ Running' : '❌ Not Running'}`);
  console.log('');

  // Health Checks
  console.log('🏥 HEALTH CHECKS');
  console.log('================');
  
  const backendHealth = runServerCommand('curl -s --max-time 5 http://localhost:3001/api/health');
  console.log(`🔌 Backend Health: ${backendHealth.includes('OK') ? '✅ Healthy' : '❌ Unhealthy'}`);
  if (backendHealth.includes('OK')) {
    console.log(`   Response: ${backendHealth}`);
  }
  
  const frontendHealth = runServerCommand('curl -s -I http://localhost/ | head -1');
  console.log(`🌍 Frontend Health: ${frontendHealth.includes('200') ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Response: ${frontendHealth}`);
  console.log('');

  // Database Status
  console.log('🗄️  DATABASE STATUS');
  console.log('==================');
  
  const dbSize = runServerCommand('cd /root/zippify/backend && ls -lh db/zippify.db');
  console.log(`📁 Database File: ${dbSize}`);
  
  const dbIntegrity = runServerCommand('cd /root/zippify/backend && sqlite3 db/zippify.db "SELECT count(*) FROM sqlite_master;" 2>/dev/null || echo "ERROR"');
  console.log(`🔍 Database Integrity: ${dbIntegrity !== 'ERROR' ? '✅ Valid' : '❌ Error'}`);
  if (dbIntegrity !== 'ERROR') {
    console.log(`   Tables Count: ${dbIntegrity}`);
  }
  console.log('');

  // Backup Status
  console.log('💾 BACKUP STATUS');
  console.log('================');
  
  const backupCount = runServerCommand('cd /root/zippify && ls backups/*.db 2>/dev/null | wc -l || echo "0"');
  console.log(`📦 Total Backups: ${backupCount}`);
  
  const latestBackup = runServerCommand('cd /root/zippify && ls -t backups/*.db 2>/dev/null | head -1 || echo "No backups"');
  if (latestBackup !== 'No backups') {
    const backupInfo = runServerCommand(`cd /root/zippify && ls -la "${latestBackup}"`);
    console.log(`📅 Latest Backup: ${backupInfo}`);
  } else {
    console.log('📅 Latest Backup: ❌ No backups found');
  }
  console.log('');

  // Recent Logs
  console.log('📋 RECENT ACTIVITY');
  console.log('==================');
  
  console.log('🔴 Recent Nginx Errors (last 3):');
  const nginxErrors = runServerCommand('tail -3 /var/log/nginx/error.log 2>/dev/null || echo "No recent errors"');
  console.log(nginxErrors || 'No recent errors');
  console.log('');

  console.log('📊 Recent PM2 Logs (last 5):');
  const pm2Logs = runServerCommand('pm2 logs zippify-backend --lines 5 --no-color 2>/dev/null || echo "No logs available"');
  console.log(pm2Logs);
  console.log('');

  // Git Status
  console.log('📂 CODE STATUS');
  console.log('==============');
  
  const gitStatus = runServerCommand('cd /root/zippify && git log --oneline -3');
  console.log('🔀 Recent Commits:');
  console.log(gitStatus);
  
  const gitBranch = runServerCommand('cd /root/zippify && git branch --show-current');
  console.log(`🌿 Current Branch: ${gitBranch}`);
  console.log('');

  // Network Status
  console.log('🌐 NETWORK STATUS');
  console.log('=================');
  
  const publicIP = runServerCommand('curl -s --max-time 3 ifconfig.me || echo "Unknown"');
  console.log(`🌍 Public IP: ${publicIP}`);
  
  const portCheck = runServerCommand('netstat -tulpn | grep :3001');
  console.log(`🔌 Port 3001: ${portCheck ? '✅ Open' : '❌ Closed'}`);
  
  const port80Check = runServerCommand('netstat -tulpn | grep :80');
  console.log(`🔌 Port 80: ${port80Check ? '✅ Open' : '❌ Closed'}`);
  console.log('');

  // Quick Actions
  console.log('⚡ QUICK ACTIONS');
  console.log('================');
  console.log('📊 node scripts/production-monitor.cjs          # Run health check');
  console.log('🔄 node scripts/production-monitor.cjs --restart # Check and restart if needed');
  console.log('💾 node scripts/scheduled-backup.cjs            # Manual backup');
  console.log('📋 node scripts/scheduled-backup.cjs --list     # List all backups');
  console.log('🕐 ./scripts/setup-cron-jobs.sh                 # Setup automated jobs');
  console.log('');

  console.log('✅ Dashboard updated at:', new Date().toLocaleString());
}

showDashboard().catch(error => {
  console.error('Dashboard failed:', error.message);
  process.exit(1);
});