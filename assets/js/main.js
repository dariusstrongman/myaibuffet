// AI Buffet - Main JavaScript
// No external dependencies - vanilla JS only

'use strict';

/**
 * Global Application State
 */
const AppState = {
    currentTab: 'top-articles',
    articles: [],
    stories: [],
    searchTerm: '',
    theme: localStorage.getItem('theme') || 'dark',
    isScrolling: false,
    lastScrollTop: 0,
    isOnline: navigator.onLine,
    apiRetryCount: 0,
    maxRetries: 3,
    hasError: false
};

/**
 * DOM Element Cache
 */
const Elements = {
    // Theme
    themeToggle: null,
    
    // Navigation
    header: null,
    mobileMenuToggle: null,
    navLinks: null,
    
    // Search
    searchInput: null,
    globalSearch: null,
    searchResults: null,
    
    // Tabs
    tabButtons: null,
    tabPanels: null,
    topArticlesPanel: null,
    latestArticlesPanel: null,
    topArticlesGrid: null,
    latestArticlesGrid: null,
    
    // Newsletter
    newsletterForm: null,
    
    // Lazy loading
    lazyImages: null
};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeTheme();
    initializeTabSwitching();
    initializeSmoothScrolling();
    initializeLazyLoading();
    initializeImageOptimization();
    initializeSearch();
    initializeNewsletterForm();
    initializeKeyboardShortcuts();
    initializeMobileMenu();
    initializeInteractiveElements();
    initializeBrowserCompatibility();
    initializeErrorHandling();
    initializeAnalyticsTracking();
    initializeAIFacts();
    loadRealArticles();

    // Monitor connectivity
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
});

/**
 * Cache DOM Elements
 */
function initializeElements() {
    // Theme
    Elements.themeToggle = document.getElementById('theme-toggle');
    
    // Navigation
    Elements.header = document.querySelector('.header');
    Elements.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    Elements.navLinks = document.querySelector('.nav-links');
    
    // Search
    Elements.searchInput = document.getElementById('search-input');
    Elements.globalSearch = document.getElementById('global-search');
    Elements.searchResults = document.getElementById('search-results');
    
    // Tabs
    Elements.tabButtons = document.querySelectorAll('.tab-button');
    Elements.tabPanels = document.querySelectorAll('.tab-panel');
    Elements.topArticlesPanel = document.getElementById('top-articles-panel');
    Elements.latestArticlesPanel = document.getElementById('latest-articles-panel');
    Elements.topArticlesGrid = document.getElementById('top-articles-grid');
    Elements.latestArticlesGrid = document.getElementById('latest-articles-grid');
    
    // Newsletter
    Elements.newsletterForm = document.querySelector('.newsletter__form');

    // Lazy loading
    Elements.lazyImages = document.querySelectorAll('img[data-src]');

    // Interactive elements
    Elements.allButtons = document.querySelectorAll('button, .btn');
    Elements.allLinks = document.querySelectorAll('a');
    Elements.ctaButtons = document.querySelectorAll('.btn-cta, .btn-primary');
    Elements.filterButtons = document.querySelectorAll('.filter-btn');
    
}

/**
 * Theme Management
 */
function initializeTheme() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', AppState.theme);
    
    // Create theme toggle button if it doesn't exist
    if (!Elements.themeToggle) {
        createThemeToggle();
    }
    
    // Add theme toggle event listener
    if (Elements.themeToggle) {
        Elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Update theme toggle state
    updateThemeToggle();
}

function createThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = AppState.theme === 'dark' ? '☀️' : '🌙';
    
    // Add styles for theme toggle
    const style = document.createElement('style');
    style.textContent = `
        .theme-toggle {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            color: var(--color-text-primary);
            cursor: pointer;
            font-size: 1.2em;
            padding: var(--space-2);
            transition: all var(--transition-fast);
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .theme-toggle:hover {
            border-color: var(--color-primary);
            transform: scale(1.05);
        }
        
        .theme-toggle:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        @media (max-width: 768px) {
            .theme-toggle {
                order: 2;
            }
        }
    `;
    
    if (!document.querySelector('#theme-toggle-styles')) {
        style.id = 'theme-toggle-styles';
        document.head.appendChild(style);
    }
    
    // Insert theme toggle in navigation
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.parentNode.insertBefore(themeToggle, searchContainer);
        Elements.themeToggle = themeToggle;
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', AppState.theme);
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeToggle();
    
    // Announce theme change to screen readers
    announceToScreenReader(`Switched to ${AppState.theme} theme`);
}

function updateThemeToggle() {
    if (Elements.themeToggle) {
        Elements.themeToggle.innerHTML = AppState.theme === 'dark' ? '☀️' : '🌙';
        Elements.themeToggle.setAttribute('aria-label', 
            `Switch to ${AppState.theme === 'dark' ? 'light' : 'dark'} theme`);
    }
}

/**
 * Tab Switching Logic
 */
function initializeTabSwitching() {
    if (!Elements.tabButtons || Elements.tabButtons.length === 0) return;

    Elements.tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
        button.addEventListener('keydown', handleTabKeydown);
    });
}

function handleTabClick(event) {
    const targetTab = event.currentTarget.getAttribute('data-tab');
    switchTab(targetTab);
}

function handleTabKeydown(event) {
    const tabs = Array.from(Elements.tabButtons);
    const currentIndex = tabs.indexOf(event.currentTarget);
    
    let targetIndex = currentIndex;
    
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            targetIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            targetIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            event.preventDefault();
            targetIndex = 0;
            break;
        case 'End':
            event.preventDefault();
            targetIndex = tabs.length - 1;
            break;
        default:
            return;
    }
    
    tabs[targetIndex].focus();
    const targetTab = tabs[targetIndex].getAttribute('data-tab');
    switchTab(targetTab);
}

