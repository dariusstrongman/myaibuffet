# Article Workflow - Dynamic Article Discovery System

## Overview

This system automatically discovers and displays articles from the `/articles` folder, making them immediately visible to end users without manual configuration.

## How It Works

### 1. Article Scanning

The `scan-articles.js` script scans the `/articles` folder for HTML files and extracts metadata:

- Title
- Description
- Author
- Category
- Keywords
- Publication date
- Reading time
- Featured image

This metadata is saved to `articles.json` in the root directory.

### 2. Dynamic Display

The homepage (`index.html`) automatically loads articles from:
- **Local articles** (`articles.json`) - Your manually created or n8n-generated articles
- **RSS articles** (Supabase) - Articles from RSS feeds

Both sources are merged and displayed together, with local articles prioritized.

### 3. Automatic Updates

When you push new articles to GitHub, the system automatically:
1. Detects new HTML files in `/articles` folder
2. Scans and extracts metadata
3. Updates `articles.json`
4. Makes the article discoverable on the website

## Workflow for n8n Integration

### When n8n Creates a New Article:

1. **n8n generates article HTML** → Saves to `/articles/` folder
2. **n8n pushes to GitHub** → New article file appears in repo
3. **GitHub Action triggers** → Runs `scan-articles.js`
4. **articles.json updates** → New article metadata is added
5. **Website displays article** → Article appears on homepage automatically

### Manual Workflow:

```bash
# Scan articles and update articles.json
npm run scan-articles

# Build the site (automatically scans articles first)
npm run build

# Serve locally to test
npm run serve
```

## File Structure

```
myaibuffet/
├── articles/
│   ├── top-10-ai-tools-2025.html      # Your articles
│   ├── top-5-ai-marketing-tools.html  # New article from n8n
│   └── rss/                            # RSS articles (auto-generated)
├── articles.json                       # Auto-generated metadata
├── scripts/
│   └── scan-articles.js                # Scanner script
└── .github/workflows/
    └── scan-articles.yml               # Auto-scan on push
```

## Article HTML Requirements

For best results, your article HTML should include:

```html
<title>Your Article Title | AI Buffet</title>
<meta name="description" content="Article description">
<meta name="keywords" content="keyword1, keyword2">
<meta name="author" content="Author Name">
<meta property="og:image" content="https://...">
<time datetime="2025-10-04T00:00:00Z">October 4, 2025</time>
```

The scanner will extract this metadata automatically.

## Testing

After creating a new article:

1. **Run scanner locally:**
   ```bash
   npm run scan-articles
   ```

2. **Check articles.json:**
   ```bash
   cat articles.json
   ```

3. **Test on local server:**
   ```bash
   npm run serve
   # Visit http://localhost:8000
   ```

4. **Push to GitHub:**
   ```bash
   git add articles/your-new-article.html
   git commit -m "Add new article"
   git push
   ```

The GitHub Action will automatically update `articles.json` and your article will be live!

## Customization

### Change Featured Articles

Edit `scripts/scan-articles.js` line 108-111 to control which articles are featured:

```javascript
// Mark the first 3 as featured
if (articles.length > 0) articles[0].featured = true;
if (articles.length > 1) articles[1].featured = true;
if (articles.length > 2) articles[2].featured = true;
```

### Adjust Categories

The scanner auto-detects categories based on filename/content. Edit `scripts/scan-articles.js` line 68-80 to customize.

## Troubleshooting

### Article not showing up?

1. Check if it's in `articles.json`:
   ```bash
   cat articles.json | grep "your-article-slug"
   ```

2. Re-run scanner:
   ```bash
   npm run scan-articles
   ```

3. Check browser console for errors

### Featured badge not showing?

The first 3 articles (by date) are automatically marked as featured. Change this in `scan-articles.js` if needed.

## Benefits

✅ **Automatic Discovery** - New articles appear instantly
✅ **No Manual Updates** - No need to edit homepage code
✅ **GitHub Integration** - Automated via GitHub Actions
✅ **n8n Compatible** - Works seamlessly with automated workflows
✅ **SEO Optimized** - Metadata extracted for best SEO
✅ **Fast Loading** - JSON-based for quick page loads

---

**Need help?** Check the comments in `scripts/scan-articles.js` or create an issue on GitHub.
