#!/bin/bash

echo "🕐 SETTING UP CRON JOBS FOR ZIPPIFY PRODUCTION"
echo "=============================================="

# Get the current directory (where the scripts are located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"
echo "📁 Scripts directory: $SCRIPT_DIR"

# Function to add cron job if it doesn't exist
add_cron_job() {
    local schedule="$1"
    local command="$2"
    local description="$3"
    
    echo "📝 Adding cron job: $description"
    echo "   Schedule: $schedule"
    echo "   Command: $command"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -F "$command" > /dev/null; then
        echo "   ℹ️  Job already exists, skipping..."
    else
        # Add the new cron job
        (crontab -l 2>/dev/null; echo "$schedule $command") | crontab -
        echo "   ✅ Job added successfully"
    fi
    echo ""
}

# Create log directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "🔧 Setting up cron jobs..."
echo ""

# 1. Daily database backup at 2 AM
add_cron_job \
    "0 2 * * *" \
    "cd $PROJECT_DIR && node scripts/scheduled-backup.cjs >> logs/backup.log 2>&1" \
    "Daily database backup"

# 2. Health check every 15 minutes
add_cron_job \
    "*/15 * * * *" \
    "cd $PROJECT_DIR && node scripts/production-monitor.cjs >> logs/monitoring.log 2>&1" \
    "Health monitoring every 15 minutes"

# 3. Auto-restart check every 5 minutes
add_cron_job \
    "*/5 * * * *" \
    "cd $PROJECT_DIR && node scripts/production-monitor.cjs --restart >> logs/restart.log 2>&1" \
    "Auto-restart check every 5 minutes"

# 4. Weekly backup verification on Sundays at 3 AM
add_cron_job \
    "0 3 * * 0" \
    "cd $PROJECT_DIR && node scripts/scheduled-backup.cjs --verify >> logs/backup-verification.log 2>&1" \
    "Weekly backup verification"

# 5. Monthly log cleanup on the 1st of each month at 1 AM
add_cron_job \
    "0 1 1 * *" \
    "find $PROJECT_DIR/logs -name '*.log' -mtime +30 -delete && echo \"\$(date): Old logs cleaned\" >> $PROJECT_DIR/logs/cleanup.log" \
    "Monthly log cleanup"

echo "📋 Current cron jobs:"
echo "===================="
crontab -l

echo ""
echo "📁 Log files will be created in: $PROJECT_DIR/logs/"
echo ""
echo "🎯 CRON JOB SUMMARY:"
echo "   • Database backup: Daily at 2:00 AM"
echo "   • Health monitoring: Every 15 minutes"
echo "   • Auto-restart: Every 5 minutes"
echo "   • Backup verification: Weekly (Sunday 3:00 AM)"
echo "   • Log cleanup: Monthly (1st day, 1:00 AM)"
echo ""
echo "📊 To monitor the jobs, check these log files:"
echo "   • $PROJECT_DIR/logs/backup.log"
echo "   • $PROJECT_DIR/logs/monitoring.log"
echo "   • $PROJECT_DIR/logs/restart.log"
echo "   • $PROJECT_DIR/logs/backup-verification.log"
echo "   • $PROJECT_DIR/logs/cleanup.log"
echo ""
echo "✅ Cron jobs setup completed!"
echo ""
echo "💡 Useful commands:"
echo "   crontab -l                    # List all cron jobs"
echo "   crontab -e                    # Edit cron jobs"
echo "   tail -f logs/monitoring.log   # Monitor health checks in real-time"
echo "   tail -f logs/backup.log       # Monitor backups in real-time" 