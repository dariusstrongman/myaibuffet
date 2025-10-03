#!/usr/bin/env node

/**
 * RSS Article Page Generator for AI Buffet
 * Generates individual HTML pages for each RSS article from Supabase
 * Updates sitemap.xml automatically
 */

const fs = require('fs').promises;
const path = require('path');
const {
    calculateReadingTime,
    findRelatedArticles,
    generateBreadcrumbSchema,
    generateArticleSchema,
    generateRelatedArticlesHTML
} = require('./seo-enhancements');

// Supabase configuration
const SUPABASE_URL = 'https://npetaroffoyjohjiwssf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZXRhcm9mZm95am9oaml3c3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk5OTgsImV4cCI6MjA3MjU4NTk5OH0.oYJ4ETV_zIDx_7KWJlEtcrIrRqy72HYEFzAs37pPzB8';

// Article directories
const ARTICLES_DIR = path.join(__dirname, '../articles');
const RSS_ARTICLES_DIR = path.join(ARTICLES_DIR, 'rss');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');

// Supabase client
let supabase;

// Initialize Supabase (we'll use fetch since this is Node.js)
async function initSupabase() {
    // For Node.js, we'll use fetch directly instead of the Supabase client
    // This avoids dependency issues
}

// Fetch articles from Supabase
async function fetchArticlesFromSupabase() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=*&order=pub_date.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const articles = await response.json();
        console.log(`✅ Fetched ${articles.length} articles from Supabase`);
        return articles;
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
        return [];
    }
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 100); // Limit length
}

// Generate SEO-optimized meta description
function generateMetaDescription(article) {
    let desc = article.description || article.content_snippet || '';

    // Clean up the description
    desc = desc.trim();

    // If too short, add context
    if (desc.length < 50) {
        desc = `${desc} - Latest AI news and expert insights from AI Buffet`.trim();
    }

    // Ensure it ends cleanly (not mid-sentence) and is 150-160 chars
    if (desc.length > 160) {
        desc = desc.substring(0, 157) + '...';
    } else if (desc.length > 150 && desc.length < 160) {
        // Perfect length - keep as is
    } else if (desc.length < 150) {
        // Add period if missing
        if (!desc.match(/[.!?]$/)) {
            desc += '.';
        }
    }

    return desc;
}

// Generate SEO-optimized HTML for an article
function generateArticleHTML(article, allArticles = []) {
    const slug = generateSlug(article.title || 'untitled');
    const title = article.title || 'AI News Article';
    const description = generateMetaDescription(article);
    const author = article.author || 'AI Buffet Team';
    const source = article.source || 'AI Buffet';
    const pubDate = article.pub_date ? new Date(article.pub_date).toISOString() : new Date().toISOString();
    const modDate = article.updated_at ? new Date(article.updated_at).toISOString() : pubDate;
    const canonicalUrl = `https://myaibuffet.com/articles/rss/${slug}.html`;
    const content = article.content_snippet || article.description || 'Article content not available.';
    const originalLink = article.link || '#';

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    // Find related articles
    const relatedArticles = findRelatedArticles(article, allArticles, 3);

    // Generate breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://myaibuffet.com' },
        { name: 'AI News', url: 'https://myaibuffet.com/pages/news.html' },
        { name: title.substring(0, 50), url: canonicalUrl }
    ]);

    // Generate enhanced article schema
    const wordCount = content.split(/\s+/).length;
    const articleSchema = generateArticleSchema(article, canonicalUrl, wordCount);

    // Extract keywords from title and content for SEO
    const keywords = [
        'AI news',
        'artificial intelligence',
        'machine learning',
        ...(title.toLowerCase().includes('chatgpt') ? ['ChatGPT', 'OpenAI'] : []),
        ...(title.toLowerCase().includes('claude') ? ['Claude', 'Anthropic'] : []),
        ...(title.toLowerCase().includes('midjourney') ? ['Midjourney', 'AI art'] : []),
        ...(title.toLowerCase().includes('google') ? ['Google AI', 'Gemini'] : [])
    ].join(', ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | AI Buffet</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="google-site-verification" content="Eed235Tz69iOMTpmaDDzNOCfhjU1R2mDutTMT08uHG4">

    <!-- Canonical URL -->
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://myaibuffet.com/og-image.jpg">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AI Buffet">
    <meta property="article:author" content="${author}">
    <meta property="article:published_time" content="${pubDate}">
    <meta property="article:modified_time" content="${modDate}">
    <meta property="article:section" content="AI News">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://myaibuffet.com/og-image.jpg">

    <!-- Structured Data - Article Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(articleSchema, null, 4)}
    </script>

    <!-- Structured Data - Breadcrumb Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema, null, 4)}
    </script>

    <!-- Favicon and CSS -->
    <link rel="icon" type="image/png" href="../../img/Logo.png">
    <link rel="stylesheet" href="../../assets/css/main.css">
    <link rel="stylesheet" href="../../assets/css/components.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:wght@400&display=swap" rel="stylesheet">

    <!-- Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W16M076SX3"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-W16M076SX3');
    </script>

    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "p5y8qh9w8m");
    </script>
