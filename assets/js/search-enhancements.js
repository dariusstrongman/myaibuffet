/**
 * AI Buffet Search Enhancements
 * Phase 2: Smart Filtering, Auto-complete, and Advanced Features
 */

class SearchEnhancements {
    constructor(searchInstance, uiInstance) {
        this.search = searchInstance;
        this.ui = uiInstance;
        this.recentSearches = this.loadRecentSearches();
        this.popularSearches = this.loadPopularSearches();
        this.searchFilters = {
            advanced: false,
            minWordCount: null,
            maxWordCount: null,
            authorFilter: null,
            hasImages: null,
            sentiment: null
        };

        this.initializeEnhancements();
    }

    /**
     * Initialize all enhancements
     */
    initializeEnhancements() {
        this.initAdvancedFilters();
        this.initSmartSuggestions();
        this.initSearchHistory();
        this.initKeyboardShortcuts();
        this.initSearchTrends();
    }

    /**
     * Initialize advanced filtering system
     */
    initAdvancedFilters() {
        // Add advanced filters to the UI
        const filtersContainer = document.getElementById('search-filters');
        if (!filtersContainer) return;

        // Create advanced filters toggle
        const advancedToggle = document.createElement('div');
        advancedToggle.className = 'advanced-filters-toggle';
        advancedToggle.innerHTML = `
            <button class="advanced-toggle-btn" id="advanced-toggle">
                <span>Advanced Filters</span>
                <span class="toggle-icon">▼</span>
            </button>
        `;

        // Create advanced filters panel
        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-filters-panel';
        advancedPanel.id = 'advanced-filters-panel';
        advancedPanel.style.display = 'none';
        advancedPanel.innerHTML = `
            <div class="advanced-filters-grid">
                <div class="filter-group">
                    <label class="filter-label">Word Count:</label>
                    <div class="word-count-filter">
                        <input type="number" id="min-words" placeholder="Min" min="0" class="word-count-input">
                        <span>to</span>
                        <input type="number" id="max-words" placeholder="Max" min="0" class="word-count-input">
                        <span>words</span>
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">Author:</label>
                    <select class="filter-select" id="author-filter">
                        <option value="all">All Authors</option>
                        <option value="ai-buffet">AI Buffet Team</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label class="filter-label">Content Type:</label>
                    <div class="content-type-filters">
                        <label class="checkbox-label">
                            <input type="checkbox" id="has-images" class="content-checkbox">
                            <span>Has Images</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="breaking-news" class="content-checkbox">
                            <span>Breaking News</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="featured-only" class="content-checkbox">
                            <span>Featured Only</span>
                        </label>
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">Reading Time:</label>
                    <select class="filter-select" id="reading-time-filter">
                        <option value="all">Any Length</option>
                        <option value="quick">Quick Read (< 3 min)</option>
                        <option value="medium">Medium Read (3-10 min)</option>
                        <option value="long">Long Read (> 10 min)</option>
                    </select>
                </div>

                <div class="filter-actions">
                    <button class="apply-filters-btn" id="apply-filters">Apply Filters</button>
                    <button class="clear-filters-btn" id="clear-filters">Clear All</button>
                </div>
            </div>
        `;

        // Add to DOM
        filtersContainer.appendChild(advancedToggle);
        filtersContainer.appendChild(advancedPanel);

        // Add event listeners
        this.attachAdvancedFilterEvents();
        this.addAdvancedFilterStyles();
    }

