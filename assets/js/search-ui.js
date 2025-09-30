/**
 * AI Buffet Search UI Component
 * Unified search interface with advanced features
 * Phase 1.3: User Interface Implementation
 */

class SearchUI {
    constructor(containerId, searchInstance) {
        this.container = document.getElementById(containerId);
        this.search = searchInstance;
        this.currentQuery = '';
        this.currentResults = [];
        this.isSearching = false;
        this.searchTimeout = null;
        this.filters = {
            dateRange: null,
            category: 'all',
            source: 'all',
            sortBy: 'relevance'
        };

        this.init();
    }

    /**
     * Initialize the search interface
     */
    init() {
        if (!this.container) {
            console.error('Search container not found');
            return;
        }

        this.render();
        this.attachEventListeners();
    }

    /**
     * Render the complete search interface
     */
    render() {
        this.container.innerHTML = `
            <div class="ai-search-container">
                <!-- Search Header -->
                <div class="search-header">
                    <div class="search-input-container">
                        <div class="search-input-wrapper">
                            <span class="search-icon">🔍</span>
                            <input
                                type="text"
                                id="ai-search-input"
                                class="search-input"
                                placeholder="Search AI tools, news, tutorials..."
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <div class="search-suggestions" id="search-suggestions"></div>
                        </div>
                        <button class="search-btn" id="search-btn">Search</button>
                    </div>
                </div>

                <!-- Advanced Filters -->
                <div class="search-filters" id="search-filters">
                    <div class="filter-group">
                        <label class="filter-label">Category:</label>
                        <select class="filter-select" id="category-filter">
                            <option value="all">All Categories</option>
                            <option value="tools">AI Tools</option>
                            <option value="news">News</option>
                            <option value="tutorial">Tutorials</option>
                            <option value="research">Research</option>
                            <option value="business">Business</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Date:</label>
                        <select class="filter-select" id="date-filter">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">Last 3 Months</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Sort by:</label>
                        <select class="filter-select" id="sort-filter">
                            <option value="relevance">Relevance</option>
                            <option value="date">Newest First</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <button class="filter-toggle" id="toggle-filters">
                            <span>More Filters</span>
                            <span class="toggle-icon">▼</span>
                        </button>
                    </div>
                </div>

                <!-- Search Stats -->
                <div class="search-stats" id="search-stats" style="display: none;">
                    <div class="stats-content">
                        <span class="result-count">0 results</span>
                        <span class="search-time">in 0ms</span>
                        <span class="search-sources"></span>
                    </div>
                </div>

                <!-- Search Results -->
                <div class="search-results-container">
                    <div class="search-loading" id="search-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <span>Searching AI knowledge base...</span>
                    </div>

                    <div class="search-results" id="search-results"></div>

                    <div class="search-empty" id="search-empty" style="display: none;">
                        <div class="empty-icon">🤖</div>
                        <h3>No results found</h3>
                        <p>Try adjusting your search terms or filters</p>
                        <div class="search-suggestions-empty">
                            <p>Popular searches:</p>
                            <div class="suggestion-tags">
                                <span class="suggestion-tag" data-query="ChatGPT">ChatGPT</span>
                                <span class="suggestion-tag" data-query="AI tools">AI Tools</span>
                                <span class="suggestion-tag" data-query="Midjourney">Midjourney</span>
                                <span class="suggestion-tag" data-query="Claude">Claude</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Load More -->
                <div class="load-more-container" id="load-more-container" style="display: none;">
                    <button class="load-more-btn" id="load-more-btn">Load More Results</button>
                </div>
            </div>
        `;

        this.addSearchStyles();
    }

    /**
     * Add CSS styles for the search interface
     */
    addSearchStyles() {
        const styleId = 'ai-search-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            .ai-search-container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 1rem;
                font-family: 'Inter', sans-serif;
            }

            .search-header {
                margin-bottom: 1.5rem;
            }

            .search-input-container {
                display: flex;
                gap: 0.75rem;
                align-items: center;
            }

            .search-input-wrapper {
                flex: 1;
                position: relative;
            }

