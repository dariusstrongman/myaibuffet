#!/bin/bash

# Setup automatic RSS article generation for AI Buffet
# This script sets up a cron job to run every 2 hours (after n8n RSS updates)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

# Cron job command
CRON_COMMAND="0 */2 * * * cd '$PROJECT_DIR' && /usr/bin/node scripts/generate-article-pages.js >> '$LOG_DIR/article-generation.log' 2>&1"

echo "🚀 Setting up automatic RSS article generation..."
echo "📂 Project directory: $PROJECT_DIR"
echo "📝 Log directory: $LOG_DIR"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   sudo apt update && sudo apt install nodejs npm"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Add cron job (avoid duplicates)
(crontab -l 2>/dev/null | grep -v "generate-article-pages.js"; echo "$CRON_COMMAND") | crontab -

echo "✅ Cron job added successfully!"
echo ""
echo "📅 Schedule: Every 2 hours (00:00, 02:00, 04:00, etc.)"
echo "📝 Logs: $LOG_DIR/article-generation.log"
echo ""
echo "🔍 To verify cron job:"
echo "   crontab -l"
echo ""
echo "🗂️  To view logs:"
echo "   tail -f $LOG_DIR/article-generation.log"
echo ""
echo "🚀 To run manually:"
echo "   cd '$PROJECT_DIR' && npm run generate-articles"
echo ""
echo "⚠️  Note: Make sure n8n RSS updates run before this (every 8 hours)"
echo "    Current schedule checks every 2 hours to catch new articles quickly"