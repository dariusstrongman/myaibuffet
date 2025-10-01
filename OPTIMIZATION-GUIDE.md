# AI Buffet - Performance Optimization Guide

## 🚀 Overview

This guide covers all Phase 1 performance optimizations implemented to achieve 95+ Lighthouse score and <2s load times.

**Optimizations Completed:**
- ✅ CSS/JS minification (29% CSS, 38% JS reduction)
- ✅ Critical CSS extraction (21KB inline)
- ✅ Service Worker for offline caching
- ✅ Optimized font loading strategy
- ✅ Lazy loading images with WebP support
- ✅ Resource hints (preconnect, dns-prefetch)

---

## 📦 Build System

### Quick Start

```bash
# Full production build
npm run build

# Individual optimizations
npm run minify           # Minify CSS/JS only
npm run critical-css     # Extract critical CSS
npm run generate-articles # Generate article pages

# Local testing
npm run serve            # Start on port 8000
npm run serve-alt        # Start on port 8001
```

### Build Output

```
assets/css/
├── main.css          # Original (131KB)
├── main.min.css      # Minified (92KB) - 29% reduction
└── critical.css      # Critical CSS (21KB) - inline in <head>

assets/js/
├── main.js           # Original (72KB)
├── main.min.js       # Minified (44KB) - 38% reduction
└── font-loader.js    # Async font loader

sw.js                 # Service worker for caching
```

---

## 🎯 Implementation Checklist

### Step 1: Update HTML Files

**Before deploying, update your HTML to use optimized assets:**

#### 1.1 Update `<head>` section

```html
<head>
    <!-- ... existing meta tags ... -->

    <!-- STEP 1: Inline Critical CSS -->
    <style>
        /* Copy contents of assets/css/critical.css here */
    </style>

    <!-- STEP 2: Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">

    <!-- STEP 3: Defer main CSS (non-blocking) -->
    <link rel="preload"
          href="/assets/css/main.min.css"
          as="style"
          onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="/assets/css/main.min.css">
    </noscript>

    <!-- STEP 4: Load fonts asynchronously -->
    <script async src="/assets/js/font-loader.js"></script>

    <!-- STEP 5: Register Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW failed', err));
            });
        }
    </script>

    <!-- STEP 6: Preload critical JS -->
    <link rel="preload" href="/assets/js/main.min.js" as="script">
</head>
```

#### 1.2 Update `<body>` - Load minified JS

**Replace:**
```html
<script src="/assets/js/main.js"></script>
```

**With:**
```html
<script src="/assets/js/main.min.js" defer></script>
```

### Step 2: Image Optimization

Your lazy loading is already implemented! To use it:

```html
<!-- Use data-src for lazy loading -->
<img data-src="/path/to/image.jpg"
     alt="Description"
     class="lazy-loading"
     loading="lazy">
```

**For WebP support, create WebP versions:**

```bash
# Convert existing images to WebP
for img in img/*.jpg; do
    cwebp -q 85 "$img" -o "${img%.jpg}.webp"
done
```

The lazy loader will automatically use WebP if available and supported.

### Step 3: Service Worker Cache Strategy

The service worker caches:
- Static assets (CSS, JS, images)
- Article pages (runtime cache, max 50)
- Offline fallback

**Cache invalidation:**
- Update `CACHE_VERSION` in `sw.js` when deploying
- Old caches auto-delete on activation

---

## 🔧 Advanced Optimizations

### Font Loading Strategy

The font loader (`font-loader.js`) implements:
- CSS Font Loading API with fallback
- Session storage caching
- FOUT/FOIT prevention
- System font fallback

**Fonts loaded:**
- Inter (400, 500, 600)
- DM Serif Display (400)

### Service Worker Configuration

Edit `sw.js` to customize:

```javascript
const CACHE_VERSION = 'ai-buffet-v1.0.0';  // Change on deploy
const MAX_RUNTIME_CACHE_SIZE = 50;         // Max cached pages

const STATIC_ASSETS = [
    // Add/remove static assets to cache
];
```

---

## 📊 Performance Targets

### Before Optimization
- CSS: 131KB
- JS: 72KB
- Total: 203KB
- Load time: ~4-5s
- Lighthouse: 70-80

### After Optimization
- CSS: 92KB minified + 21KB critical inline
- JS: 44KB minified
- Total: ~157KB
- **Target load time: <2s**
- **Target Lighthouse: 95+**

---

## 🧪 Testing

### Local Testing

```bash
# 1. Build production assets
npm run build

# 2. Start local server
npm run serve

# 3. Open browser
http://localhost:8000
```

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:8000
```

### Performance Checklist

- [ ] All CSS/JS files minified
- [ ] Critical CSS inlined in <head>
- [ ] Service worker registered and active
- [ ] Images lazy loading
- [ ] Fonts loading asynchronously
- [ ] No render-blocking resources
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.8s

---

## 🚢 Deployment

### Pre-deployment Checklist

1. **Run full build:**
   ```bash
   npm run build
   ```

2. **Update service worker version:**
   ```javascript
   // In sw.js
   const CACHE_VERSION = 'ai-buffet-v1.0.1'; // Increment!
   ```

3. **Test locally:**
   ```bash
   npm run serve
   # Visit http://localhost:8000
   # Test navigation, search, tabs
   ```

4. **Run Lighthouse audit:**
   - Target: 95+ performance score
   - Check all metrics green

5. **Update HTML files:**
   - Use minified CSS/JS
   - Inline critical CSS
   - Add service worker registration

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "Performance optimizations: minification, critical CSS, service worker"
   git push
   ```

### Post-deployment Verification

1. Check service worker: DevTools → Application → Service Workers
2. Verify caching: DevTools → Network → Disable cache → Reload → Enable cache → Reload
3. Test offline: DevTools → Network → Offline
4. Run production Lighthouse audit

---

## 🛠️ Troubleshooting

### Issue: Service worker not registering

**Solution:**
- Must use HTTPS or localhost
- Check console for errors
- Verify `sw.js` is at root directory

### Issue: Critical CSS not rendering correctly

**Solution:**
- Regenerate critical CSS: `npm run critical-css`
- Ensure all critical selectors included
- Check for syntax errors

### Issue: Fonts not loading

**Solution:**
- Check browser console for errors
- Verify Google Fonts is accessible
- Check font-loader.js loaded correctly

### Issue: Images not lazy loading

**Solution:**
- Ensure `data-src` attribute used (not `src`)
- Check Intersection Observer support
- Verify `main.min.js` loaded

---

## 📈 Next Steps (Phase 2+)

After deploying Phase 1 optimizations:

1. **Content Strategy**
   - Create pillar content pages
   - Add comparison tools
   - Weekly roundup articles

2. **SEO Enhancements**
   - Generate XML sitemap
   - Add breadcrumb structured data
   - Internal linking automation

3. **User Engagement**
   - Add comment system
   - Newsletter signup optimization
   - Reading time estimates

4. **Analytics**
   - Setup GA4 events
   - Track user engagement
   - Monitor Core Web Vitals

---

## 📚 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Critical CSS](https://web.dev/extract-critical-css/)

---

## 🤝 Support

Questions or issues? Check:
- Build logs: Look for errors during `npm run build`
- Browser console: Check for JS errors
- Network tab: Verify assets loading correctly
- Lighthouse report: Identify specific issues

---

**Last Updated:** 2025-10-01
**Version:** 1.0.0