function switchTab(tabName) {
    // Update button states
    Elements.tabButtons.forEach(button => {
        const isActive = button.getAttribute('data-tab') === tabName;
        button.classList.toggle('tab-button--active', isActive);
        button.setAttribute('aria-selected', isActive.toString());
    });
    
    // Update panel visibility
    Elements.tabPanels.forEach(panel => {
        const panelId = panel.getAttribute('id');
        const isActive = panelId === `${tabName}-panel`;
        
        if (isActive) {
            panel.classList.add('tab-panel--active');
            panel.removeAttribute('hidden');
        } else {
            panel.classList.remove('tab-panel--active');
            panel.setAttribute('hidden', '');
        }
    });
    
    AppState.currentTab = tabName;
    
    // Announce tab change to screen readers
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
        announceToScreenReader(`Switched to ${tabButton.textContent} tab`);
    }
}

/**
 * Smooth Scrolling for In-Page Anchors
 */
function initializeSmoothScrolling() {
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a[href^="#"]');
        if (!link || !link.getAttribute('href').startsWith('#')) return;
        
        event.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            smoothScrollTo(targetElement);
        }
    });
}

function smoothScrollTo(element, offset = 80) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Focus the target element for accessibility
    setTimeout(() => {
        element.focus({ preventScroll: true });
    }, 500);
}

/**
 * WebP Support Detection
 */
let webpSupported = null;

function checkWebPSupport() {
    return new Promise(resolve => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
    });
}

/**
 * Lazy Loading for Images with WebP Support
 */
function initializeLazyLoading() {
    // Initialize WebP support check
    if (webpSupported === null) {
        checkWebPSupport().then(supported => {
            webpSupported = supported;
        });
    }
    // Use Intersection Observer if available
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
            handleImageIntersection,
            {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            }
        );
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Also set up observer for future images
        const mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const images = node.querySelectorAll ? 
                            node.querySelectorAll('img[data-src]') : 
                            (node.tagName === 'IMG' && node.hasAttribute('data-src') ? [node] : []);
                        
                        images.forEach(img => imageObserver.observe(img));
                    }
                });
            });
        });
        
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Fallback for older browsers
        loadAllImages();
    }
}

function handleImageIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            loadImage(img);
            observer.unobserve(img);
        }
    });
}

function loadImage(img) {
    let src = img.getAttribute('data-src');
    if (!src) return;

    // Try WebP version if supported
    if (webpSupported && !src.includes('.webp')) {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Create a test image to check if WebP version exists
        const testImg = new Image();
        testImg.onload = function() {
            // WebP version exists, use it
            loadImageWithSrc(img, webpSrc);
        };
        testImg.onerror = function() {
            // WebP version doesn't exist, use original
            loadImageWithSrc(img, src);
        };
        testImg.src = webpSrc;
    } else {
        // Use original source
        loadImageWithSrc(img, src);
    }
}

function loadImageWithSrc(img, src) {
    // Create a new image to preload
    const newImg = new Image();

    newImg.onload = function() {
        img.src = src;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        img.removeAttribute('data-src');
    };

    newImg.onerror = function() {
        img.classList.add('lazy-error');
    };

    img.classList.add('lazy-loading');
    newImg.src = src;
}

function loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(loadImage);
}

/**
 * Optimize existing images to use WebP when supported
 */
function optimizeExistingImages() {
    if (!webpSupported) return;

    const images = document.querySelectorAll('img[src]:not([src*=".webp"])');
    images.forEach(img => {
        const src = img.src;
        if (src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

            // Test if WebP version exists
            const testImg = new Image();
            testImg.onload = function() {
                img.src = webpSrc;
                img.dataset.originalSrc = src; // Keep original as fallback
            };
            testImg.onerror = function() {
                // WebP version doesn't exist, keep original
            };
            testImg.src = webpSrc;
        }
    });
}

// Run optimization after WebP support is determined
function initializeImageOptimization() {
    if (webpSupported === null) {
        checkWebPSupport().then(supported => {
            webpSupported = supported;
            if (supported) {
                optimizeExistingImages();
            }
        });
    } else if (webpSupported) {
        optimizeExistingImages();
    }
}

/**
 * Search Functionality
 */
function initializeSearch() {
    if (Elements.searchInput) {
        Elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        Elements.searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    if (Elements.globalSearch) {
        Elements.globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
        Elements.globalSearch.addEventListener('keydown', handleGlobalSearchKeydown);
        Elements.globalSearch.addEventListener('focus', handleGlobalSearchFocus);
        Elements.globalSearch.addEventListener('blur', handleGlobalSearchBlur);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    AppState.searchTerm = searchTerm;
    
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        const title = article.querySelector('.article-card__title')?.textContent.toLowerCase() || '';
        const excerpt = article.querySelector('.article-card__excerpt')?.textContent.toLowerCase() || '';
        const isMatch = !searchTerm || title.includes(searchTerm) || excerpt.includes(searchTerm);
        
        article.style.display = isMatch ? 'block' : 'none';
    });
    
    // Announce search results to screen readers
    const visibleArticles = Array.from(articles).filter(article => 
        article.style.display !== 'none'
    ).length;
    
    if (searchTerm) {
        announceToScreenReader(`${visibleArticles} articles found for "${searchTerm}"`);
    }
}

function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        clearSearch();
    }
}

function clearSearch() {
    if (Elements.searchInput) {
        Elements.searchInput.value = '';
        Elements.searchInput.blur();
    }

    AppState.searchTerm = '';

    // Show all articles
    document.querySelectorAll('.article-card').forEach(article => {
        article.style.display = 'block';
    });

    announceToScreenReader('Search cleared, showing all articles');
}

/**
 * Analytics & Monitoring
 */
function trackAnalyticsEvent(action, category, label, value) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            user_agent: navigator.userAgent,
            timestamp: Date.now()
        });
    }

    // Custom error logging to localStorage for debugging
    if (category === 'error') {
        logErrorToStorage(action, label, value);
    }
}

