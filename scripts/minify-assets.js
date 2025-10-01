#!/usr/bin/env node

/**
 * Asset Minification Script for AI Buffet
 * Minifies CSS and JS files without external dependencies
 * Uses built-in Node.js modules only
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '..');
const CSS_INPUT = path.join(ROOT_DIR, 'assets/css/main.css');
const CSS_OUTPUT = path.join(ROOT_DIR, 'assets/css/main.min.css');
const JS_INPUT = path.join(ROOT_DIR, 'assets/js/main.js');
const JS_OUTPUT = path.join(ROOT_DIR, 'assets/js/main.min.js');

/**
 * Simple CSS minifier
 * Removes comments, whitespace, and unnecessary characters
 */
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove newlines and multiple spaces
        .replace(/\s+/g, ' ')
        // Remove spaces around special characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove spaces before !important
        .replace(/\s*!important/g, '!important')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        // Remove units from 0 values
        .replace(/(:|\s)0(px|em|rem|%|vh|vw|pt)/g, '$10')
        // Trim
        .trim();
}

/**
 * Simple JS minifier
 * Removes comments, console.logs, and unnecessary whitespace
 * Note: For production use, consider using terser or uglify-js
 */
function minifyJS(js) {
    return js
        // Remove single-line comments (except URLs)
        .replace(/([^:]|^)\/\/.*$/gm, '$1')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove console.log statements (optional - comment out if needed for debugging)
        .replace(/console\.(log|debug|info|warn)\(.*?\);?/g, '')
        // Remove excessive whitespace but preserve single spaces
        .replace(/\s+/g, ' ')
        // Remove spaces around operators and symbols (carefully)
        .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
        // Restore space after keywords
        .replace(/(if|for|while|function|return|const|let|var|new|typeof)\(/g, '$1 (')
        // Remove trailing semicolons before }
        .replace(/;}/g, '}')
        // Trim
        .trim();
}

/**
 * Calculate file size reduction
 */
function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Minify CSS file
 */
function processCSS() {
    console.log('📦 Minifying CSS...');

    const css = fs.readFileSync(CSS_INPUT, 'utf8');
    const minified = minifyCSS(css);

    fs.writeFileSync(CSS_OUTPUT, minified, 'utf8');

    const originalSize = getFileSize(CSS_INPUT);
    const minifiedSize = getFileSize(CSS_OUTPUT);
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

    console.log(`✅ CSS minified successfully!`);
    console.log(`   Original:  ${formatBytes(originalSize)}`);
    console.log(`   Minified:  ${formatBytes(minifiedSize)}`);
    console.log(`   Reduction: ${reduction}%`);
}

/**
 * Minify JS file
 */
function processJS() {
    console.log('\n📦 Minifying JavaScript...');

    const js = fs.readFileSync(JS_INPUT, 'utf8');
    const minified = minifyJS(js);

    fs.writeFileSync(JS_OUTPUT, minified, 'utf8');

    const originalSize = getFileSize(JS_INPUT);
    const minifiedSize = getFileSize(JS_OUTPUT);
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

    console.log(`✅ JavaScript minified successfully!`);
    console.log(`   Original:  ${formatBytes(originalSize)}`);
    console.log(`   Minified:  ${formatBytes(minifiedSize)}`);
    console.log(`   Reduction: ${reduction}%`);
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Starting asset minification...\n');

    try {
        processCSS();
        processJS();

        console.log('\n✨ All assets minified successfully!');
        console.log('💡 Update your HTML files to reference .min.css and .min.js files');
    } catch (error) {
        console.error('❌ Error during minification:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { minifyCSS, minifyJS };