            .search-input {
                width: 100%;
                padding: 0.875rem 1rem 0.875rem 3rem;
                border: 2px solid rgba(34, 211, 238, 0.3);
                border-radius: 12px;
                background: rgba(15, 20, 25, 0.8);
                color: #F8FAFC;
                font-size: 1rem;
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .search-input:focus {
                outline: none;
                border-color: #22D3EE;
                box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
            }

            .search-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.125rem;
                color: #22D3EE;
                z-index: 2;
            }

            .search-btn {
                padding: 0.875rem 1.5rem;
                background: linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .search-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(34, 211, 238, 0.4);
            }

            .search-filters {
                display: flex;
                gap: 1rem;
                align-items: center;
                flex-wrap: wrap;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                margin-bottom: 1rem;
            }

            .filter-group {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .filter-label {
                font-size: 0.875rem;
                color: #CBD5E1;
                font-weight: 500;
                white-space: nowrap;
            }

            .filter-select {
                padding: 0.5rem 0.75rem;
                background: rgba(15, 20, 25, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #F8FAFC;
                font-size: 0.875rem;
                min-width: 120px;
            }

            .filter-toggle {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #CBD5E1;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            }

            .search-stats {
                padding: 0.75rem 1rem;
                background: rgba(139, 92, 246, 0.1);
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .stats-content {
                display: flex;
                gap: 1rem;
                align-items: center;
                font-size: 0.875rem;
                color: #CBD5E1;
            }

            .result-count {
                font-weight: 600;
                color: #22D3EE;
            }

            .search-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                padding: 3rem;
                color: #CBD5E1;
            }

            .loading-spinner {
                width: 24px;
                height: 24px;
                border: 2px solid rgba(34, 211, 238, 0.3);
                border-top: 2px solid #22D3EE;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .search-results {
                display: grid;
                gap: 1.5rem;
            }

            .result-item {
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .result-item:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(34, 211, 238, 0.3);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            }

            .result-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }

            .result-type {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }

            .result-type.original {
                background: linear-gradient(135deg, #10B981, #059669);
                color: white;
            }

            .result-type.rss {
                background: linear-gradient(135deg, #8B5CF6, #7C3AED);
                color: white;
            }

            .result-meta {
                display: flex;
                gap: 0.75rem;
                font-size: 0.75rem;
                color: #94A3B8;
            }

            .result-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #F8FAFC;
                margin-bottom: 0.5rem;
                line-height: 1.4;
            }

            .result-description {
                color: #CBD5E1;
                line-height: 1.6;
                margin-bottom: 0.75rem;
            }

            .result-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.875rem;
                color: #94A3B8;
            }

            .result-source {
                font-weight: 500;
            }

            .result-date {
                font-weight: 400;
            }

            .search-empty {
                text-align: center;
                padding: 3rem;
                color: #CBD5E1;
            }

            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .suggestion-tags {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 1rem;
            }

            .suggestion-tag {
                padding: 0.5rem 1rem;
                background: rgba(79, 70, 229, 0.2);
                border: 1px solid rgba(79, 70, 229, 0.3);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }

            .suggestion-tag:hover {
                background: rgba(79, 70, 229, 0.3);
                color: #22D3EE;
            }

            .load-more-container {
                text-align: center;
                margin-top: 2rem;
            }

            .load-more-btn {
                padding: 0.75rem 2rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #F8FAFC;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .load-more-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(15, 20, 25, 0.95);
                border: 1px solid rgba(34, 211, 238, 0.3);
                border-radius: 8px;
                margin-top: 0.25rem;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                backdrop-filter: blur(10px);
                display: none;
            }

            .suggestion-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #CBD5E1;
                transition: all 0.2s ease;
            }

            .suggestion-item:hover {
                background: rgba(34, 211, 238, 0.1);
                color: #22D3EE;
            }

            .suggestion-item:last-child {
                border-bottom: none;
            }

            @media (max-width: 768px) {
                .search-input-container {
                    flex-direction: column;
                    gap: 1rem;
                }

                .search-filters {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 1rem;
                }

                .filter-group {
                    justify-content: space-between;
                }

                .filter-select {
                    min-width: auto;
                    flex: 1;
                }

                .stats-content {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const searchInput = document.getElementById('ai-search-input');
        const searchBtn = document.getElementById('search-btn');
        const categoryFilter = document.getElementById('category-filter');
        const dateFilter = document.getElementById('date-filter');
        const sortFilter = document.getElementById('sort-filter');
        const suggestionTags = document.querySelectorAll('.suggestion-tag');

        // Search input events
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSearch();
                }
            });
            searchInput.addEventListener('focus', () => this.showSuggestions());
            searchInput.addEventListener('blur', () => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => this.hideSuggestions(), 150);
            });
        }

        // Search button
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.executeSearch());
        }

        // Filter events
        [categoryFilter, dateFilter, sortFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.handleFilterChange());
            }
        });

        // Suggestion tags
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const query = e.target.dataset.query;
                if (query && searchInput) {
                    searchInput.value = query;
                    this.executeSearch();
                }
            });
        });
    }

    /**
     * Handle search input with debouncing
     */
    handleSearchInput(event) {
        const query = event.target.value;
        this.currentQuery = query;

        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Show suggestions immediately for short queries
        if (query.length >= 2) {
            this.updateSuggestions(query);
        } else {
            this.hideSuggestions();
        }

        // Auto-search after 500ms of no typing
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 3) {
                this.executeSearch();
            }
        }, 500);
    }

    /**
     * Handle filter changes
     */
    handleFilterChange() {
        const categoryFilter = document.getElementById('category-filter');
        const dateFilter = document.getElementById('date-filter');
        const sortFilter = document.getElementById('sort-filter');

        this.filters.category = categoryFilter?.value || 'all';
        this.filters.sortBy = sortFilter?.value || 'relevance';

        // Convert date filter to date range
        const dateValue = dateFilter?.value || 'all';
        this.filters.dateRange = this.getDateRange(dateValue);

        // Re-execute search if we have a query
        if (this.currentQuery) {
            this.executeSearch();
        }
    }

    /**
     * Convert date filter to date range
     */
    getDateRange(dateValue) {
        const now = new Date();
        const ranges = {
            today: {
                start: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
                end: new Date(now.setHours(23, 59, 59, 999)).toISOString()
            },
            week: {
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            },
            month: {
                start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            },
            quarter: {
                start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            }
        };

        return ranges[dateValue] || null;
    }

    /**
     * Execute search with current query and filters
     */
    async executeSearch() {
        if (this.isSearching) return;

        const query = this.currentQuery.trim();
        if (!query) {
            this.showEmptyState();
            return;
        }

        this.isSearching = true;
        this.showLoading();
        this.hideSuggestions();

        try {
            const results = await this.search.unifiedSearch(query, {
                ...this.filters,
                limit: 20
            });

            this.currentResults = results.results;
            this.displayResults(results);

        } catch (error) {
            console.error('Search execution error:', error);
            this.showError(error.message);
        } finally {
            this.isSearching = false;
        }
    }

    /**
     * Display search results
     */
    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        const statsContainer = document.getElementById('search-stats');
        const loadingContainer = document.getElementById('search-loading');
        const emptyContainer = document.getElementById('search-empty');

        // Hide loading
        if (loadingContainer) loadingContainer.style.display = 'none';

        if (results.results.length === 0) {
            this.showEmptyState();
            return;
        }

        // Show stats
        if (statsContainer) {
            statsContainer.style.display = 'block';
            statsContainer.querySelector('.result-count').textContent =
                `${results.total} result${results.total !== 1 ? 's' : ''}`;
            statsContainer.querySelector('.search-time').textContent =
                `in ${results.searchTime}ms`;
            statsContainer.querySelector('.search-sources').textContent =
                `(${results.sources.rss} RSS + ${results.sources.static} Original)`;
        }

        // Hide empty state
        if (emptyContainer) emptyContainer.style.display = 'none';

        // Render results
        if (resultsContainer) {
            resultsContainer.innerHTML = results.results.map(result =>
                this.renderResultItem(result)
            ).join('');

            // Add click handlers
            resultsContainer.querySelectorAll('.result-item').forEach((item, index) => {
                item.addEventListener('click', () => this.handleResultClick(results.results[index]));
            });
        }
    }

    /**
     * Render individual result item
     */
    renderResultItem(result) {
        const timeAgo = this.formatTimeAgo(result.pub_date);
        const readTime = Math.max(1, Math.ceil((result.word_count || 300) / 200));

        return `
            <div class="result-item" data-result-id="${result.id}">
                <div class="result-header">
                    <span class="result-type ${result.contentType || 'rss'}">${result.contentType === 'original' ? 'Original' : 'News'}</span>
                    <div class="result-meta">
                        <span>📅 ${timeAgo}</span>
                        <span>📖 ${readTime} min read</span>
                        ${result.featured ? '<span>⭐ Featured</span>' : ''}
                        ${result.breaking_news === 'TRUE' || result.breaking_news === true ? '<span>🔥 Breaking</span>' : ''}
                    </div>
                </div>

                <h3 class="result-title">${this.highlightSearchTerms(result.title, this.currentQuery)}</h3>

                <p class="result-description">${this.highlightSearchTerms(this.truncateText(result.description || result.content_snippet || '', 200), this.currentQuery)}</p>

                <div class="result-footer">
                    <span class="result-source">📰 ${result.source || 'AI Buffet'}</span>
                    <span class="result-date">${timeAgo}</span>
                </div>
            </div>
        `;
    }

    /**
     * Handle result click
     */
    handleResultClick(result) {
        // Track click analytics
        this.search.trackSearch(`click:${result.id}`, 1, 0, { action: 'click' });

        // Navigate to result
        if (result.contentType === 'original') {
            window.location.href = result.link;
        } else {
            window.location.href = `templates/article-template.html?id=${result.id}`;
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loading = document.getElementById('search-loading');
        const results = document.getElementById('search-results');
        const empty = document.getElementById('search-empty');
        const stats = document.getElementById('search-stats');

        if (loading) loading.style.display = 'flex';
        if (results) results.innerHTML = '';
        if (empty) empty.style.display = 'none';
        if (stats) stats.style.display = 'none';
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const loading = document.getElementById('search-loading');
        const results = document.getElementById('search-results');
        const empty = document.getElementById('search-empty');
        const stats = document.getElementById('search-stats');

        if (loading) loading.style.display = 'none';
        if (results) results.innerHTML = '';
        if (empty) empty.style.display = 'block';
        if (stats) stats.style.display = 'none';
    }

    /**
     * Show error state
     */
    showError(message) {
        const results = document.getElementById('search-results');
        if (results) {
            results.innerHTML = `
                <div class="search-error" style="text-align: center; padding: 2rem; color: #EF4444;">
                    <h3>Search Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #EF4444; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Update search suggestions
     */
    async updateSuggestions(query) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const suggestions = await this.search.getSearchSuggestions(query, 5);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }

    /**
     * Display search suggestions
     */
    displaySuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsContainer.innerHTML = suggestions.map(suggestion =>
            `<div class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</div>`
        ).join('');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                const searchInput = document.getElementById('ai-search-input');
                if (searchInput) {
                    searchInput.value = suggestion;
                    this.currentQuery = suggestion;
                    this.executeSearch();
                }
            });
        });

        suggestionsContainer.style.display = 'block';
    }

    /**
     * Show suggestions
     */
    showSuggestions() {
        const query = this.currentQuery;
        if (query && query.length >= 2) {
            this.updateSuggestions(query);
        }
    }

    /**
     * Hide suggestions
     */
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    /**
     * Highlight search terms in text
     */
    highlightSearchTerms(text, query) {
        if (!text || !query) return text;

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
        let highlightedText = text;

        searchTerms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark style="background: rgba(34, 211, 238, 0.3); color: #22D3EE; padding: 0 0.2em;">$1</mark>');
        });

        return highlightedText;
    }

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    /**
     * Set search query programmatically
     */
    setQuery(query) {
        const searchInput = document.getElementById('ai-search-input');
        if (searchInput) {
            searchInput.value = query;
            this.currentQuery = query;
            this.executeSearch();
        }
    }

    /**
     * Clear search
     */
    clearSearch() {
        const searchInput = document.getElementById('ai-search-input');
        if (searchInput) {
            searchInput.value = '';
            this.currentQuery = '';
        }

        this.showEmptyState();
        this.hideSuggestions();
    }
}

// Export for use in other files
window.SearchUI = SearchUI;