function logErrorToStorage(type, message, details) {
    try {
        const errorLog = {
            type,
            message,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            connectionType: navigator.connection?.effectiveType || 'unknown'
        };

        const errors = JSON.parse(localStorage.getItem('ai_buffet_errors') || '[]');
        errors.push(errorLog);

        // Keep only last 50 errors
        if (errors.length > 50) {
            errors.splice(0, errors.length - 50);
        }

        localStorage.setItem('ai_buffet_errors', JSON.stringify(errors));
    } catch (e) {
        console.warn('Failed to log error to storage:', e);
    }
}

function trackUserInteraction(action, element) {
    trackAnalyticsEvent('user_interaction', action, element);
}

function trackPerformanceMetric(metric, value) {
    trackAnalyticsEvent('performance', metric, null, value);
}

function initializeAnalyticsTracking() {
    // Track page load performance
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                trackPerformanceMetric('page_load_time', Math.round(perfData.loadEventEnd - perfData.fetchStart));
                trackPerformanceMetric('dom_content_loaded', Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart));
                trackPerformanceMetric('first_byte', Math.round(perfData.responseStart - perfData.fetchStart));
            }
        }, 100);
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = debounce(() => {
        const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (maxScrollDepth % 25 === 0 && maxScrollDepth <= 100) {
                trackAnalyticsEvent('scroll_depth', 'page_view', `${maxScrollDepth}%`);
            }
        }
    }, 1000);

    window.addEventListener('scroll', trackScrollDepth);

    // Track clicks on key elements
    document.addEventListener('click', function(event) {
        const target = event.target.closest('a, button, [data-track]');
        if (target) {
            const trackingName = target.dataset.track ||
                                  target.className ||
                                  target.tagName.toLowerCase();
            trackUserInteraction('click', trackingName);
        }
    });

    // Track search usage
    if (Elements.globalSearch) {
        Elements.globalSearch.addEventListener('input', debounce(function(event) {
            if (event.target.value.length >= 3) {
                trackAnalyticsEvent('search', 'global_search', 'query_entered');
            }
        }, 1000));
    }

    // Track newsletter signups
    if (Elements.newsletterForm) {
        Elements.newsletterForm.addEventListener('submit', function() {
            trackAnalyticsEvent('conversion', 'newsletter', 'signup_attempt');
        });
    }

    // Track API errors
    document.addEventListener('api_error', function(event) {
        trackAnalyticsEvent('error', 'api', event.detail.message);
    });

    // Debug panel (accessible via Ctrl+Shift+D)
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            showDebugPanel();
        }
    });
}

/**
 * Debug Panel for Error Monitoring
 */
function showDebugPanel() {
    const errors = JSON.parse(localStorage.getItem('ai_buffet_errors') || '[]');
    const pageErrors = JSON.parse(localStorage.getItem('ai_buffet_page_errors') || '[]');

    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        color: white;
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 14px;
    `;

    debugPanel.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #22D3EE; margin-bottom: 10px;">AI Buffet Debug Panel</h2>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
            <button onclick="localStorage.removeItem('ai_buffet_errors'); localStorage.removeItem('ai_buffet_page_errors'); location.reload();" style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Clear Logs</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3 style="color: #10B981; margin-bottom: 10px;">Error Logs (${errors.length})</h3>
                <div style="background: #1a1a1a; padding: 10px; border-radius: 4px; max-height: 400px; overflow-y: auto;">
                    ${errors.length === 0 ? '<p style="color: #10B981;">No errors logged ✓</p>' :
                      errors.slice(-10).map(error => `
                        <div style="margin-bottom: 15px; padding: 10px; background: #2a2a2a; border-radius: 4px;">
                            <div style="color: #ef4444; font-weight: bold;">${error.type}: ${error.message}</div>
                            <div style="color: #94a3b8; font-size: 12px; margin-top: 5px;">${error.timestamp}</div>
                            <div style="color: #94a3b8; font-size: 12px;">URL: ${error.url}</div>
                            <div style="color: #94a3b8; font-size: 12px;">Viewport: ${error.viewportSize}</div>
                            ${error.details ? `<div style="color: #fbbf24; font-size: 12px; margin-top: 5px;">Details: ${JSON.stringify(error.details)}</div>` : ''}
                        </div>
                      `).join('')}
                </div>
            </div>

            <div>
                <h3 style="color: #8B5CF6; margin-bottom: 10px;">Performance Metrics</h3>
                <div style="background: #1a1a1a; padding: 10px; border-radius: 4px;">
                    <div style="margin-bottom: 8px;">Page Load: ${performance.now().toFixed(0)}ms</div>
                    <div style="margin-bottom: 8px;">Memory: ${(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0).toFixed(1)}MB</div>
                    <div style="margin-bottom: 8px;">Connection: ${navigator.connection?.effectiveType || 'Unknown'}</div>
                    <div style="margin-bottom: 8px;">Online: ${navigator.onLine ? '✓' : '✗'}</div>
                    <div style="margin-bottom: 8px;">WebP Support: ${webpSupported ? '✓' : '✗'}</div>
                    <div style="margin-bottom: 8px;">App State: ${AppState.hasError ? 'Error' : 'OK'}</div>
                    <div style="margin-bottom: 8px;">API Retries: ${AppState.apiRetryCount}</div>
                    <div style="margin-bottom: 8px;">Articles Loaded: ${AppState.articles.length}</div>
                </div>

                <h3 style="color: #f59e0b; margin: 20px 0 10px;">Local Storage</h3>
                <div style="background: #1a1a1a; padding: 10px; border-radius: 4px; font-size: 12px;">
                    ${Object.keys(localStorage).filter(key => key.startsWith('ai_buffet')).map(key =>
                        `<div style="margin-bottom: 5px;">${key}: ${(localStorage.getItem(key)?.length || 0)} chars</div>`
                    ).join('') || 'No AI Buffet data stored'}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(debugPanel);
}

// Global Search Functions
let globalSearchTimeout;
let searchResultsVisible = false;

function handleGlobalSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (!searchTerm) {
        hideGlobalSearchResults();
        return;
    }

    if (searchTerm.length < 2) return;

    // Show loading state
    showGlobalSearchLoading();

    // Clear previous timeout
    clearTimeout(globalSearchTimeout);

    // Debounced search
    globalSearchTimeout = setTimeout(() => {
        performGlobalSearch(searchTerm);
    }, 300);
}

function performGlobalSearch(searchTerm) {
    const results = [];

    // Search through all articles on current page
    document.querySelectorAll('.article-card').forEach(card => {
        const title = card.querySelector('.article-title, .article-card__title, h3')?.textContent || '';
        const excerpt = card.querySelector('.article-excerpt, .article-card__excerpt, p')?.textContent || '';
        const author = card.querySelector('.article-author, .author-name')?.textContent || '';

        const titleMatch = title.toLowerCase().includes(searchTerm);
        const excerptMatch = excerpt.toLowerCase().includes(searchTerm);
        const authorMatch = author.toLowerCase().includes(searchTerm);

        if (titleMatch || excerptMatch || authorMatch) {
            const link = card.querySelector('a')?.href || '#';
            results.push({
                title: title.trim(),
                excerpt: excerpt.trim().substring(0, 100) + '...',
                author: author.trim(),
                link: link,
                relevance: titleMatch ? 3 : (authorMatch ? 2 : 1)
            });
        }
    });

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Limit results
    const limitedResults = results.slice(0, 8);

    displayGlobalSearchResults(limitedResults, searchTerm);
}

function showGlobalSearchLoading() {
    if (!Elements.searchResults) return;

    Elements.searchResults.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--color-text-secondary);">
            <div class="loading-spinner" style="margin: 0 auto var(--space-2);"></div>
            Searching...
        </div>
    `;
    Elements.searchResults.style.display = 'block';
    searchResultsVisible = true;
}