</head>
<body>
    <!-- Header -->
    <header class="header" role="banner">
        <div class="container">
            <nav class="nav" role="navigation" aria-label="Main navigation">
                <a href="../../" class="logo" aria-label="AI Buffet homepage">
                    <span class="logo-icon" aria-hidden="true">🍽️</span>
                    AI Buffet
                </a>
                <ul class="nav-links" role="menubar">
                    <li role="none"><a href="../../" class="nav-link" role="menuitem">Home</a></li>
                    <li role="none"><a href="../../pages/news.html" class="nav-link" role="menuitem">News</a></li>
                    <li role="none"><a href="../../pages/tools.html" class="nav-link" role="menuitem">Tools</a></li>
                    <li role="none"><a href="../../pages/prompts.html" class="nav-link" role="menuitem">Prompts</a></li>
                    <li role="none"><a href="../../pages/ai-use-cases.html" class="nav-link" role="menuitem">Ideas</a></li>
                    <li role="none"><a href="../../pages/faq.html" class="nav-link" role="menuitem">FAQ</a></li>
                    <li role="none"><a href="../../pages/about.html" class="nav-link" role="menuitem">About</a></li>
                </ul>
                <div class="nav-actions">
                    <button class="mobile-menu-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
                        <span class="hamburger"></span>
                    </button>
                </div>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main id="main" role="main">
        <div class="container" style="max-width: 900px; margin: var(--space-8) auto; padding: 0 var(--space-4);">

            <!-- Breadcrumb -->
            <nav aria-label="Breadcrumb" style="margin-bottom: var(--space-6);">
                <ol style="display: flex; gap: var(--space-2); list-style: none; padding: 0; margin: 0; font-size: var(--font-size-sm); color: var(--color-text-tertiary);">
                    <li><a href="../../" style="color: var(--color-text-tertiary); text-decoration: none;">Home</a></li>
                    <li>→</li>
                    <li><a href="../../pages/news.html" style="color: var(--color-text-tertiary); text-decoration: none;">AI News</a></li>
                    <li>→</li>
                    <li style="color: var(--color-text-secondary);">${title.substring(0, 50)}${title.length > 50 ? '...' : ''}</li>
                </ol>
            </nav>

            <!-- Article -->
            <article class="article-container" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: var(--space-8); backdrop-filter: blur(20px);">

                <!-- Article Header -->
                <header class="article-header" style="margin-bottom: var(--space-8);">
                    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); font-size: var(--font-size-sm);">
                        <span style="background: var(--gradient-primary); color: white; padding: var(--space-1) var(--space-3); border-radius: 12px; font-weight: var(--font-weight-semibold);">
                            ${source}
                        </span>
                        <time datetime="${pubDate}" style="color: var(--color-text-tertiary);">
                            ${new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span style="color: var(--color-text-tertiary);">•</span>
                        <span style="color: var(--color-text-tertiary);">${readingTime} min read</span>
                        <span style="color: var(--color-text-tertiary);">•</span>
                        <span style="color: var(--color-text-tertiary);">by ${author}</span>
                        <span style="color: var(--color-text-tertiary);">•</span>
                        <span style="color: var(--color-text-tertiary);">
                            <span id="viewCount">...</span> views
                        </span>
                    </div>

                    <!-- Featured Image -->
                    <div style="margin-bottom: var(--space-6); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-lg);">
                        <img
                            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&auto=format"
                            alt="${title}"
                            loading="lazy"
                            style="width: 100%; height: auto; display: block; aspect-ratio: 1200/630; object-fit: cover;"
                            onerror="this.style.display='none'"
                        />
                    </div>

                    <h1 style="font-family: var(--font-family-display); font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; line-height: var(--line-height-tight); margin-bottom: var(--space-6);">
                        ${title}
                    </h1>

                    ${description !== content ? `<p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); line-height: var(--line-height-relaxed); margin-bottom: var(--space-6);">${description}</p>` : ''}
                </header>

                <!-- Article Content -->
                <div class="article-content" style="font-size: var(--font-size-lg); line-height: var(--line-height-relaxed); color: var(--color-text-primary);">
                    <p>${content}</p>

                    ${originalLink !== '#' ? `
                    <div style="margin-top: var(--space-8); padding: var(--space-6); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px;">
                        <h3 style="margin-bottom: var(--space-4); color: var(--color-text-primary);">📖 Read Full Article</h3>
                        <p style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">
                            This is a summary. For the complete article with full details, analysis, and insights:
                        </p>
                        <a href="${originalLink}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: var(--space-2); background: var(--gradient-primary); color: white; padding: var(--space-3) var(--space-6); border-radius: 12px; text-decoration: none; font-weight: var(--font-weight-semibold); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(34, 211, 238, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
                            <span>Read on ${source}</span>
                            <span>↗</span>
                        </a>
                    </div>
                    ` : ''}
                </div>

                <!-- Article Footer -->
                <footer style="margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--glass-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
                        <div style="color: var(--color-text-tertiary); font-size: var(--font-size-sm);">
                            Published on ${new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style="display: flex; gap: var(--space-3);">
                            <a href="../../pages/news.html" style="color: var(--color-text-secondary); text-decoration: none; font-size: var(--font-size-sm);">← Back to News</a>
                            <a href="../../pages/all-articles.html" style="color: var(--color-text-secondary); text-decoration: none; font-size: var(--font-size-sm);">All Articles →</a>
                        </div>
                    </div>
                </footer>

            </article>

            <!-- Related Articles -->
            ${generateRelatedArticlesHTML(relatedArticles, slug)}

            <!-- Comments Section -->
            <div class="comments-section" style="margin-top: var(--space-16); padding: var(--space-8); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; backdrop-filter: blur(20px);">
                <h2 style="font-family: var(--font-family-display); font-size: var(--font-size-2xl); margin-bottom: var(--space-6); color: var(--color-text-primary);">
                    💬 Discussion
                </h2>
                <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6); font-size: var(--font-size-base);">
                    Share your thoughts and discuss this article with the community. Sign in with GitHub to comment.
                </p>
                <script src="https://giscus.app/client.js"
                    data-repo="yourusername/myaibuffet"
                    data-repo-id="R_placeholder"
                    data-category="Comments"
                    data-category-id="DIC_placeholder"
                    data-mapping="pathname"
                    data-strict="0"
                    data-reactions-enabled="1"
                    data-emit-metadata="0"
                    data-input-position="bottom"
                    data-theme="dark"
                    data-lang="en"
                    crossorigin="anonymous"
                    async>
                </script>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="footer" role="contentinfo">
        <div class="container">
            <div class="footer__content">
                <div class="footer__section footer__section--brand">
                    <div class="footer__brand">
                        <div class="footer__logo">
                            <span class="logo-icon" aria-hidden="true">🍽️</span>
                            AI Buffet
                        </div>
                        <p class="footer__tagline">
                            Premium AI insights served fresh daily
                        </p>
                    </div>
                    <div class="social-links" aria-label="Follow us on social media">
                        <a href="https://www.linkedin.com/company/myaibuffet" class="social-link" target="_blank" rel="noopener" aria-label="Follow us on LinkedIn">
                            <span aria-hidden="true">💼</span>
                        </a>
                        <a href="https://x.com/myaibuffet" class="social-link" target="_blank" rel="noopener" aria-label="Follow us on X (Twitter)">
                            <span aria-hidden="true">🐦</span>
                        </a>
                        <a href="../../static/rss.xml" class="social-link" aria-label="Subscribe to RSS feed">
                            <span aria-hidden="true">📡</span>
                        </a>
                    </div>
                </div>
                <div class="footer__section">
                    <h3 class="footer__heading">Explore</h3>
                    <ul class="footer__links">
                        <li><a href="../../pages/news.html" class="footer__link">AI News</a></li>
                        <li><a href="../../pages/tools.html" class="footer__link">Tool Reviews</a></li>
                        <li><a href="../../pages/all-articles.html" class="footer__link">All Articles</a></li>
                        <li><a href="../../pages/faq.html" class="footer__link">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer__section">
                    <h3 class="footer__heading">Resources</h3>
                    <ul class="footer__links">
                        <li><a href="../../pages/about.html" class="footer__link">About</a></li>
                        <li><a href="mailto:hello@myaibuffet.com" class="footer__link">Contact</a></li>
                        <li><a href="../../#newsletter" class="footer__link">Newsletter</a></li>
                        <li><a href="../../pages/coming-soon.html" class="footer__link" target="_blank" rel="noopener">Free Tools</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer__bottom">
                <div class="footer__legal">
                    <p>&copy; 2025 AI Buffet. All rights reserved.</p>
                </div>
                <div class="footer__credits">
                    <p>Made with care for the AI community</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="../../assets/js/main.js"></script>

    <!-- View Counter Script -->
    <script>
        (async function() {
            const articleSlug = '${slug}';
            const SUPABASE_URL = 'https://npetaroffoyjohjiwssf.supabase.co';
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZXRhcm9mZm95am9oaml3c3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk5OTgsImV4cCI6MjA3MjU4NTk5OH0.oYJ4ETV_zIDx_7KWJlEtcrIrRqy72HYEFzAs37pPzB8';

            try {
                // Increment view count
                const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/increment_article_views', {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ article_slug: articleSlug })
                });

                // Get view count
                const countResponse = await fetch(SUPABASE_URL + '/rest/v1/article_views?article_slug=eq.' + articleSlug + '&select=view_count', {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    }
                });

                if (countResponse.ok) {
                    const data = await countResponse.json();
                    const viewCount = data[0]?.view_count || 0;
                    document.getElementById('viewCount').textContent = viewCount.toLocaleString();
                } else {
                    document.getElementById('viewCount').textContent = '—';
                }
            } catch (error) {
                console.log('View counter unavailable');
                document.getElementById('viewCount').textContent = '—';
            }
        })();
    </script>