    /**
     * Attach advanced filter event listeners
     */
    attachAdvancedFilterEvents() {
        const toggleBtn = document.getElementById('advanced-toggle');
        const panel = document.getElementById('advanced-filters-panel');
        const applyBtn = document.getElementById('apply-filters');
        const clearBtn = document.getElementById('clear-filters');

        // Toggle advanced panel
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                toggleBtn.querySelector('.toggle-icon').textContent = isVisible ? '▼' : '▲';
                this.searchFilters.advanced = !isVisible;
            });
        }

        // Apply filters
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyAdvancedFilters());
        }

        // Clear filters
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAdvancedFilters());
        }

        // Real-time filter updates
        const filterInputs = panel?.querySelectorAll('input, select');
        filterInputs?.forEach(input => {
            input.addEventListener('change', () => {
                if (this.searchFilters.advanced) {
                    this.applyAdvancedFilters();
                }
            });
        });
    }

    /**
     * Apply advanced filters
     */
    applyAdvancedFilters() {
        const minWords = document.getElementById('min-words')?.value;
        const maxWords = document.getElementById('max-words')?.value;
        const author = document.getElementById('author-filter')?.value;
        const hasImages = document.getElementById('has-images')?.checked;
        const breakingNews = document.getElementById('breaking-news')?.checked;
        const featuredOnly = document.getElementById('featured-only')?.checked;
        const readingTime = document.getElementById('reading-time-filter')?.value;

        // Update filter state
        this.searchFilters = {
            ...this.searchFilters,
            minWordCount: minWords ? parseInt(minWords) : null,
            maxWordCount: maxWords ? parseInt(maxWords) : null,
            authorFilter: author !== 'all' ? author : null,
            hasImages: hasImages,
            breakingNews: breakingNews,
            featuredOnly: featuredOnly,
            readingTime: readingTime !== 'all' ? readingTime : null
        };

        // Re-execute search with filters
        this.executeFilteredSearch();
    }

    /**
     * Clear advanced filters
     */
    clearAdvancedFilters() {
        const inputs = document.querySelectorAll('#advanced-filters-panel input, #advanced-filters-panel select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = input.type === 'select-one' ? 'all' : '';
            }
        });

        this.searchFilters = {
            advanced: this.searchFilters.advanced,
            minWordCount: null,
            maxWordCount: null,
            authorFilter: null,
            hasImages: null,
            breakingNews: null,
            featuredOnly: null,
            readingTime: null
        };

        this.executeFilteredSearch();
    }

    /**
     * Execute search with advanced filters
     */
    async executeFilteredSearch() {
        const searchInput = document.getElementById('ai-search-input');
        const query = searchInput?.value || '';

        if (!query) return;

        try {
            // Get base results
            const results = await this.search.unifiedSearch(query, {
                limit: 50,
                ...this.ui.filters
            });

            // Apply advanced filters
            const filteredResults = this.applyClientSideFilters(results.results);

            // Display filtered results
            this.ui.displayResults({
                ...results,
                results: filteredResults,
                total: filteredResults.length
            });

        } catch (error) {
            console.error('Filtered search error:', error);
        }
    }

    /**
     * Apply client-side filters to results
     */
    applyClientSideFilters(results) {
        return results.filter(article => {
            // Word count filter
            if (this.searchFilters.minWordCount && article.word_count < this.searchFilters.minWordCount) {
                return false;
            }
            if (this.searchFilters.maxWordCount && article.word_count > this.searchFilters.maxWordCount) {
                return false;
            }

            // Author filter
            if (this.searchFilters.authorFilter) {
                const authorMatch = (article.author || '').toLowerCase().includes(this.searchFilters.authorFilter.toLowerCase());
                if (!authorMatch) return false;
            }

            // Breaking news filter
            if (this.searchFilters.breakingNews && !(article.breaking_news === 'TRUE' || article.breaking_news === true)) {
                return false;
            }

            // Featured filter
            if (this.searchFilters.featuredOnly && !(article.featured === 'TRUE' || article.featured === true)) {
                return false;
            }

            // Reading time filter
            if (this.searchFilters.readingTime) {
                const readTime = Math.ceil((article.word_count || 300) / 200);
                switch (this.searchFilters.readingTime) {
                    case 'quick':
                        if (readTime >= 3) return false;
                        break;
                    case 'medium':
                        if (readTime < 3 || readTime > 10) return false;
                        break;
                    case 'long':
                        if (readTime <= 10) return false;
                        break;
                }
            }

            return true;
        });
    }

    /**
     * Initialize smart suggestions with machine learning
     */
    initSmartSuggestions() {
        // Override the base suggestions with enhanced ones
        const originalGetSuggestions = this.search.getSearchSuggestions.bind(this.search);

        this.search.getSearchSuggestions = async (query, limit = 8) => {
            try {
                // Get base suggestions
                const baseSuggestions = await originalGetSuggestions(query, limit - 3);

                // Add recent searches
                const recentMatches = this.recentSearches
                    .filter(search => search.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 2);

                // Add popular searches
                const popularMatches = this.popularSearches
                    .filter(search => search.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 2);

                // Add smart completions
                const smartSuggestions = this.generateSmartSuggestions(query);

                // Combine and deduplicate
                const allSuggestions = [
                    ...smartSuggestions,
                    ...recentMatches,
                    ...popularMatches,
                    ...baseSuggestions
                ];

                const uniqueSuggestions = [...new Set(allSuggestions)];
                return uniqueSuggestions.slice(0, limit);

            } catch (error) {
                console.error('Enhanced suggestions error:', error);
                return originalGetSuggestions(query, limit);
            }
        };
    }

    /**
     * Generate smart suggestions based on context
     */
    generateSmartSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // AI tool suggestions
        const aiTools = ['chatgpt', 'claude', 'midjourney', 'copilot', 'notion ai', 'perplexity'];
        const toolMatches = aiTools.filter(tool => tool.includes(lowerQuery));
        suggestions.push(...toolMatches.map(tool => `${tool} review`));

        // Comparison suggestions
        if (lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
            suggestions.push(`${query} comparison`, `${query} differences`);
        }

        // How-to suggestions
        if (lowerQuery.startsWith('how')) {
            suggestions.push(`${query} tutorial`, `${query} guide`, `${query} step by step`);
        }

        // News suggestions
        if (['news', 'update', 'latest'].some(word => lowerQuery.includes(word))) {
            suggestions.push(`${query} today`, `${query} 2025`, `${query} breaking`);
        }

        return suggestions;
    }

    /**
     * Initialize search history tracking
     */
    initSearchHistory() {
        // Override search tracking to save history
        const originalTrackSearch = this.search.trackSearch.bind(this.search);

        this.search.trackSearch = (query, resultCount, searchTime, options) => {
            // Call original tracking
            originalTrackSearch(query, resultCount, searchTime, options);

            // Save to recent searches
            if (query && query.length > 2) {
                this.saveRecentSearch(query);
            }

            // Update popular searches
            this.updatePopularSearches(query, resultCount);
        };
    }

    /**
     * Save recent search to localStorage
     */
    saveRecentSearch(query) {
        let recent = this.loadRecentSearches();

        // Remove if already exists
        recent = recent.filter(search => search.toLowerCase() !== query.toLowerCase());

        // Add to beginning
        recent.unshift(query);

        // Keep only last 20
        recent = recent.slice(0, 20);

        localStorage.setItem('ai-buffet-recent-searches', JSON.stringify(recent));
        this.recentSearches = recent;
    }

    /**
     * Load recent searches from localStorage
     */
    loadRecentSearches() {
        try {
            const stored = localStorage.getItem('ai-buffet-recent-searches');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Update popular searches based on usage
     */
    updatePopularSearches(query, resultCount) {
        if (!query || resultCount === 0) return;

        let popular = this.loadPopularSearches();
        const existing = popular.find(item => item.query.toLowerCase() === query.toLowerCase());

        if (existing) {
            existing.count += 1;
            existing.lastUsed = Date.now();
        } else {
            popular.push({
                query: query,
                count: 1,
                lastUsed: Date.now()
            });
        }

        // Sort by count and recency
        popular.sort((a, b) => {
            const scoreA = a.count * 0.7 + (Date.now() - a.lastUsed) / (1000 * 60 * 60 * 24) * 0.3;
            const scoreB = b.count * 0.7 + (Date.now() - b.lastUsed) / (1000 * 60 * 60 * 24) * 0.3;
            return scoreB - scoreA;
        });

        // Keep top 50
        popular = popular.slice(0, 50);

        localStorage.setItem('ai-buffet-popular-searches', JSON.stringify(popular));
        this.popularSearches = popular.map(item => item.query);
    }

    /**
     * Load popular searches from localStorage
     */
    loadPopularSearches() {
        try {
            const stored = localStorage.getItem('ai-buffet-popular-searches');
            const popular = stored ? JSON.parse(stored) : [];
            return popular.map ? popular.map(item => item.query || item) : [];
        } catch {
            return [];
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('ai-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Escape to clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('ai-search-input');
                if (searchInput && document.activeElement === searchInput) {
                    if (this.ui) {
                        this.ui.clearSearch();
                    }
                }
            }
        });
    }

    /**
     * Initialize search trends tracking
     */
    initSearchTrends() {
        // Track trending topics based on search patterns
        setInterval(() => {
            this.analyzeTrends();
        }, 60000); // Every minute

        // Display trends in UI
        this.displayTrends();
    }

    /**
     * Analyze search trends
     */
    analyzeTrends() {
        const analytics = this.search.getSearchAnalytics();
        const recentSearches = analytics.recentSearches.slice(-50);

        // Extract trending terms
        const termCounts = {};
        recentSearches.forEach(search => {
            const terms = search.query.toLowerCase().split(' ');
            terms.forEach(term => {
                if (term.length > 2) {
                    termCounts[term] = (termCounts[term] || 0) + 1;
                }
            });
        });

        // Sort by frequency
        const trendingTerms = Object.entries(termCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([term]) => term);

        this.updateTrendsDisplay(trendingTerms);
    }

    /**
     * Display trends in the UI
     */
    displayTrends() {
        const searchContainer = document.getElementById('advanced-search-container');
        if (!searchContainer) return;

        const trendsContainer = document.createElement('div');
        trendsContainer.className = 'search-trends';
        trendsContainer.id = 'search-trends';
        trendsContainer.innerHTML = `
            <div class="trends-header">
                <span class="trends-icon">📈</span>
                <span class="trends-title">Trending Searches</span>
            </div>
            <div class="trends-tags" id="trends-tags">
                <span class="trend-tag">Loading trends...</span>
            </div>
        `;

        searchContainer.appendChild(trendsContainer);
    }

    /**
     * Update trends display
     */
    updateTrendsDisplay(trends) {
        const tagsContainer = document.getElementById('trends-tags');
        if (!tagsContainer || trends.length === 0) return;

        tagsContainer.innerHTML = trends.map(trend =>
            `<span class="trend-tag" data-trend="${trend}">${trend}</span>`
        ).join('');

        // Add click handlers
        tagsContainer.querySelectorAll('.trend-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const trend = e.target.dataset.trend;
                if (trend && this.ui) {
                    this.ui.setQuery(trend);
                }
            });
        });
    }

    /**
     * Add advanced filter styles
     */
    addAdvancedFilterStyles() {
        const styleId = 'search-enhancements-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            .advanced-filters-toggle {
                margin-top: 0.75rem;
            }

            .advanced-toggle-btn {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                color: #8B5CF6;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                transition: all 0.3s ease;
            }

            .advanced-toggle-btn:hover {
                background: rgba(139, 92, 246, 0.2);
            }

            .advanced-filters-panel {
                margin-top: 1rem;
                padding: 1.5rem;
                background: rgba(15, 20, 25, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                backdrop-filter: blur(10px);
            }

            .advanced-filters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }

            .word-count-filter {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .word-count-input {
                width: 80px;
                padding: 0.375rem 0.5rem;
                background: rgba(15, 20, 25, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #F8FAFC;
                font-size: 0.875rem;
            }

            .content-type-filters {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-size: 0.875rem;
                color: #CBD5E1;
            }

            .content-checkbox {
                width: 16px;
                height: 16px;
                accent-color: #22D3EE;
            }

            .filter-actions {
                grid-column: 1 / -1;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .apply-filters-btn {
                background: linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .apply-filters-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(34, 211, 238, 0.4);
            }

            .clear-filters-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #CBD5E1;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .clear-filters-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .search-trends {
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(34, 211, 238, 0.05);
                border: 1px solid rgba(34, 211, 238, 0.2);
                border-radius: 12px;
            }

            .trends-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                font-weight: 600;
                color: #22D3EE;
            }

            .trends-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .trend-tag {
                padding: 0.375rem 0.75rem;
                background: rgba(34, 211, 238, 0.1);
                border: 1px solid rgba(34, 211, 238, 0.3);
                color: #22D3EE;
                border-radius: 16px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .trend-tag:hover {
                background: rgba(34, 211, 238, 0.2);
                transform: translateY(-1px);
            }

            @media (max-width: 768px) {
                .advanced-filters-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .filter-actions {
                    grid-column: 1;
                    flex-direction: column;
                }

                .word-count-filter {
                    flex-wrap: wrap;
                }

                .trends-tags {
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Get enhancement analytics
     */
    getAnalytics() {
        return {
            recentSearches: this.recentSearches.length,
            popularSearches: this.popularSearches.length,
            advancedFiltersUsed: this.searchFilters.advanced,
            filterState: this.searchFilters
        };
    }
}

// Export for use in other files
window.SearchEnhancements = SearchEnhancements;