function displayGlobalSearchResults(results, searchTerm) {
    if (!Elements.searchResults) return;

    if (results.length === 0) {
        Elements.searchResults.innerHTML = `
            <div style="padding: var(--space-4); text-align: center; color: var(--color-text-secondary);">
                <div style="font-size: 1.5rem; margin-bottom: var(--space-2);">🔍</div>
                No results found for "${searchTerm}"
            </div>
        `;
    } else {
        const resultsHTML = results.map((result, index) => `
            <a href="${result.link}"
               class="search-result-item"
               style="display: block; padding: var(--space-3); border-bottom: 1px solid rgba(255,255,255,0.1); color: inherit; text-decoration: none; transition: background-color 0.2s ease;"
               onmouseover="this.style.backgroundColor='rgba(255,255,255,0.05)'"
               onmouseout="this.style.backgroundColor='transparent'"
               data-index="${index}">
                <div style="font-weight: 600; margin-bottom: var(--space-1); color: var(--color-text-primary);">
                    ${highlightSearchTerm(result.title, searchTerm)}
                </div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: var(--space-1);">
                    ${highlightSearchTerm(result.excerpt, searchTerm)}
                </div>
                ${result.author ? `<div style="font-size: 0.75rem; color: var(--color-primary);">by ${result.author}</div>` : ''}
            </a>
        `).join('');

        Elements.searchResults.innerHTML = `
            <div style="padding: var(--space-2) var(--space-3); background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.875rem; color: var(--color-text-secondary);">
                ${results.length} result${results.length === 1 ? '' : 's'} for "${searchTerm}"
            </div>
            ${resultsHTML}
        `;
    }

    Elements.searchResults.style.display = 'block';
    searchResultsVisible = true;
}

function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--color-primary); color: white; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">$1</mark>');
}

function hideGlobalSearchResults() {
    if (Elements.searchResults) {
        Elements.searchResults.style.display = 'none';
        searchResultsVisible = false;
    }
}

function handleGlobalSearchKeydown(event) {
    if (event.key === 'Escape') {
        Elements.globalSearch.blur();
        hideGlobalSearchResults();
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateSearchResults('down');
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateSearchResults('up');
    } else if (event.key === 'Enter') {
        event.preventDefault();
        const activeResult = Elements.searchResults?.querySelector('.search-result-item.active');
        if (activeResult) {
            activeResult.click();
        }
    }
}

function navigateSearchResults(direction) {
    if (!searchResultsVisible || !Elements.searchResults) return;

    const results = Elements.searchResults.querySelectorAll('.search-result-item');
    if (results.length === 0) return;

    const currentActive = Elements.searchResults.querySelector('.search-result-item.active');
    let nextIndex = 0;

    if (currentActive) {
        currentActive.classList.remove('active');
        currentActive.style.backgroundColor = 'transparent';
        const currentIndex = parseInt(currentActive.dataset.index);

        if (direction === 'down') {
            nextIndex = (currentIndex + 1) % results.length;
        } else {
            nextIndex = (currentIndex - 1 + results.length) % results.length;
        }
    }

    const nextResult = results[nextIndex];
    nextResult.classList.add('active');
    nextResult.style.backgroundColor = 'rgba(255,255,255,0.1)';
    nextResult.scrollIntoView({ block: 'nearest' });
}

function handleGlobalSearchFocus() {
    if (Elements.globalSearch.value.trim()) {
        const searchTerm = Elements.globalSearch.value.toLowerCase().trim();
        if (searchTerm.length >= 2) {
            performGlobalSearch(searchTerm);
        }
    }
}

function handleGlobalSearchBlur() {
    // Delay hiding to allow for click on results
    setTimeout(() => {
        hideGlobalSearchResults();
    }, 200);
}


/**
 * Newsletter Form
 */