</body>
</html>`;
}

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(ARTICLES_DIR, { recursive: true });
        await fs.mkdir(RSS_ARTICLES_DIR, { recursive: true });
        console.log('✅ Directories created/verified');
    } catch (error) {
        console.error('❌ Error creating directories:', error);
    }
}

// Generate article pages
async function generateArticlePages(articles) {
    let generatedCount = 0;
    const existingFiles = new Set();

    // Get existing files to avoid duplicates
    try {
        const files = await fs.readdir(RSS_ARTICLES_DIR);
        files.forEach(file => existingFiles.add(file));
    } catch (error) {
        // Directory doesn't exist yet, that's fine
    }

    for (const article of articles) {
        try {
            const slug = generateSlug(article.title || 'untitled');
            const filename = `${slug}.html`;
            const filepath = path.join(RSS_ARTICLES_DIR, filename);

            // Skip if file already exists (avoid regenerating)
            if (existingFiles.has(filename)) {
                continue;
            }

            const html = generateArticleHTML(article, articles);
            await fs.writeFile(filepath, html, 'utf8');
            generatedCount++;

            if (generatedCount % 50 === 0) {
                console.log(`✅ Generated ${generatedCount} article pages...`);
            }
        } catch (error) {
            console.error(`❌ Error generating page for article "${article.title}":`, error);
        }
    }

    console.log(`✅ Generated ${generatedCount} new article pages`);
    return generatedCount;
}

// Update sitemap with all articles
async function updateSitemap(articles) {
    try {
        // Read existing sitemap
        let sitemap;
        try {
            sitemap = await fs.readFile(SITEMAP_PATH, 'utf8');
        } catch (error) {
            // Create basic sitemap if it doesn't exist
            sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
        }

        // Remove existing RSS article entries
        sitemap = sitemap.replace(/<url>\s*<loc>https:\/\/myaibuffet\.com\/articles\/rss\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

        // Generate new RSS article entries
        const rssArticleEntries = articles.map(article => {
            const slug = generateSlug(article.title || 'untitled');
            const url = `https://myaibuffet.com/articles/rss/${slug}.html`;
            const lastmod = article.updated_at || article.pub_date || new Date().toISOString();
            const priority = '0.7'; // RSS articles get good priority but less than original content

            return `    <url>
        <loc>${url}</loc>
        <lastmod>${lastmod.split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
    </url>`;
        }).join('\n');

        // Insert RSS article entries before closing urlset tag
        sitemap = sitemap.replace('</urlset>', `${rssArticleEntries}\n</urlset>`);

        // Write updated sitemap
        await fs.writeFile(SITEMAP_PATH, sitemap, 'utf8');
        console.log(`✅ Updated sitemap with ${articles.length} RSS articles`);
    } catch (error) {
        console.error('❌ Error updating sitemap:', error);
    }
}

// Main function
async function main() {
    console.log('🚀 Starting RSS Article Page Generation...');
    console.log(`📂 Articles directory: ${RSS_ARTICLES_DIR}`);
    console.log(`🗺️  Sitemap path: ${SITEMAP_PATH}`);

    try {
        // Ensure directories exist
        await ensureDirectories();

        // Fetch articles from Supabase
        const articles = await fetchArticlesFromSupabase();

        if (articles.length === 0) {
            console.log('⚠️  No articles found in Supabase');
            return;
        }

        // Generate article pages
        const generatedCount = await generateArticlePages(articles);

        // Update sitemap
        await updateSitemap(articles);

        console.log('🎉 Article page generation completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Total articles in database: ${articles.length}`);
        console.log(`   - New pages generated: ${generatedCount}`);
        console.log(`   - Articles directory: ${RSS_ARTICLES_DIR}`);
        console.log(`   - Sitemap updated: ${SITEMAP_PATH}`);
        console.log('');
        console.log('🔍 Google will now be able to index all RSS articles!');
        console.log('💡 Run this script periodically to generate pages for new articles');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, generateArticlePages, updateSitemap };