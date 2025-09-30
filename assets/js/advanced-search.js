/**
 * AI Buffet Advanced Search System
 * Unified search across RSS articles + original content
 * Phase 1: Foundation Infrastructure
 */

class AIBuffetSearch {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.searchCache = new Map();
        this.searchAnalytics = [];
        this.initializeStaticIndex();
    }

    /**
     * Initialize static content index (original articles)
     */
    initializeStaticIndex() {
        this.staticContent = [
            {
                id: 'top-10-ai-tools-2025',
                title: 'Top 10 AI Tools 2025: Best Artificial Intelligence Software for Professionals',
                description: 'Discover the top 10 AI tools dominating 2025. From ChatGPT Plus to Claude 3.5 Sonnet, Midjourney V6, and more - complete reviews, pricing, and use cases.',
                content_snippet: 'ChatGPT Plus, Claude 3.5 Sonnet, Midjourney V6, GitHub Copilot, Notion AI, Perplexity AI, Canva AI, Grammarly AI, Synthesia, RunwayML artificial intelligence software professional tools 2025',
                link: 'articles/top-10-ai-tools-2025.html',
                source: 'AI Buffet Original',
                author: 'AI Buffet Team',
                pub_date: '2025-09-30T10:00:00Z',
                category: 'Tools',
                word_count: 2847,
                featured: true,
                type: 'original'
            }
            // Add more original articles here as they're created
        ];
    }

    /**
     * Advanced Supabase search with optimized query
     */
    async searchRSSArticles(query, options = {}) {
        const {
            limit = 20,
            offset = 0,
            dateRange = null,
            category = null,
            source = null,
            sortBy = 'relevance'
        } = options;

        try {
            const cacheKey = `rss-${query}-${JSON.stringify(options)}`;
            if (this.searchCache.has(cacheKey)) {
                return this.searchCache.get(cacheKey);
            }

            // Build optimized search query
            let queryBuilder = this.supabase
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
                    category,
                    featured,
                    breaking_news,
                    is_top_story,
                    trending_score,
                    word_count
                `);

            // Enhanced text search using PostgreSQL full-text search
            if (query && query.trim()) {
                const searchTerms = this.preprocessQuery(query);

                // Use text search for better relevance
                queryBuilder = queryBuilder.or([
                    `title.ilike.%${searchTerms}%`,
                    `description.ilike.%${searchTerms}%`,
                    `content_snippet.ilike.%${searchTerms}%`,
                    `source.ilike.%${searchTerms}%`,
                    `author.ilike.%${searchTerms}%`
                ].join(', '));
            }

            // Date filtering
            if (dateRange) {
                const { start, end } = dateRange;
                if (start) queryBuilder = queryBuilder.gte('pub_date', start);
                if (end) queryBuilder = queryBuilder.lte('pub_date', end);
            }

            // Category filtering
            if (category && category !== 'all') {
                queryBuilder = queryBuilder.ilike('title', `%${category}%`);
            }

            // Source filtering
            if (source && source !== 'all') {
                queryBuilder = queryBuilder.eq('source', source);
            }

            // Smart sorting
            switch (sortBy) {
                case 'relevance':
                    queryBuilder = queryBuilder.order('trending_score', { ascending: false });
                    break;
                case 'date':
                    queryBuilder = queryBuilder.order('pub_date', { ascending: false });
                    break;
                case 'popular':
                    queryBuilder = queryBuilder.order('word_count', { ascending: false });
                    break;
                default:
                    queryBuilder = queryBuilder.order('pub_date', { ascending: false });
            }

            // Execute query with pagination
            const { data, error } = await queryBuilder
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('RSS search error:', error);
                return { results: [], total: 0, error: error.message };
            }

            const results = {
                results: data || [],
                total: data?.length || 0,
                searchType: 'rss'
            };

            // Cache results for 5 minutes
            this.searchCache.set(cacheKey, results);
            setTimeout(() => this.searchCache.delete(cacheKey), 5 * 60 * 1000);

            return results;

        } catch (error) {
            console.error('RSS search error:', error);
            return { results: [], total: 0, error: error.message };
        }
    }

    /**
     * Search static content (original articles)
     */
    searchStaticContent(query, options = {}) {
        const { limit = 20, offset = 0 } = options;

        if (!query || !query.trim()) {
            return {
                results: this.staticContent.slice(offset, offset + limit),
                total: this.staticContent.length,
                searchType: 'static'
            };
        }

        const searchTerms = this.preprocessQuery(query).toLowerCase();

        const results = this.staticContent.filter(article => {
            const searchableText = [
                article.title,
                article.description,
                article.content_snippet,
                article.source,
                article.author,
                article.category
            ].join(' ').toLowerCase();

            return searchableText.includes(searchTerms);
        });

        // Simple relevance scoring for static content
        const scoredResults = results.map(article => {
            let score = 0;
            const lowerTitle = article.title.toLowerCase();
            const lowerDesc = article.description.toLowerCase();

            // Title match = higher score
            if (lowerTitle.includes(searchTerms)) score += 10;
            if (lowerDesc.includes(searchTerms)) score += 5;
            if (article.featured) score += 3;

            return { ...article, relevanceScore: score };
        });

        // Sort by relevance score
        scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return {
            results: scoredResults.slice(offset, offset + limit),
            total: scoredResults.length,
            searchType: 'static'
        };
    }

    /**
     * Unified search across all content types
     */
    async unifiedSearch(query, options = {}) {
        const { limit = 20, includeStatic = true, includeRSS = true } = options;

        const startTime = performance.now();

        try {
            const promises = [];

            // Search RSS articles
            if (includeRSS) {
                promises.push(this.searchRSSArticles(query, { ...options, limit: Math.ceil(limit * 0.8) }));
            }

            // Search static content
            if (includeStatic) {
                promises.push(Promise.resolve(this.searchStaticContent(query, { ...options, limit: Math.ceil(limit * 0.2) })));
            }

            const [rssResults, staticResults] = await Promise.all(promises);

            // Merge and rank results
            const mergedResults = this.mergeSearchResults(
                rssResults?.results || [],
                staticResults?.results || [],
                query
            );

            // Limit final results
            const finalResults = mergedResults.slice(0, limit);

            const searchTime = performance.now() - startTime;

            // Track search analytics
            this.trackSearch(query, finalResults.length, searchTime, options);

            return {
                results: finalResults,
                total: mergedResults.length,
                searchTime: Math.round(searchTime),
                sources: {
                    rss: rssResults?.total || 0,
                    static: staticResults?.total || 0
                }
            };

        } catch (error) {
            console.error('Unified search error:', error);
            return {
                results: [],
                total: 0,
                error: error.message,
                searchTime: performance.now() - startTime
            };
        }
    }

    /**
     * Merge and intelligently rank results from multiple sources
     */
    mergeSearchResults(rssResults, staticResults, query) {
        const allResults = [];

        // Add RSS results with source indicator
        rssResults.forEach(article => {
            allResults.push({
                ...article,
                contentType: 'rss',
                relevanceScore: this.calculateRelevanceScore(article, query)
            });
        });

        // Add static results with source indicator
        staticResults.forEach(article => {
            allResults.push({
                ...article,
                contentType: 'original',
                relevanceScore: article.relevanceScore || this.calculateRelevanceScore(article, query)
            });
        });

        // Sort by combined relevance score
        return allResults.sort((a, b) => {
            // Boost original content slightly
            const aScore = a.contentType === 'original' ? a.relevanceScore + 2 : a.relevanceScore;
            const bScore = b.contentType === 'original' ? b.relevanceScore + 2 : b.relevanceScore;

            return bScore - aScore;
        });
    }

    /**
     * Calculate relevance score for an article
     */
    calculateRelevanceScore(article, query) {
        if (!query) return 0;

        const searchTerms = this.preprocessQuery(query).toLowerCase();
        let score = 0;

        const title = (article.title || '').toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = (article.content_snippet || '').toLowerCase();

        // Title matches (highest weight)
        if (title.includes(searchTerms)) score += 15;

        // Description matches
        if (description.includes(searchTerms)) score += 10;

        // Content matches
        if (content.includes(searchTerms)) score += 5;

        // Boost factors
        if (article.featured === true || article.featured === 'TRUE') score += 5;
        if (article.breaking_news === true || article.breaking_news === 'TRUE') score += 3;
        if (article.is_top_story === true || article.is_top_story === 'TRUE') score += 3;

        // Recency boost (articles from last 7 days)
        const articleDate = new Date(article.pub_date);
        const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished <= 7) score += 3;
        if (daysSincePublished <= 1) score += 2;

        // Word count consideration (longer articles may be more comprehensive)
        if (article.word_count > 1000) score += 2;

        return score;
    }

    /**
     * Preprocess search query for better matching
     */
    preprocessQuery(query) {
        if (!query) return '';

        // Remove special characters, normalize spacing
        return query
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Get search suggestions/autocomplete
     */
    async getSearchSuggestions(query, limit = 5) {
        if (!query || query.length < 2) return [];

        try {
            // Get popular search terms from recent articles
            const { data } = await this.supabase
                .from('articles')
                .select('title')
                .ilike('title', `%${query}%`)
                .order('trending_score', { ascending: false })
                .limit(limit);

            const suggestions = data?.map(article => {
                // Extract relevant keywords from titles
                const words = article.title.split(' ');
                return words.find(word =>
                    word.toLowerCase().startsWith(query.toLowerCase()) &&
                    word.length > query.length
                );
            }).filter(Boolean) || [];

            // Add common AI terms
            const commonTerms = [
                'ChatGPT', 'Claude', 'Midjourney', 'AI tools', 'artificial intelligence',
                'machine learning', 'GPT-4', 'automation', 'AI news', 'OpenAI'
            ];

            const aiSuggestions = commonTerms.filter(term =>
                term.toLowerCase().includes(query.toLowerCase())
            );

            // Combine and deduplicate
            const allSuggestions = [...new Set([...suggestions, ...aiSuggestions])];

            return allSuggestions.slice(0, limit);

        } catch (error) {
            console.error('Suggestions error:', error);
            return [];
        }
    }

    /**
     * Track search analytics
     */
    trackSearch(query, resultCount, searchTime, options) {
        const searchEvent = {
            timestamp: new Date().toISOString(),
            query: query,
            resultCount: resultCount,
            searchTime: searchTime,
            options: options,
            userAgent: navigator.userAgent,
            page: window.location.pathname
        };

        this.searchAnalytics.push(searchEvent);

        // Keep only last 1000 searches in memory
        if (this.searchAnalytics.length > 1000) {
            this.searchAnalytics = this.searchAnalytics.slice(-1000);
        }

        // Log to console for debugging (remove in production)
        console.log('Search tracked:', searchEvent);
    }

    /**
     * Get search analytics summary
     */
    getSearchAnalytics() {
        const totalSearches = this.searchAnalytics.length;
        const avgSearchTime = this.searchAnalytics.reduce((sum, search) => sum + search.searchTime, 0) / totalSearches;

        const topQueries = this.searchAnalytics
            .reduce((acc, search) => {
                acc[search.query] = (acc[search.query] || 0) + 1;
                return acc;
            }, {});

        const sortedQueries = Object.entries(topQueries)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            totalSearches,
            avgSearchTime: Math.round(avgSearchTime),
            topQueries: sortedQueries,
            recentSearches: this.searchAnalytics.slice(-10)
        };
    }

    /**
     * Clear search cache
     */
    clearCache() {
        this.searchCache.clear();
    }

    /**
     * Add new static content to index
     */
    addStaticContent(article) {
        this.staticContent.push({
            ...article,
            type: 'original'
        });
    }
}

// Export for use in other files
window.AIBuffetSearch = AIBuffetSearch;