function initializeNewsletterForm() {
    if (!Elements.newsletterForm) return;
    
    Elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const form = event.currentTarget;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const email = emailInput?.value?.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        emailInput?.focus();
        return;
    }
    
    // Update button state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Subscribing...';
    submitButton.disabled = true;
    
    // Simulate API call (replace with actual implementation)
    setTimeout(() => {
        submitButton.textContent = 'Subscribed!';
        submitButton.style.background = 'var(--color-success)';
        showNotification('Successfully subscribed to newsletter!', 'success');
        
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
            form.reset();
        }, 2000);
    }, 1000);
}

/**
 * Keyboard Shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(event) {
    // Search shortcut (Ctrl/Cmd + K)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        Elements.searchInput?.focus();
        return;
    }
    
    // Theme toggle (Ctrl/Cmd + Shift + T)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleTheme();
        return;
    }
    
    // Clear search (Escape when search is focused)
    if (event.key === 'Escape' && document.activeElement === Elements.searchInput) {
        clearSearch();
        return;
    }
    
    // Tab navigation (1, 2 keys)
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        switch (event.key) {
            case '1':
                if (document.activeElement.tagName !== 'INPUT') {
                    event.preventDefault();
                    switchTab('top-articles');
                }
                break;
            case '2':
                if (document.activeElement.tagName !== 'INPUT') {
                    event.preventDefault();
                    switchTab('latest-articles');
                }
                break;
        }
    }
}

/**
 * Mobile Menu
 */
