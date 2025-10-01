/**
 * AI Buffet - Optimized Font Loader
 * Implements FOIT/FOUT prevention and font preloading
 */

(function() {
    'use strict';

    /**
     * Check if fonts are already cached
     */
    function areFontsCached() {
        return sessionStorage.getItem('fontsLoaded') === 'true';
    }

    /**
     * Mark fonts as cached
     */
    function markFontsAsCached() {
        sessionStorage.setItem('fontsLoaded', 'true');
    }

    /**
     * Load fonts using CSS Font Loading API
     */
    function loadFontsWithAPI() {
        if (!('fonts' in document)) {
            // Fallback to regular font loading
            loadFontsTraditional();
            return;
        }

        const fonts = [
            new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2)', {
                weight: '400',
                style: 'normal',
                display: 'swap'
            }),
            new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)', {
                weight: '500',
                style: 'normal',
                display: 'swap'
            }),
            new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2)', {
                weight: '600',
                style: 'normal',
                display: 'swap'
            }),
            new FontFace('DM Serif Display', 'url(https://fonts.gstatic.com/s/dmserifdisplay/v15/-nFnOHM81r4j6k0gjAW3mujVU2B2K_d709jy92k.woff2)', {
                weight: '400',
                style: 'normal',
                display: 'swap'
            })
        ];

        // Load all fonts
        Promise.all(fonts.map(font => font.load()))
            .then(loadedFonts => {
                loadedFonts.forEach(font => {
                    document.fonts.add(font);
                });

                // Add class to indicate fonts are loaded
                document.documentElement.classList.add('fonts-loaded');
                markFontsAsCached();
            })
            .catch(error => {
                console.error('Font loading failed:', error);
                loadFontsTraditional();
            });
    }

    /**
     * Traditional font loading (fallback)
     */
    function loadFontsTraditional() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:wght@400&display=swap';

        link.onload = function() {
            document.documentElement.classList.add('fonts-loaded');
            markFontsAsCached();
        };

        document.head.appendChild(link);
    }

    /**
     * Initialize font loading
     */
    function init() {
        // If fonts are cached, add class immediately
        if (areFontsCached()) {
            document.documentElement.classList.add('fonts-loaded');
        }

        // Load fonts when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadFontsWithAPI);
        } else {
            loadFontsWithAPI();
        }
    }

    // Run immediately
    init();
})();
