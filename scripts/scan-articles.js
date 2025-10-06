#!/usr/bin/env node

/**
 * Article Scanner and Metadata Generator
 * Scans /articles folder for HTML files and generates articles.json
 * This allows new articles pushed to the repo to be automatically discovered
 */

const fs = require('fs').promises;
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '../articles');
const OUTPUT_FILE = path.join(__dirname, '../articles.json');

/**
 * Extract metadata from HTML file
 */
async function extractArticleMetadata(filePath, fileName) {
    try {
        const content = await fs.readFile(filePath, 'utf8');

        // Extract title from <title> tag
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' | AI Buffet', '').trim() : fileName.replace('.html', '');

        // Extract description from meta tag
        const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        const description = descMatch ? descMatch[1] : '';

        // Extract keywords
        const keywordsMatch = content.match(/<meta\s+name="keywords"\s+content="(.*?)"/i);
        const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];

        // Extract date from meta or article content
        let pubDate = new Date();
        const dateMatch = content.match(/<time\s+datetime="([^"]+)"/i) ||
                         content.match(/📅\s+([^<]+)</i) ||
                         content.match(/<span>📅\s+([^<]+)<\/span>/i);

        if (dateMatch) {
            try {
                pubDate = new Date(dateMatch[1]);
            } catch (e) {
                // Use file modification time as fallback
                const stats = await fs.stat(filePath);
                pubDate = stats.mtime;
            }
        } else {
            // Use file modification time as fallback
            const stats = await fs.stat(filePath);
            pubDate = stats.mtime;
        }

        // Extract featured image
        const imgMatch = content.match(/<meta\s+property="og:image"\s+content="(.*?)"/i);
        const image = imgMatch ? imgMatch[1] : 'https://myaibuffet.com/og-image.jpg';

        // Extract author
        const authorMatch = content.match(/<meta\s+name="author"\s+content="(.*?)"/i) ||
                           content.match(/👤\s+([^<]+)</i);
        const author = authorMatch ? authorMatch[1].replace(/<[^>]*>/g, '').trim() : 'AI Buffet Team';

        // Calculate reading time (estimate from content length)
        const textContent = content.replace(/<[^>]+>/g, ' ');
        const wordCount = textContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average 200 words per minute

        // Determine category from filename or content
        let category = 'AI News';
        if (fileName.toLowerCase().includes('tool')) {
            category = 'AI Tools';
        } else if (fileName.toLowerCase().includes('marketing')) {
            category = 'Marketing';
        } else if (fileName.toLowerCase().includes('prompt')) {
            category = 'Prompts';
        } else if (content.toLowerCase().includes('ai tools')) {
            category = 'AI Tools';
        }

        // Generate slug from filename
        const slug = fileName.replace('.html', '');

        return {
            slug,
            title,
            description: description.substring(0, 200),
            author,
            category,
            keywords: keywords.slice(0, 5), // Keep top 5 keywords
            image,
            pubDate: pubDate.toISOString(),
            readingTime,
            url: `/articles/${fileName}`,
            featured: false // Can be manually set to true later
        };
    } catch (error) {
        console.error(`❌ Error extracting metadata from ${fileName}:`, error.message);
        return null;
    }
}

/**
 * Scan articles directory
 */
async function scanArticles() {
    try {
        console.log('📂 Scanning articles directory...');

        const files = await fs.readdir(ARTICLES_DIR);
        const htmlFiles = files.filter(file =>
            file.endsWith('.html') &&
            !file.startsWith('_') // Ignore template files
        );

        console.log(`📄 Found ${htmlFiles.length} HTML files`);

        const articles = [];
        for (const file of htmlFiles) {
            const filePath = path.join(ARTICLES_DIR, file);
            const metadata = await extractArticleMetadata(filePath, file);

            if (metadata) {
                articles.push(metadata);
            }
        }

        // Sort by date (newest first)
        articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Mark the first 3 as featured
        if (articles.length > 0) articles[0].featured = true;
        if (articles.length > 1) articles[1].featured = true;
        if (articles.length > 2) articles[2].featured = true;

        return articles;
    } catch (error) {
        console.error('❌ Error scanning articles:', error);
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting article scan...');
    console.log(`📂 Articles directory: ${ARTICLES_DIR}`);
    console.log(`📝 Output file: ${OUTPUT_FILE}`);
    console.log('');

    try {
        // Scan articles
        const articles = await scanArticles();

        if (articles.length === 0) {
            console.log('⚠️  No articles found');
            return;
        }

        // Generate output
        const output = {
            generated: new Date().toISOString(),
            count: articles.length,
            articles: articles
        };

        // Write to file
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

        console.log('✅ Article scan complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Total articles found: ${articles.length}`);
        console.log(`   - Featured articles: ${articles.filter(a => a.featured).length}`);
        console.log(`   - Categories: ${[...new Set(articles.map(a => a.category))].join(', ')}`);
        console.log(`   - Output file: ${OUTPUT_FILE}`);
        console.log('');
        console.log('💡 Articles are now discoverable on the website!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, scanArticles, extractArticleMetadata };
