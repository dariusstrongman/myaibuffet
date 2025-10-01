#!/bin/bash

# Regenerate Articles with Enhanced SEO Features
# This script backs up and regenerates RSS articles with new SEO enhancements

echo "🚀 Regenerating articles with SEO enhancements..."
echo ""

# Backup existing articles
BACKUP_DIR="/home/darius/Documents/myaibuffet/articles/rss_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at: $BACKUP_DIR"
cp -r /home/darius/Documents/myaibuffet/articles/rss "$BACKUP_DIR"
echo "✅ Backup created"
echo ""

# Remove existing articles to trigger regeneration
echo "🗑️  Removing existing articles to trigger regeneration..."
rm -rf /home/darius/Documents/myaibuffet/articles/rss/*.html
echo "✅ Existing articles removed"
echo ""

# Regenerate articles with new SEO features
echo "🔄 Regenerating articles with enhanced SEO..."
cd /home/darius/Documents/myaibuffet
npm run generate-articles

echo ""
echo "✨ Done! All articles now have:"
echo "   • Reading time"
echo "   • Related articles (smart matching)"
echo "   • Enhanced structured data (Article + Breadcrumb schema)"
echo "   • Better internal linking"
echo ""
echo "📁 Backup saved at: $BACKUP_DIR"