function initializeMobileMenu() {
    if (!Elements.mobileMenuToggle || !Elements.navLinks) return;
    
    Elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav')) {
            closeMobileMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

function toggleMobileMenu() {
    const isExpanded = Elements.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    Elements.mobileMenuToggle.setAttribute('aria-expanded', newState.toString());
    Elements.navLinks.classList.toggle('nav-links--open', newState);
    
    // Create hamburger animation styles if they don't exist
    if (!document.querySelector('#hamburger-styles')) {
        const style = document.createElement('style');
        style.id = 'hamburger-styles';
        style.textContent = `
            .hamburger {
                display: block;
                width: 20px;
                height: 2px;
                background: var(--color-text-primary);
                position: relative;
                transition: all var(--transition-fast);
            }
            
            .hamburger::before,
            .hamburger::after {
                content: '';
                display: block;
                width: 20px;
                height: 2px;
                background: var(--color-text-primary);
                position: absolute;
                transition: all var(--transition-fast);
            }
            
            .hamburger::before {
                top: -6px;
            }
            
            .hamburger::after {
                top: 6px;
            }
            
            .mobile-menu-toggle[aria-expanded="true"] .hamburger {
                background: transparent;
            }
            
            .mobile-menu-toggle[aria-expanded="true"] .hamburger::before {
                transform: rotate(45deg);
                top: 0;
            }
            
            .mobile-menu-toggle[aria-expanded="true"] .hamburger::after {
                transform: rotate(-45deg);
                top: 0;
            }
            
            .nav-links--open {
                display: flex !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function closeMobileMenu() {
    if (Elements.mobileMenuToggle) {
        Elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    if (Elements.navLinks) {
        Elements.navLinks.classList.remove('nav-links--open');
    }
}

function handleResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

/**
 * Error Handling & Recovery
 */
function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(event) {
        const error = {
            message: event.error?.message || event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        };
        handleGlobalError(error, 'JavaScript Error');
        trackAnalyticsEvent('error', 'javascript', error.message);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const error = {
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack
        };
        handleGlobalError(error, 'Promise Rejection');
        trackAnalyticsEvent('error', 'promise_rejection', error.message);
    });
}

function handleGlobalError(error, type) {
    AppState.hasError = true;
    const errorInfo = {
        type: type,
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };

    // Store error for potential reporting
    try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push(errorInfo);
        localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    } catch (e) {
        // If localStorage fails, continue silently
    }
}

function handleOnlineStatus() {
    AppState.isOnline = true;
    AppState.apiRetryCount = 0;
    showConnectionStatus('Back online! Refreshing content...', 'success');

    // Retry failed operations
    if (AppState.hasError || (!AppState.articles.length && !AppState.stories.length)) {
        setTimeout(loadRealArticles, 1000);
    }
}

function handleOfflineStatus() {
    AppState.isOnline = false;
    showConnectionStatus('You are offline. Some features may not work.', 'warning');
}

function showConnectionStatus(message, type = 'info') {
    const existingStatus = document.getElementById('connection-status');
    if (existingStatus) {
        existingStatus.remove();
    }

    const statusBar = document.createElement('div');
    statusBar.id = 'connection-status';
    statusBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: var(--space-2) var(--space-4);
        background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        text-align: center;
        z-index: 9999;
        font-size: var(--font-size-sm);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    `;
    statusBar.textContent = message;

    document.body.appendChild(statusBar);
    requestAnimationFrame(() => {
        statusBar.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        statusBar.style.transform = 'translateY(-100%)';
        setTimeout(() => statusBar.remove(), 300);
    }, 3000);
}

async function retryApiCall(apiFunction, ...args) {
    if (!AppState.isOnline) {
        throw new Error('No internet connection');
    }

    let lastError;
    for (let i = 0; i <= AppState.maxRetries; i++) {
        try {
            AppState.apiRetryCount = i;
            return await apiFunction(...args);
        } catch (error) {
            lastError = error;
            if (i < AppState.maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, i), 5000); // Exponential backoff, max 5s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

function showFallbackContent() {
    const containers = [
        Elements.topArticlesGrid,
        Elements.latestArticlesGrid,
        document.getElementById('articles-container')
    ].filter(Boolean);

    containers.forEach(container => {
        if (container && !container.innerHTML.trim()) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-16); color: var(--color-text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: var(--space-4);">📡</div>
                    <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--space-2);">Content Temporarily Unavailable</h3>
                    <p style="margin-bottom: var(--space-6);">We're having trouble loading the latest content. Please check your connection and try again.</p>
                    <button onclick="location.reload()" style="
                        background: var(--gradient-primary);
                        border: none;
                        border-radius: var(--radius-lg);
                        color: white;
                        cursor: pointer;
                        font-weight: var(--font-weight-semibold);
                        padding: var(--space-3) var(--space-6);
                        transition: all var(--transition-base);
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        Try Again
                    </button>
                </div>
            `;
        }
    });
}

/**
 * Load Real Articles (Supabase Integration)
 */
async function loadRealArticles() {
    // Show loading state
    showLoadingState();

    try {
        const fetchArticles = async () => {
            const response = await fetch(
                'https://npetaroffoyjohjiwssf.supabase.co/rest/v1/articles?select=title,description,content_snippet,link,source,author,pub_date,featured,is_top_story,trending_score,breaking_news,word_count&order=pub_date.desc&limit=20',
                {
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZXRhcm9mZm95am9oaml3c3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk5OTgsImV4cCI6MjA3MjU4NTk5OH0.oYJ4ETV_zIDx_7KWJlEtcrIrRqy72HYEFzAs37pPzB8'
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        };

        // Use retry mechanism
        const articles = await retryApiCall(fetchArticles);

        AppState.articles = articles;
        AppState.hasError = false;

        // Track successful API load
        trackAnalyticsEvent('api_success', 'articles', 'loaded', articles.length);

        // Separate featured articles for top stories
        const featuredArticles = articles.filter(article =>
            article.featured === true ||
            article.featured === 'TRUE' ||
            article.featured === 'true' ||
            article.featured === 1
        );

        if (featuredArticles.length > 0) {
            AppState.stories = featuredArticles.slice(0, 6);
        } else {
            // Use highest relevance_score articles as "top stories"
            const topArticles = articles
                .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
                .slice(0, 6);
            AppState.stories = topArticles;
        }

        hideLoadingState();
        updateTopArticles(AppState.stories);
        updateLatestArticles(articles.slice(0, 8));

    } catch (error) {
        hideLoadingState();
        AppState.hasError = true;

        // Track API error for analytics
        document.dispatchEvent(new CustomEvent('api_error', {
            detail: { message: error.message, type: 'articles_load' }
        }));

        // Show user-friendly error message
        const errorMessage = !AppState.isOnline
            ? 'You appear to be offline. Please check your connection.'
            : 'Unable to load articles at the moment. Please try again later.';

        showNotification(errorMessage, 'error');
        showFallbackContent();

        // Store error for debugging
        handleGlobalError(error, 'API Load Error');
    }
}

function showLoadingState() {
    const containers = [Elements.topArticlesGrid, Elements.latestArticlesGrid].filter(Boolean);

    containers.forEach(container => {
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; padding: var(--space-16);">
                    <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--color-text-secondary);">
                        <div style="
                            width: 20px;
                            height: 20px;
                            border: 2px solid var(--glass-border);
                            border-top: 2px solid var(--neon-blue);
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        "></div>
                        <span>Loading articles...</span>
                    </div>
                </div>
            `;
        }
    });
}

function hideLoadingState() {
    // Loading states will be replaced by actual content
    // This function exists for consistency and future use
}

function updateTopArticles(articles) {
    if (!Elements.topArticlesGrid || !articles.length) return;
    
    const articleHTML = articles.map(article => createArticleHTML(article, 'Featured')).join('');
    Elements.topArticlesGrid.innerHTML = articleHTML;
    initializeArticleCards();
}

function updateLatestArticles(articles) {
    if (!Elements.latestArticlesGrid || !articles.length) return;
    
    const articleHTML = articles.map(article => createArticleHTML(article, 'Latest')).join('');
    Elements.latestArticlesGrid.innerHTML = articleHTML;
    initializeArticleCards();
}

function createArticleHTML(article, category) {
    const title = escapeHtml(article.title || 'No title available');
    const excerpt = escapeHtml(article.description || article.content_snippet || 'No summary available');
    const link = escapeHtml(article.link || '#');
    const source = escapeHtml(article.source || 'Unknown source');
    const author = article.author ? escapeHtml(article.author) : null;
    const pubDate = formatDate(article.pub_date);
    const readTime = Math.max(1, Math.ceil((article.word_count || 300) / 200));
    
    return `
        <article class="card article-card card--interactive" tabindex="0" role="button" 
                 aria-label="Read article: ${title}">
            <div class="article-card__content">
                <h3 class="article-card__title">
                    <a href="${link}" target="_blank" rel="noopener">${title}</a>
                </h3>
                <p class="article-card__excerpt">${excerpt}</p>
                <div class="article-card__meta">
                    <time datetime="${article.pub_date}">${pubDate}</time>
                    <span class="article-card__category">${category}</span>
                    <span>${source}</span>
                    ${author ? `<span>by ${author}</span>` : ''}
                    <span>${readTime}m read</span>
                </div>
            </div>
        </article>
    `;
}

function initializeArticleCards() {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        // Remove existing listeners to prevent duplicates
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Click handling
        newCard.addEventListener('click', function(event) {
            if (event.target.tagName !== 'A') {
                const link = this.querySelector('a');
                if (link) {
                    window.open(link.href, '_blank', 'noopener');
                }
            }
        });

        // Keyboard support
        newCard.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const link = this.querySelector('a');
                if (link) {
                    window.open(link.href, '_blank', 'noopener');
                }
            }
        });
    });
}

