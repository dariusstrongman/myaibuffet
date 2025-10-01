#!/usr/bin/env node

/**
 * Critical CSS Extractor for AI Buffet
 * Extracts above-the-fold CSS for faster initial page load
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CSS_INPUT = path.join(ROOT_DIR, 'assets/css/main.css');
const CRITICAL_OUTPUT = path.join(ROOT_DIR, 'assets/css/critical.css');

/**
 * Critical CSS selectors - above the fold content
 * These are loaded inline in the <head>
 */
const CRITICAL_SELECTORS = [
    // CSS Reset & Variables
    ':root',
    '[data-theme="light"]',
    '*', '*::before', '*::after',
    'html', 'body',

    // Header & Navigation
    '.header',
    '.header__container',
    '.header__logo',
    '.header__nav',
    '.nav-links',
    '.nav-links__item',
    '.nav-link',

    // Hero Section (above the fold)
    '.hero',
    '.hero__container',
    '.hero__content',
    '.hero__title',
    '.hero__subtitle',
    '.hero__description',
    '.hero__cta',
    '.btn',
    '.btn-primary',
    '.btn-cta',

    // Typography (critical for initial render)
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'strong', 'em',

    // Layout containers
    '.container',
    '.section',

    // Mobile menu toggle (visible on mobile)
    '.mobile-menu-toggle',

    // Loading states
    '.loading',
    '.skeleton'
];

/**
 * Extract critical CSS rules
 */
function extractCriticalCSS(css) {
    const criticalCSS = [];

    // Extract CSS custom properties (variables)
    const rootVarsMatch = css.match(/:root\s*{[^}]+}/g);
    if (rootVarsMatch) {
        criticalCSS.push(rootVarsMatch.join('\n'));
    }

    const lightThemeMatch = css.match(/\[data-theme="light"\]\s*{[^}]+}/g);
    if (lightThemeMatch) {
        criticalCSS.push(lightThemeMatch.join('\n'));
    }

    // Extract reset styles
    const resetMatch = css.match(/\/\*\s*CSS Reset.*?\*\/[\s\S]*?(?=\/\*|$)/);
    if (resetMatch) {
        const resetSection = resetMatch[0];
        criticalCSS.push(resetSection.substring(0, resetSection.indexOf('/* =')));
    }

    // Extract critical selectors
    CRITICAL_SELECTORS.forEach(selector => {
        const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedSelector}\\s*{[^}]+}`, 'g');
        const matches = css.match(regex);

        if (matches) {
            criticalCSS.push(...matches);
        }
    });

    // Extract media queries for mobile (critical for responsive design)
    const mobileMediaQuery = css.match(/@media[^{]+max-width:\s*768px[^}]*{[\s\S]*?}\s*}/g);
    if (mobileMediaQuery) {
        criticalCSS.push(...mobileMediaQuery);
    }

    return criticalCSS.join('\n\n');
}

/**
 * Minify CSS
 */
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        .replace(/\s*!important/g, '!important')
        .replace(/;}/g, '}')
        .replace(/(:|\s)0(px|em|rem|%|vh|vw|pt)/g, '$10')
        .trim();
}

/**
 * Main execution
 */
function main() {
    console.log('🎯 Extracting critical CSS...\n');

    try {
        const css = fs.readFileSync(CSS_INPUT, 'utf8');
        let critical = extractCriticalCSS(css);
        critical = minifyCSS(critical);

        // Add header comment
        const header = `/* AI Buffet - Critical CSS (Auto-generated) */\n/* Inline this in <head> for optimal performance */\n\n`;
        critical = header + critical;

        fs.writeFileSync(CRITICAL_OUTPUT, critical, 'utf8');

        const size = Buffer.byteLength(critical, 'utf8');
        const sizeKB = (size / 1024).toFixed(2);

        console.log('✅ Critical CSS extracted successfully!');
        console.log(`   File: assets/css/critical.css`);
        console.log(`   Size: ${sizeKB} KB`);
        console.log('\n💡 Next steps:');
        console.log('   1. Inline critical.css in <head>');
        console.log('   2. Load main.min.css with media="print" onload="this.media=\'all\'"');
        console.log('   3. Add <noscript> fallback for main.css');

    } catch (error) {
        console.error('❌ Error extracting critical CSS:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { extractCriticalCSS };
