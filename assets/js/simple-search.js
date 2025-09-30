/**
 * Simple Search System for AI Buffet
 * Lightweight, working search implementation
 */

class SimpleSearch {
    constructor() {
        this.supabase = null;
        this.searchContainer = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            // Wait for Supabase to be available
            if (typeof window.supabase === 'undefined') {
                console.log('Waiting for Supabase...');
                setTimeout(() => this.init(), 500);
                return;
            }

            // Initialize Supabase
            const SUPABASE_URL = 'https://npetaroffoyjohjiwssf.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZXRhcm9mZm95am9oaml3c3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDk5OTgsImV4cCI6MjA3MjU4NTk5OH0.oYJ4ETV_zIDx_7KWJlEtcrIrRqy72HYEFzAs37pPzB8';

            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Create search interface
            this.createSearchInterface();

            this.isInitialized = true;
            console.log('✅ Simple search initialized successfully');

        } catch (error) {
            console.error('❌ Simple search initialization failed:', error);
        }
    }

    createSearchInterface() {
        // Find container
        this.searchContainer = document.getElementById('advanced-search-container');
        if (!this.searchContainer) {
            console.error('Search container not found');
            return;
        }

        // Create search HTML
        this.searchContainer.innerHTML = `
            <div class="simple-search-wrapper">
                <div class="search-header">
                    <h3 style="color: #22D3EE; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🔍</span>
                        <span>Search AI Articles</span>
                    </h3>
                </div>

                <div class="search-input-container">
                    <input
                        type="text"
                        id="simple-search-input"
                        placeholder="Search AI tools, news, tutorials..."
                        class="search-input"
                        style="
                            width: 100%;
                            padding: 1rem;
                            border: 2px solid rgba(34, 211, 238, 0.3);
                            border-radius: 12px;
                            background: rgba(15, 20, 25, 0.8);
                            color: #F8FAFC;
                            font-size: 1rem;
                            margin-bottom: 1rem;
                            transition: all 0.3s ease;
                        "
                    >
                    <button
                        id="simple-search-btn"
                        style="
                            background: linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%);
                            color: white;
                            border: none;
                            padding: 1rem 2rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            margin-bottom: 1rem;
                        "
                    >
                        Search
                    </button>
                </div>

                <div id="search-status" style="
                    padding: 0.5rem;
                    margin-bottom: 1rem;
                    color: #CBD5E1;
                    font-size: 0.875rem;
                    display: none;
                "></div>

                <div id="search-results" style="
                    display: grid;
                    gap: 1rem;
                "></div>

                <div id="load-more-container" style="
                    text-align: center;
                    margin-top: 1.5rem;
                    display: none;
                ">
                    <button id="load-more-btn" style="
                        background: rgba(34, 211, 238, 0.1);
                        border: 1px solid rgba(34, 211, 238, 0.3);
                        color: #22D3EE;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    ">
                        Load More Results
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachEventListeners();

        // Add focus styles
        const searchInput = document.getElementById('simple-search-input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.style.borderColor = '#22D3EE';
                searchInput.style.boxShadow = '0 0 20px rgba(34, 211, 238, 0.3)';
            });

            searchInput.addEventListener('blur', () => {
                searchInput.style.borderColor = 'rgba(34, 211, 238, 0.3)';
                searchInput.style.boxShadow = 'none';
            });
        }
    }

    attachEventListeners() {
        const searchInput = document.getElementById('simple-search-input');
        const searchBtn = document.getElementById('simple-search-btn');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (searchInput) {
            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(0);
                }
            });

            // Search as user types (debounced)
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length >= 3) {
                        this.performSearch(0);
                    } else if (e.target.value.length === 0) {
                        this.clearResults();
                    }
                }, 500);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(0);
            });
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreResults();
            });

            // Add hover effects
            loadMoreBtn.addEventListener('mouseenter', () => {
                loadMoreBtn.style.background = 'rgba(34, 211, 238, 0.2)';
                loadMoreBtn.style.transform = 'translateY(-2px)';
            });

            loadMoreBtn.addEventListener('mouseleave', () => {
                loadMoreBtn.style.background = 'rgba(34, 211, 238, 0.1)';
                loadMoreBtn.style.transform = 'translateY(0)';
            });
        }
    }

    async performSearch(offset = 0) {
        const searchInput = document.getElementById('simple-search-input');
        const query = searchInput?.value?.trim();

        if (!query || query.length < 2) {
            this.showStatus('Please enter at least 2 characters to search');
            return;
        }

        if (!this.supabase) {
            this.showStatus('Search system not ready, please try again');
            return;
        }

        try {
            this.showStatus('Searching...', 'loading');

            const RESULTS_PER_PAGE = 10; // Limit results per page

            // Search in Supabase with pagination
            const { data: articles, error } = await this.supabase
                .from('articles')
                .select(`
                    id,
                    title,
                    description,
                    content_snippet,
                    link,
                    source,
                    author,
                    pub_date,
                    word_count,
                    featured,
                    breaking_news,
                    trending_score
                `)
                .or(`title.ilike.%${query}%, description.ilike.%${query}%, content_snippet.ilike.%${query}%`)
                .order('trending_score', { ascending: false })
                .order('pub_date', { ascending: false })
                .range(offset, offset + RESULTS_PER_PAGE - 1);

            if (error) {
                throw error;
            }

            // Add original articles only on first page
            let allResults = articles || [];

            if (offset === 0) {
                const originalArticles = [{
                    id: 'top-10-ai-tools-2025',
                    title: 'Top 10 AI Tools 2025: Best Artificial Intelligence Software for Professionals',
                    description: 'Discover the top 10 AI tools dominating 2025. From ChatGPT Plus to Claude 3.5 Sonnet, Midjourney V6, and more - complete reviews, pricing, and use cases.',
                    link: 'articles/top-10-ai-tools-2025.html',
                    source: 'AI Buffet Original',
                    author: 'AI Buffet Team',
                    pub_date: '2025-09-30T10:00:00Z',
                    word_count: 2847,
                    featured: true,
                    type: 'original',
                    trending_score: 100
                }];

                // Filter original articles by query
                const filteredOriginal = originalArticles.filter(article =>
                    article.title.toLowerCase().includes(query.toLowerCase()) ||
                    article.description.toLowerCase().includes(query.toLowerCase())
                );

                // Combine results with original articles first
                allResults = [...filteredOriginal, ...articles];
            }

            // Store current search state
            this.currentQuery = query;
            this.currentOffset = offset;
            this.hasMoreResults = articles?.length === RESULTS_PER_PAGE;

            this.displayResults(allResults, query, offset);

        } catch (error) {
            console.error('Search error:', error);
            this.showStatus('Search failed. Please try again.', 'error');
        }
    }

    displayResults(results, query, offset = 0) {
        const resultsContainer = document.getElementById('search-results');

        if (!results || results.length === 0) {
            if (offset === 0) {
                this.showStatus(`No results found for "${query}"`);
                resultsContainer.innerHTML = `
                    <div style="
                        text-align: center;
                        padding: 2rem;
                        color: #CBD5E1;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    ">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
                        <h3 style="margin-bottom: 0.5rem;">No results found</h3>
                        <p>Try different keywords or check spelling</p>
                        <div style="margin-top: 1rem; font-size: 0.875rem; color: #94A3B8;">
                            <p>Popular searches: <strong>ChatGPT</strong>, <strong>AI tools</strong>, <strong>Midjourney</strong>, <strong>Claude</strong></p>
                        </div>
                    </div>
                `;
                this.hideLoadMore();
            }
            return;
        }

        const totalDisplayed = offset + results.length;
        this.showStatus(`Showing ${Math.min(10, totalDisplayed)} results for "${query}"${this.hasMoreResults ? ' (more available)' : ''}`);

        // Clear results if this is a new search (offset = 0)
        if (offset === 0) {
            resultsContainer.innerHTML = '';
        }

        // Add new results
        const newResultsHTML = results.map(result => this.createResultHTML(result, query)).join('');
        resultsContainer.insertAdjacentHTML('beforeend', newResultsHTML);

        // Add click handlers to new results only
        const newItems = resultsContainer.querySelectorAll('.result-item:not([data-click-handler])');
        newItems.forEach((item, index) => {
            item.setAttribute('data-click-handler', 'true');
            item.addEventListener('click', () => {
                const resultIndex = offset + index;
                const result = results[index];

                if (result.type === 'original') {
                    window.location.href = result.link;
                } else {
                    window.location.href = `templates/article-template.html?id=${result.id}`;
                }

                // Track click analytics
                console.log(`🖱️ Search result clicked: ${result.title} (position: ${resultIndex + 1})`);
            });
        });

        // Show/hide Load More button
        this.updateLoadMoreButton();
    }

    createResultHTML(result, query) {
        const timeAgo = this.formatTimeAgo(result.pub_date);
        const readTime = Math.max(1, Math.ceil((result.word_count || 300) / 200));
        const isOriginal = result.type === 'original';

        return `
            <div class="result-item" style="
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(34, 211, 238, 0.3)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'">

                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <span style="
                        background: ${isOriginal ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)'};
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                    ">
                        ${isOriginal ? '⭐ Original' : '📰 News'}
                    </span>

                    <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: #94A3B8;">
                        <span>📅 ${timeAgo}</span>
                        <span>📖 ${readTime} min read</span>
                        ${result.featured ? '<span style="color: #F59E0B;">⭐ Featured</span>' : ''}
                        ${result.breaking_news === 'TRUE' ? '<span style="color: #EF4444;">🔥 Breaking</span>' : ''}
                    </div>
                </div>

                <h3 style="
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #F8FAFC;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                ">
                    ${this.highlightText(result.title, query)}
                </h3>

                <p style="
                    color: #CBD5E1;
                    line-height: 1.6;
                    margin-bottom: 0.75rem;
                ">
                    ${this.highlightText(this.truncateText(result.description || result.content_snippet || '', 200), query)}
                </p>

                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                    color: #94A3B8;
                ">
                    <span style="font-weight: 500;">📰 ${result.source || 'AI Buffet'}</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }

    highlightText(text, query) {
        if (!text || !query) return text;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(34, 211, 238, 0.3); color: #22D3EE; padding: 0 0.2em; border-radius: 3px;">$1</mark>');
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

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

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('search-status');
        if (!statusDiv) return;

        statusDiv.style.display = 'block';
        statusDiv.textContent = message;

        switch (type) {
            case 'loading':
                statusDiv.style.color = '#22D3EE';
                break;
            case 'error':
                statusDiv.style.color = '#EF4444';
                break;
            default:
                statusDiv.style.color = '#CBD5E1';
        }
    }

    clearResults() {
        const resultsContainer = document.getElementById('search-results');
        const statusDiv = document.getElementById('search-status');

        if (resultsContainer) resultsContainer.innerHTML = '';
        if (statusDiv) statusDiv.style.display = 'none';
        this.hideLoadMore();
    }

    async loadMoreResults() {
        if (!this.currentQuery || !this.hasMoreResults) return;

        const nextOffset = this.currentOffset + 10;

        // Update button to show loading
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
        }

        try {
            await this.performSearch(nextOffset);
        } catch (error) {
            console.error('Load more error:', error);
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Load More Results';
                loadMoreBtn.disabled = false;
            }
        }
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (!loadMoreContainer || !loadMoreBtn) return;

        if (this.hasMoreResults) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.textContent = 'Load More Results';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    hideLoadMore() {
        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.simpleSearch = new SimpleSearch();
    }, 1000);
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet
} else {
    // DOM is already loaded
    setTimeout(() => {
        if (!window.simpleSearch) {
            window.simpleSearch = new SimpleSearch();
        }
    }, 1000);
}