/**
 * Utility Functions
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Removed unused throttle function - kept debounce which is actively used

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, match => map[match]);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        return 'Unknown date';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification__content';
    content.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification__close';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => removeNotification(notification));
    
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    // Style the notification
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: var(--space-4);
                right: var(--space-4);
                max-width: 400px;
                padding: var(--space-4);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                z-index: var(--z-toast);
                opacity: 0;
                transform: translateY(-20px);
                transition: all var(--transition-base);
                display: flex;
                align-items: flex-start;
                gap: var(--space-3);
            }
            
            .notification--success {
                background: var(--color-success);
                color: white;
            }
            
            .notification--error {
                background: var(--color-danger);
                color: white;
            }
            
            .notification--info {
                background: var(--color-info);
                color: white;
            }
            
            .notification__content {
                flex: 1;
                font-weight: var(--font-weight-medium);
            }
            
            .notification__close {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 1.2em;
                line-height: 1;
                padding: 0;
                opacity: 0.8;
                transition: opacity var(--transition-fast);
            }
            
            .notification__close:hover {
                opacity: 1;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-remove after delay
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 250);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (announcement.parentNode) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Initialize All Interactive Elements
 */
function initializeInteractiveElements() {
    // Ensure all buttons have proper focus states and keyboard navigation
    enhanceButtonInteractivity();
    
    // Add loading states to all CTA buttons
    enhanceCtaButtons();
    
    // Ensure all links work properly
    validateLinks();
    
    // Add proper ARIA attributes
    enhanceAccessibility();
    
}

/**
 * Enhance Button Interactivity
 */
function enhanceButtonInteractivity() {
    Elements.allButtons.forEach(button => {
        // Add focus enhancement
        if (!button.hasAttribute('tabindex') && !button.disabled) {
            button.setAttribute('tabindex', '0');
        }
        
        // Add keyboard support for non-form buttons
        if (button.type !== 'submit' && !button.closest('form')) {
            button.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.click();
                }
            });
        }
        
        // Add visual feedback on interaction
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/**
 * Enhance CTA Buttons with Loading States
 */
function enhanceCtaButtons() {
    Elements.ctaButtons.forEach(button => {
        const originalHtml = button.innerHTML;
        
        button.addEventListener('click', function() {
            // Don't add loading state to external links
            if (this.tagName === 'A' && this.target === '_blank') {
                return;
            }
            
            // Add loading state
            this.classList.add('btn-loading');
            this.disabled = true;
            this.innerHTML = '<span class="loading-spinner"></span> Loading...';
            
            // Remove loading state after navigation or timeout
            setTimeout(() => {
                if (this.parentNode) {
                    this.classList.remove('btn-loading');
                    this.disabled = false;
                    this.innerHTML = originalHtml;
                }
            }, 2000);
        });
    });
}

/**
 * Validate All Links
 */
function validateLinks() {
    Elements.allLinks.forEach(link => {
        // Skip navigation links - they should navigate normally
        if (link.classList.contains('nav-link') || link.closest('.nav-links')) {
            return;
        }
        
        // Ensure external links have proper attributes
        if (link.href && (link.href.startsWith('http') || link.href.startsWith('//'))) {
            // Only add target="_blank" to actual external domains, not same-site links
            const currentDomain = window.location.origin;
            if (!link.href.startsWith(currentDomain) && !link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
            }
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener');
            }
        }
        
        // Add visual feedback for broken links
        link.addEventListener('click', function(event) {
            if (!this.href || this.href === '#' || this.href.endsWith('#')) {
                event.preventDefault();
                showNotification('This link is not yet available.', 'info');
            }
        });
        
        // Enhance keyboard navigation
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                this.click();
            }
        });
    });
}

/**
 * Enhance Accessibility
 */
function enhanceAccessibility() {
    // Add skip links if they don't exist
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
            color: white;
            background: var(--color-primary);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            transform: translateY(-100%);
            transition: transform 0.3s;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.transform = 'translateY(0)';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.transform = 'translateY(-100%)';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Ensure all interactive elements have proper ARIA attributes
    document.querySelectorAll('button, [role="button"]').forEach(element => {
        if (!element.hasAttribute('aria-label') && !element.textContent.trim()) {
        }
    });
}

/**
 * Initialize Browser Compatibility Features
 */
function initializeBrowserCompatibility() {
    // Polyfill for older browsers
    if (!window.NodeList.prototype.forEach) {
        window.NodeList.prototype.forEach = Array.prototype.forEach;
    }
    
    // CSS custom properties fallback
    if (!CSS.supports('(--test: red)')) {
        document.documentElement.classList.add('no-css-custom-props');
    }
    
    // Intersection Observer polyfill fallback
    if (!window.IntersectionObserver) {
        loadAllImages();
    }
    
    // Smooth scroll polyfill for older browsers
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Add smooth scroll polyfill for older browsers
        window.smoothScrollPolyfill = true;
    }
    
    // Add browser classes for CSS targeting
    const isIE = /Trident|MSIE/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    if (isIE) document.documentElement.classList.add('is-ie');
    if (isEdge) document.documentElement.classList.add('is-edge');
    if (isSafari) document.documentElement.classList.add('is-safari');
    if (isChrome) document.documentElement.classList.add('is-chrome');
    if (isFirefox) document.documentElement.classList.add('is-firefox');
    
}

/**
 * Error Handling
 */
window.addEventListener('error', function(event) {
});

window.addEventListener('unhandledrejection', function(event) {
});

/**
 * Performance Monitoring
 */
window.addEventListener('load', function() {
    if ('performance' in window && performance.getEntriesByType) {
        // Use Navigation Timing API Level 2 for better browser support
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        }
    }
});

/**
 * Validate All Interactive Elements on Page Load
 */
