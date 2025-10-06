/**
 * Dynamic Articles Loader
 * Loads articles from articles.json and displays them on the page
 */

(function() {
    'use strict';

    // Cache for articles data
    let articlesCache = null;

    /**
     * Fetch articles from articles.json
     */
    async function fetchArticles() {
        if (articlesCache) {
            return articlesCache;
        }

        try {
            const response = await fetch('/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            articlesCache = data;
            return data;
        } catch (error) {
            console.error('Error fetching articles:', error);
            return { articles: [] };
        }
    }

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Create article card HTML
     */
    function createArticleCard(article, isGrid = true) {
        const cardClass = isGrid ? 'article-card' : 'article-list-item';

        return `
            <article class="${cardClass}" data-category="${article.category}" data-date="${article.pubDate}">
                <a href="${article.url}" class="article-card__link">
                    ${article.featured ? '<span class="article-card__badge">Featured</span>' : ''}

                    <div class="article-card__image-wrapper">
                        <img
                            src="${article.image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&auto=format'}"
                            alt="${article.title}"
                            class="article-card__image"
                            loading="lazy"
                            onerror="this.src='https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&auto=format'"
                        />
                        <div class="article-card__category">${article.category}</div>
                    </div>

                    <div class="article-card__content">
                        <h3 class="article-card__title">${article.title}</h3>
                        <p class="article-card__description">${article.description}</p>

                        <div class="article-card__meta">
                            <span class="article-card__author">
                                <span aria-hidden="true">👤</span> ${article.author}
                            </span>
                            <span class="article-card__date">
                                <span aria-hidden="true">📅</span> ${formatDate(article.pubDate)}
                            </span>
                            <span class="article-card__reading-time">
                                <span aria-hidden="true">📖</span> ${article.readingTime} min read
                            </span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }

    /**
     * Render articles to a container
     */
    function renderArticles(articles, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return;
        }

        const {
            limit = null,
            featured = null,
            category = null,
            isGrid = true
        } = options;

        // Filter articles
        let filtered = [...articles];

        if (featured !== null) {
            filtered = filtered.filter(a => a.featured === featured);
        }

        if (category) {
            filtered = filtered.filter(a => a.category === category);
        }

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        // Render articles
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No articles found.</p>';
            return;
        }

        container.innerHTML = filtered.map(article => createArticleCard(article, isGrid)).join('');
    }

    /**
     * Initialize articles on page load
     */
    async function initArticles() {
        const data = await fetchArticles();
        const articles = data.articles || [];

        // Featured articles section
        if (document.getElementById('featured-articles')) {
            renderArticles(articles, 'featured-articles', {
                featured: true,
                limit: 3
            });
        }

        // Latest articles section
        if (document.getElementById('latest-articles')) {
            renderArticles(articles, 'latest-articles', {
                limit: 6
            });
        }

        // All articles section (for all-articles.html page)
        if (document.getElementById('all-articles')) {
            renderArticles(articles, 'all-articles', {
                limit: null
            });
        }

        // Tools articles section
        if (document.getElementById('tools-articles')) {
            renderArticles(articles, 'tools-articles', {
                category: 'AI Tools',
                limit: null
            });
        }

        // Initialize category filters if present
        initCategoryFilters(articles);

        // Initialize search if present
        initSearch(articles);
    }

    /**
     * Initialize category filters
     */
    function initCategoryFilters(articles) {
        const filterButtons = document.querySelectorAll('[data-category-filter]');
        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category-filter');

                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter articles
                const container = document.getElementById('latest-articles') ||
                                 document.getElementById('all-articles');

                if (category === 'all') {
                    renderArticles(articles, container.id);
                } else {
                    renderArticles(articles, container.id, { category });
                }
            });
        });
    }

    /**
     * Initialize search functionality
     */
    function initSearch(articles) {
        const searchInput = document.getElementById('article-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (!query) {
                // Show all articles if search is empty
                const container = document.getElementById('all-articles') ||
                                 document.getElementById('latest-articles');
                renderArticles(articles, container.id);
                return;
            }

            // Filter articles by search query
            const filtered = articles.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.keywords.some(k => k.toLowerCase().includes(query))
            );

            const container = document.getElementById('all-articles') ||
                             document.getElementById('latest-articles');

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: var(--space-16); color: var(--color-text-secondary);">
                        <p style="font-size: var(--font-size-xl); margin-bottom: var(--space-4);">No articles found</p>
                        <p>Try searching with different keywords</p>
                    </div>
                `;
            } else {
                renderArticles(filtered, container.id);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initArticles);
    } else {
        initArticles();
    }

    // Export for use in other scripts
    window.ArticlesLoader = {
        fetchArticles,
        renderArticles,
        createArticleCard
    };
})();
