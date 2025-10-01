#!/usr/bin/env node

/**
 * AI Buffet - Production Build Script
 * Runs all optimizations and prepares assets for production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

console.log('🚀 Starting production build for AI Buffet...\n');
console.log('═══════════════════════════════════════════════\n');

/**
 * Step 1: Minify CSS and JS
 */
function minifyAssets() {
    console.log('📦 Step 1: Minifying assets...');
    try {
        execSync('node scripts/minify-assets.js', { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log('');
    } catch (error) {
        console.error('❌ Asset minification failed');
        throw error;
    }
}

/**
 * Step 2: Extract critical CSS
 */
function extractCriticalCSS() {
    console.log('🎯 Step 2: Extracting critical CSS...');
    try {
        execSync('node scripts/extract-critical-css.js', { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log('');
    } catch (error) {
        console.error('❌ Critical CSS extraction failed');
        throw error;
    }
}

/**
 * Step 3: Generate article pages
 */
function generateArticles() {
    console.log('📝 Step 3: Generating article pages...');
    try {
        execSync('node scripts/generate-article-pages.js', { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log('');
    } catch (error) {
        console.error('❌ Article generation failed');
        throw error;
    }
}

/**
 * Step 4: Create build summary
 */
function createBuildSummary() {
    console.log('📊 Step 4: Creating build summary...\n');

    const summary = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        files: {}
    };

    const filesToCheck = [
        'assets/css/main.css',
        'assets/css/main.min.css',
        'assets/css/critical.css',
        'assets/js/main.js',
        'assets/js/main.min.js'
    ];

    filesToCheck.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            summary.files[file] = {
                size: stats.size,
                sizeKB: (stats.size / 1024).toFixed(2) + ' KB'
            };
        }
    });

    // Calculate savings
    const cssOriginal = summary.files['assets/css/main.css']?.size || 0;
    const cssMinified = summary.files['assets/css/main.min.css']?.size || 0;
    const cssSavings = cssOriginal - cssMinified;
    const cssSavingsPercent = ((cssSavings / cssOriginal) * 100).toFixed(2);

    const jsOriginal = summary.files['assets/js/main.js']?.size || 0;
    const jsMinified = summary.files['assets/js/main.min.js']?.size || 0;
    const jsSavings = jsOriginal - jsMinified;
    const jsSavingsPercent = ((jsSavings / jsOriginal) * 100).toFixed(2);

    console.log('📈 Build Summary:');
    console.log('─────────────────────────────────────────────');
    console.log(`CSS Optimization:    ${cssSavingsPercent}% reduction`);
    console.log(`JS Optimization:     ${jsSavingsPercent}% reduction`);
    console.log(`Critical CSS:        ${summary.files['assets/css/critical.css']?.sizeKB || 'N/A'}`);
    console.log('─────────────────────────────────────────────\n');

    // Save summary to file
    const summaryPath = path.join(ROOT_DIR, 'build-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Build summary saved to: build-summary.json\n`);

    return summary;
}

/**
 * Step 5: Display next steps
 */
function displayNextSteps() {
    console.log('═══════════════════════════════════════════════');
    console.log('✨ Build completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Update HTML files to use minified assets');
    console.log('   2. Inline critical CSS in <head>');
    console.log('   3. Implement deferred CSS loading');
    console.log('   4. Register service worker');
    console.log('   5. Test on localhost');
    console.log('   6. Run Lighthouse audit');
    console.log('   7. Deploy to production\n');
    console.log('💡 Tip: Run npm run serve to test locally');
    console.log('═══════════════════════════════════════════════\n');
}

/**
 * Main build process
 */
async function build() {
    const startTime = Date.now();

    try {
        minifyAssets();
        extractCriticalCSS();
        generateArticles();
        createBuildSummary();
        displayNextSteps();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️  Total build time: ${duration}s\n`);

    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build
build();
