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
    lastScrollTop: 0
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
    initializeSearch();
    initializeNewsletterForm();
    initializeKeyboardShortcuts();
    initializeMobileMenu();
    initializeInteractiveElements();
    initializeBrowserCompatibility();
    loadRealArticles();
    
    // Log successful initialization
    console.log('AI Buffet initialized successfully');
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
    
    // Validate critical elements
    if (!Elements.header) console.warn('Header element not found');
    if (!Elements.searchInput) console.warn('Search input not found');
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
    if (!Elements.tabButtons.length) return;
    
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
 * Lazy Loading for Images
 */
function initializeLazyLoading() {
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
    const src = img.getAttribute('data-src');
    if (!src) return;
    
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
        console.warn('Failed to load image:', src);
    };
    
    img.classList.add('lazy-loading');
    newImg.src = src;
}

function loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(loadImage);
}

/**
 * Search Functionality
 */
function initializeSearch() {
    if (!Elements.searchInput) return;
    
    Elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    Elements.searchInput.addEventListener('keydown', handleSearchKeydown);
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
 * Load Real Articles (Supabase Integration)
 */
async function loadRealArticles() {
    try {
        const response = await fetch(
            'https://npetaroffoyjohjiwssf.supabase.co/rest/v1/articles?select=title,description,content_snippet,link,source,author,pub_date,featured,is_top_story,trending_score,breaking_news,word_count&order=pub_date.desc&limit=20',
            {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZXRhcm9mZm95am9oaml3c3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk5OTgsImV4cCI6MjA3MjU4NTk5OH0.oYJ4ETV_zIDx_7KWJlEtcrIrRqy72HYEFzAs37pPzB8'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const articles = await response.json();
        console.log('Articles loaded:', articles.length);
        
        AppState.articles = articles;
        
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
        
        updateTopArticles(AppState.stories);
        updateLatestArticles(articles.slice(0, 8));
        
    } catch (error) {
        console.error('Error loading articles:', error);
        showNotification('Unable to load articles. Please refresh the page.', 'error');
    }
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

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

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
        console.warn('Invalid date format:', dateString);
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
    
    console.log('Interactive elements initialized');
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
        
        button.addEventListener('click', function(event) {
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
            console.warn('Interactive element missing accessible label:', element);
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
        console.warn('IntersectionObserver not supported, using fallback');
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
    
    console.log('Browser compatibility features initialized');
}

/**
 * Error Handling
 */
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Performance Monitoring
 */
window.addEventListener('load', function() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Site loaded in ${loadTime}ms`);
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
                console.log(`✓ Fixed missing rel="noopener" on link: ${link.textContent.trim()}`);
            }
        }
    });
    
    // Log validation results
    console.log('🔍 Interactive Elements Validation:', validationResults);
    
    if (validationResults.issues.length === 0) {
        console.log('✅ All interactive elements validated successfully!');
    } else {
        console.warn('⚠️ Found', validationResults.issues.length, 'issues with interactive elements');
        validationResults.issues.forEach(issue => console.warn('  -', issue));
    }
    
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
    
    console.log(`🧪 Critical Flow Tests: ${passedTests}/${totalTests} passed`);
    console.log('Test Results:', tests);
    
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
            const isCorrect = this.dataset.correct === 'true';
            
            // Disable all options
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