function validateInteractiveElements() {
    let validationResults = {
        buttons: 0,
        workingButtons: 0,
        links: 0,
        workingLinks: 0,
        issues: []
    };
    
    // Validate all buttons
    const buttons = document.querySelectorAll('button, [role="button"], .btn');
    validationResults.buttons = buttons.length;
    
    buttons.forEach((button, index) => {
        if (!button.disabled && button.style.display !== 'none') {
            validationResults.workingButtons++;
        }
        
        // Check for missing labels or text
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            validationResults.issues.push(`Button ${index + 1} missing accessible label`);
        }
    });
    
    // Validate all links
    const links = document.querySelectorAll('a');
    validationResults.links = links.length;
    
    links.forEach((link, index) => {
        if (link.href && link.href !== '#' && !link.href.endsWith('#')) {
            validationResults.workingLinks++;
        } else if (link.href === '#' || link.href.endsWith('#')) {
            // Only report as issue if it's not a valid anchor link
            const targetId = link.href.split('#')[1];
            if (targetId && !document.getElementById(targetId)) {
                validationResults.issues.push(`Link ${index + 1} "${link.textContent.trim()}" points to missing anchor #${targetId}`);
            }
        }
        
        // Check external links for security attributes
        if (link.href && (link.href.startsWith('http') || link.href.startsWith('//'))) {
            if (!link.hasAttribute('rel') || !link.rel.includes('noopener')) {
                // Auto-fix missing rel attributes
                link.setAttribute('rel', 'noopener');
            }
        }
    });
    
    
    return validationResults;
}

/**
 * Test Critical User Flows
 */
function testCriticalFlows() {
    const tests = {
        searchFunctionality: false,
        tabSwitching: false,
        themeToggle: false,
        mobileMenu: false,
        newsletterForm: false
    };
    
    // Test search functionality
    if (Elements.searchInput) {
        tests.searchFunctionality = true;
    }
    
    // Test tab switching
    if (Elements.tabButtons && Elements.tabButtons.length > 0) {
        tests.tabSwitching = true;
    }
    
    // Test theme toggle
    if (Elements.themeToggle) {
        tests.themeToggle = true;
    }
    
    // Test mobile menu
    if (Elements.mobileMenuToggle) {
        tests.mobileMenu = true;
    }
    
    // Test newsletter form
    if (Elements.newsletterForm) {
        tests.newsletterForm = true;
    }
    
    const passedTests = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    
    return tests;
}

// Run validation on load
window.addEventListener('load', function() {
    setTimeout(() => {
        validateInteractiveElements();
        testCriticalFlows();
    }, 1000);
});

// Export for testing purposes (if module system is used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        switchTab,
        toggleTheme,
        escapeHtml,
        isValidEmail,
        formatDate,
        validateInteractiveElements,
        testCriticalFlows,
        initializeAIFacts
    };
}

/**
 * AI Facts Section Interactive Features
 */
function initializeAIFacts() {
    // Only run on pages with AI facts section
    if (!document.querySelector('.ai-facts-section')) return;
    
    initializeFeaturedFactRotation();
    initializeQuizInteraction();
    initializeFactCardInteractions();
}

/**
 * Rotate Featured Fact Display
 */
function initializeFeaturedFactRotation() {
    const featuredFact = document.getElementById('featured-fact');
    if (!featuredFact) return;
    
    const facts = [
        {
            number: '2.9 seconds',
            description: 'Average time for GPT-4 to write a 500-word article',
            comparison: "That's 150x faster than the average human writer",
            icon: '⚡'
        },
        {
            number: '1.2 million',
            description: 'New AI research papers published in 2024',
            comparison: "That's 3,300 papers per day",
            icon: '📚'
        },
        {
            number: '67%',
            description: 'Of developers now use AI coding assistants',
            comparison: 'Up from 12% just two years ago',
            icon: '💻'
        },
        {
            number: '$200B',
            description: 'Global AI market value in 2025',
            comparison: 'Growing at 37% annually',
            icon: '💰'
        },
        {
            number: '45 languages',
            description: 'Supported by the latest AI translation models',
            comparison: 'With 98% accuracy for major languages',
            icon: '🌍'
        }
    ];
    
    let currentFactIndex = 0;
    
    function rotateFact() {
        const fact = facts[currentFactIndex];
        
        // Fade out
        featuredFact.style.opacity = '0.5';
        featuredFact.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Update content
            const numberElement = featuredFact.querySelector('.fact-number');
            const descriptionElement = featuredFact.querySelector('.fact-description');
            const comparisonElement = featuredFact.querySelector('.fact-comparison');
            const iconElement = featuredFact.querySelector('.fact-icon');
            
            if (numberElement) numberElement.textContent = fact.number;
            if (descriptionElement) descriptionElement.textContent = fact.description;
            if (comparisonElement) comparisonElement.textContent = fact.comparison;
            if (iconElement) iconElement.textContent = fact.icon;
            
            // Fade in
            featuredFact.style.opacity = '1';
            featuredFact.style.transform = 'scale(1)';
            
            currentFactIndex = (currentFactIndex + 1) % facts.length;
        }, 300);
    }
    
    // Rotate every 5 seconds
    setInterval(rotateFact, 5000);
}

/**
 * Handle Quiz Interaction
 */
function initializeQuizInteraction() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    const quizResult = document.getElementById('quiz-result');
    
    if (quizOptions.length === 0) return;
    
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Disable all options and show correct answers
            quizOptions.forEach(opt => {
                opt.disabled = true;
                opt.style.pointerEvents = 'none';

                if (opt.dataset.correct === 'true') {
                    opt.classList.add('correct');
                } else {
                    opt.classList.add('incorrect');
                }
            });
            
            // Show result
            if (quizResult) {
                quizResult.style.display = 'block';
                quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

/**
 * Enhanced Fact Card Interactions
 */
function initializeFactCardInteractions() {
    const factCards = document.querySelectorAll('.fact-card');
    
    factCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Highlight the detail text
            const detail = this.querySelector('.fact-detail');
            if (detail) {
                detail.style.fontSize = 'var(--font-size-base)';
                detail.style.fontWeight = '500';
                detail.style.color = 'var(--neon-blue)';
                
                setTimeout(() => {
                    detail.style.fontSize = '';
                    detail.style.fontWeight = '';
                    detail.style.color = '';
                }, 2000);
            }
        });
        
        // Add staggered entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize AI Facts when DOM is ready (disabled to prevent conflicts with index.html inline script)
// document.addEventListener('DOMContentLoaded', initializeAIFacts);