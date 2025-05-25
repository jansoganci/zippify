#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 FRONTEND DEPLOYMENT FIX SCRIPT');
console.log('==================================');

const SERVER_IP = '64.23.195.7';

const runServerCommand = (command, description) => {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Command: ${command}`);
  try {
    const result = execSync(`ssh -o StrictHostKeyChecking=no root@${SERVER_IP} "${command}"`, { 
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
};

const commands = [
  'cd /root/zippify && git status && git log --oneline -3',
  'cd /root/zippify && git fetch origin && git reset --hard origin/master',
  'cd /root/zippify && npm install',
  'cd /root/zippify && npm run build',
  'cd /root/zippify && rm -rf /var/www/zippify/* && cp -r dist/* /var/www/zippify/',
  'systemctl reload nginx',
  'curl -I http://localhost/'
];

console.log('🚀 Starting frontend deployment fix...\n');

commands.forEach((cmd, index) => {
  runServerCommand(cmd, `Step ${index + 1}`);
});

console.log('\n✅ Frontend deployment fix completed!'); 