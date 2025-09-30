/**
 * AI Buffet Search Analytics
 * Phase 3: Advanced Analytics, Personalization, and Performance Monitoring
 */

class SearchAnalytics {
    constructor(searchInstance, uiInstance) {
        this.search = searchInstance;
        this.ui = uiInstance;
        this.analytics = {
            sessions: [],
            heatmap: {},
            performance: [],
            userBehavior: [],
            conversions: []
        };

        this.userProfile = this.loadUserProfile();
        this.sessionId = this.generateSessionId();
        this.initializeAnalytics();
    }

    /**
     * Initialize analytics tracking
     */
    initializeAnalytics() {
        this.trackPageView();
        this.initUserBehaviorTracking();
        this.initPerformanceMonitoring();
        this.initConversionTracking();
        this.initPersonalization();

        // Send analytics every 30 seconds
        setInterval(() => this.flushAnalytics(), 30000);

        // Send on page unload
        window.addEventListener('beforeunload', () => this.flushAnalytics());
    }

    /**
     * Track page view and session start
     */
    trackPageView() {
        const session = {
            sessionId: this.sessionId,
            startTime: Date.now(),
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            searches: [],
            clicks: [],
            timeOnPage: 0,
            bounced: true // Will be set to false if user interacts
        };

        this.analytics.sessions.push(session);
        this.currentSession = session;

        // Track time on page
        this.pageStartTime = Date.now();
        setInterval(() => {
            if (this.currentSession) {
                this.currentSession.timeOnPage = Date.now() - this.pageStartTime;
            }
        }, 1000);
    }

    /**
     * Initialize user behavior tracking
     */
    initUserBehaviorTracking() {
        // Override search tracking to enhance analytics
        const originalTrackSearch = this.search.trackSearch.bind(this.search);

        this.search.trackSearch = (query, resultCount, searchTime, options) => {
            // Call original tracking
            originalTrackSearch(query, resultCount, searchTime, options);

            // Enhanced analytics tracking
            this.trackSearchEvent(query, resultCount, searchTime, options);
        };

        // Track UI interactions
        this.trackUIInteractions();

        // Track scroll behavior
        this.trackScrollBehavior();

        // Track mouse movements for heatmap
        this.trackMouseMovement();
    }

    /**
     * Track search events with detailed analytics
     */
    trackSearchEvent(query, resultCount, searchTime, options) {
        const searchEvent = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            query: query,
            resultCount: resultCount,
            searchTime: searchTime,
            options: options,
            queryLength: query.length,
            hasFilters: Object.values(options).some(v => v && v !== 'all'),
            queryType: this.classifyQuery(query),
            userIntent: this.detectUserIntent(query),
            searchPosition: this.currentSession.searches.length + 1,
            timeToSearch: this.getTimeToSearch()
        };

        this.currentSession.searches.push(searchEvent);
        this.currentSession.bounced = false;

        // Update user profile
        this.updateUserProfile(searchEvent);

        // Track search heatmap
        this.updateSearchHeatmap(query);

        console.log('📊 Search event tracked:', searchEvent);
    }

    /**
     * Classify search query type
     */
    classifyQuery(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('how to') || lowerQuery.includes('tutorial')) return 'tutorial';
        if (lowerQuery.includes('vs') || lowerQuery.includes('versus')) return 'comparison';
        if (lowerQuery.includes('best') || lowerQuery.includes('top')) return 'recommendation';
        if (lowerQuery.includes('news') || lowerQuery.includes('latest')) return 'news';
        if (lowerQuery.includes('review')) return 'review';
        if (lowerQuery.includes('free') || lowerQuery.includes('price')) return 'pricing';

        return 'general';
    }

    /**
     * Detect user intent from search query
     */
    detectUserIntent(query) {
        const lowerQuery = query.toLowerCase();

        // Commercial intent
        if (['buy', 'price', 'cost', 'free', 'cheap', 'subscription'].some(word => lowerQuery.includes(word))) {
            return 'commercial';
        }

        // Informational intent
        if (['how', 'what', 'why', 'when', 'tutorial', 'guide'].some(word => lowerQuery.includes(word))) {
            return 'informational';
        }

        // Navigational intent
        if (['login', 'download', 'signup', 'website'].some(word => lowerQuery.includes(word))) {
            return 'navigational';
        }

        // Transactional intent
        if (['review', 'comparison', 'vs', 'best', 'top'].some(word => lowerQuery.includes(word))) {
            return 'transactional';
        }

        return 'informational';
    }

    /**
     * Track UI interactions
     */
    trackUIInteractions() {
        // Track filter usage
        document.addEventListener('change', (e) => {
            if (e.target.matches('.filter-select, .content-checkbox')) {
                this.trackInteraction('filter_change', {
                    filter: e.target.id,
                    value: e.target.value || e.target.checked,
                    timestamp: Date.now()
                });
            }
        });

        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.search-btn, .apply-filters-btn, .clear-filters-btn')) {
                this.trackInteraction('button_click', {
                    button: e.target.className,
                    timestamp: Date.now()
                });
            }

            // Track result clicks
            if (e.target.closest('.result-item')) {
                this.trackResultClick(e.target.closest('.result-item'));
            }
        });

        // Track keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                this.trackInteraction('keyboard_shortcut', {
                    shortcut: 'search_focus',
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Track result click with detailed analytics
     */
    trackResultClick(resultElement) {
        const resultId = resultElement.dataset.resultId;
        const position = Array.from(resultElement.parentNode.children).indexOf(resultElement) + 1;
        const title = resultElement.querySelector('.result-title')?.textContent;

        const clickEvent = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            resultId: resultId,
            position: position,
            title: title,
            clickTime: Date.now() - this.lastSearchTime,
            searchQuery: this.lastSearchQuery
        };

        this.currentSession.clicks.push(clickEvent);

        // Track conversion
        this.trackConversion('result_click', clickEvent);

        console.log('🖱️ Result click tracked:', clickEvent);
    }

    /**
     * Track scroll behavior
     */
    trackScrollBehavior() {
        let maxScroll = 0;
        let scrollSessions = [];
        let scrollStart = Date.now();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);

            // Track scroll sessions
            if (scrollSessions.length === 0 || Date.now() - scrollStart > 2000) {
                scrollSessions.push({
                    start: Date.now(),
                    startPercent: scrollPercent
                });
                scrollStart = Date.now();
            }
        });

        // Save scroll data periodically
        setInterval(() => {
            if (maxScroll > 0) {
                this.trackInteraction('scroll_depth', {
                    maxScroll: maxScroll,
                    scrollSessions: scrollSessions.length,
                    timestamp: Date.now()
                });
            }
        }, 10000);
    }

    /**
     * Track mouse movement for heatmap
     */
    trackMouseMovement() {
        let mouseEvents = [];
        const maxEvents = 100; // Limit to prevent memory issues

        document.addEventListener('mousemove', (e) => {
            if (mouseEvents.length >= maxEvents) {
                mouseEvents = mouseEvents.slice(-50); // Keep recent half
            }

            mouseEvents.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });
        });

        // Save heatmap data every 30 seconds
        setInterval(() => {
            if (mouseEvents.length > 0) {
                this.updateHeatmap(mouseEvents);
                mouseEvents = []; // Clear to save memory
            }
        }, 30000);
    }

    /**
     * Update search heatmap
     */
    updateSearchHeatmap(query) {
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);

        terms.forEach(term => {
            if (!this.analytics.heatmap[term]) {
                this.analytics.heatmap[term] = {
                    count: 0,
                    firstSeen: Date.now(),
                    lastSeen: Date.now(),
                    contexts: []
                };
            }

            this.analytics.heatmap[term].count++;
            this.analytics.heatmap[term].lastSeen = Date.now();

            // Track context (surrounding words)
            const termIndex = terms.indexOf(term);
            const context = {
                before: terms[termIndex - 1] || null,
                after: terms[termIndex + 1] || null
            };

            this.analytics.heatmap[term].contexts.push(context);

            // Keep only recent contexts
            if (this.analytics.heatmap[term].contexts.length > 10) {
                this.analytics.heatmap[term].contexts = this.analytics.heatmap[term].contexts.slice(-10);
            }
        });
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        // Monitor search performance
        const originalUnifiedSearch = this.search.unifiedSearch.bind(this.search);

        this.search.unifiedSearch = async (...args) => {
            const startTime = performance.now();
            const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

            try {
                const result = await originalUnifiedSearch(...args);
                const endTime = performance.now();
                const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

                this.trackPerformance({
                    operation: 'unified_search',
                    duration: endTime - startTime,
                    memoryUsed: endMemory - startMemory,
                    resultCount: result.total,
                    success: true,
                    timestamp: Date.now()
                });

                return result;

            } catch (error) {
                this.trackPerformance({
                    operation: 'unified_search',
                    duration: performance.now() - startTime,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });

                throw error;
            }
        };

        // Monitor page performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.trackPerformance({
                    operation: 'page_load',
                    duration: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart,
                    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
                    connectTime: perfData.connectEnd - perfData.connectStart,
                    responseTime: perfData.responseEnd - perfData.responseStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    timestamp: Date.now()
                });
            }, 1000);
        });
    }

    /**
     * Track performance metrics
     */
    trackPerformance(metrics) {
        this.analytics.performance.push(metrics);

        // Keep only recent performance data
        if (this.analytics.performance.length > 500) {
            this.analytics.performance = this.analytics.performance.slice(-250);
        }

        // Log slow operations
        if (metrics.duration > 2000) {
            console.warn('🐌 Slow operation detected:', metrics);
        }
    }

    /**
     * Initialize conversion tracking
     */
    initConversionTracking() {
        // Track newsletter signups
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form[data-newsletter]')) {
                this.trackConversion('newsletter_signup', {
                    timestamp: Date.now(),
                    source: 'search_page'
                });
            }
        });

        // Track external link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="http"]') && !e.target.href.includes(location.hostname)) {
                this.trackConversion('external_link_click', {
                    url: e.target.href,
                    text: e.target.textContent,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Track conversion events
     */
    trackConversion(type, data) {
        const conversion = {
            type: type,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            searchesBeforeConversion: this.currentSession.searches.length,
            timeToConversion: Date.now() - this.pageStartTime,
            ...data
        };

        this.analytics.conversions.push(conversion);
        console.log('💰 Conversion tracked:', conversion);
    }

    /**
     * Initialize personalization
     */
    initPersonalization() {
        // Apply user preferences to search
        this.applyPersonalization();

        // Track user preferences
        this.trackUserPreferences();
    }

    /**
     * Load user profile from localStorage
     */
    loadUserProfile() {
        try {
            const stored = localStorage.getItem('ai-buffet-user-profile');
            return stored ? JSON.parse(stored) : {
                interests: {},
                searchHistory: [],
                preferredCategories: [],
                preferredSources: [],
                searchPatterns: {},
                created: Date.now(),
                lastActive: Date.now()
            };
        } catch {
            return {
                interests: {},
                searchHistory: [],
                preferredCategories: [],
                preferredSources: [],
                searchPatterns: {},
                created: Date.now(),
                lastActive: Date.now()
            };
        }
    }

    /**
     * Update user profile based on behavior
     */
    updateUserProfile(searchEvent) {
        // Update interests based on search terms
        const terms = searchEvent.query.toLowerCase().split(' ');
        terms.forEach(term => {
            if (term.length > 2) {
                this.userProfile.interests[term] = (this.userProfile.interests[term] || 0) + 1;
            }
        });

        // Track search patterns
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        if (!this.userProfile.searchPatterns[hour]) {
            this.userProfile.searchPatterns[hour] = 0;
        }
        this.userProfile.searchPatterns[hour]++;

        // Update activity
        this.userProfile.lastActive = Date.now();

        // Add to search history
        this.userProfile.searchHistory.push({
            query: searchEvent.query,
            timestamp: searchEvent.timestamp,
            resultCount: searchEvent.resultCount
        });

        // Keep only recent history
        if (this.userProfile.searchHistory.length > 100) {
            this.userProfile.searchHistory = this.userProfile.searchHistory.slice(-50);
        }

        // Save profile
        this.saveUserProfile();
    }

    /**
     * Save user profile to localStorage
     */
    saveUserProfile() {
        try {
            localStorage.setItem('ai-buffet-user-profile', JSON.stringify(this.userProfile));
        } catch (error) {
            console.warn('Could not save user profile:', error);
        }
    }

    /**
     * Apply personalization to search results
     */
    applyPersonalization() {
        if (!this.search || !this.userProfile) return;

        // Override result ranking to include personalization
        const originalMergeResults = this.search.mergeSearchResults.bind(this.search);

        this.search.mergeSearchResults = (rssResults, staticResults, query) => {
            const mergedResults = originalMergeResults(rssResults, staticResults, query);

            // Apply personalization boost
            return mergedResults.map(result => {
                let personalizedScore = result.relevanceScore;

                // Boost based on user interests
                const titleWords = (result.title || '').toLowerCase().split(' ');
                titleWords.forEach(word => {
                    if (this.userProfile.interests[word]) {
                        personalizedScore += this.userProfile.interests[word] * 0.1;
                    }
                });

                // Boost preferred sources
                if (this.userProfile.preferredSources.includes(result.source)) {
                    personalizedScore += 2;
                }

                return {
                    ...result,
                    personalizedScore: personalizedScore,
                    relevanceScore: personalizedScore
                };
            }).sort((a, b) => b.personalizedScore - a.personalizedScore);
        };
    }

    /**
     * Track user preferences
     */
    trackUserPreferences() {
        // Track source preferences based on clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.result-item')) {
                const resultItem = e.target.closest('.result-item');
                const source = resultItem.querySelector('.result-source')?.textContent?.replace('📰 ', '');

                if (source) {
                    if (!this.userProfile.preferredSources.includes(source)) {
                        this.userProfile.preferredSources.push(source);
                    }

                    // Keep only top 10 sources
                    if (this.userProfile.preferredSources.length > 10) {
                        this.userProfile.preferredSources = this.userProfile.preferredSources.slice(-10);
                    }

                    this.saveUserProfile();
                }
            }
        });
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get time to search (from page load)
     */
    getTimeToSearch() {
        return Date.now() - this.pageStartTime;
    }

    /**
     * Track general interaction
     */
    trackInteraction(type, data) {
        this.analytics.userBehavior.push({
            type: type,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            ...data
        });

        this.currentSession.bounced = false;

        // Keep only recent behavior data
        if (this.analytics.userBehavior.length > 1000) {
            this.analytics.userBehavior = this.analytics.userBehavior.slice(-500);
        }
    }

    /**
     * Update mouse heatmap
     */
    updateHeatmap(mouseEvents) {
        // Simplified heatmap - just track general areas
        mouseEvents.forEach(event => {
            const gridX = Math.floor(event.x / 100);
            const gridY = Math.floor(event.y / 100);
            const key = `${gridX},${gridY}`;

            if (!this.analytics.heatmap[key]) {
                this.analytics.heatmap[key] = 0;
            }
            this.analytics.heatmap[key]++;
        });
    }

    /**
     * Flush analytics to server/localStorage
     */
    flushAnalytics() {
        try {
            // Save to localStorage for now (could be sent to analytics server)
            const analyticsData = {
                ...this.analytics,
                userProfile: this.userProfile,
                timestamp: Date.now()
            };

            localStorage.setItem('ai-buffet-analytics', JSON.stringify(analyticsData));

            // In production, you would send this to your analytics server
            // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(analyticsData) });

            console.log('📊 Analytics flushed:', {
                sessions: this.analytics.sessions.length,
                searches: this.currentSession?.searches.length || 0,
                clicks: this.currentSession?.clicks.length || 0,
                performance: this.analytics.performance.length,
                conversions: this.analytics.conversions.length
            });

        } catch (error) {
            console.error('Failed to flush analytics:', error);
        }
    }

    /**
     * Get analytics dashboard data
     */
    getDashboardData() {
        const totalSearches = this.analytics.sessions.reduce((sum, session) => sum + session.searches.length, 0);
        const totalClicks = this.analytics.sessions.reduce((sum, session) => sum + session.clicks.length, 0);
        const avgSearchTime = this.analytics.performance
            .filter(p => p.operation === 'unified_search')
            .reduce((sum, p) => sum + p.duration, 0) / Math.max(1, this.analytics.performance.length);

        return {
            overview: {
                totalSessions: this.analytics.sessions.length,
                totalSearches: totalSearches,
                totalClicks: totalClicks,
                avgSearchTime: Math.round(avgSearchTime),
                conversionRate: totalClicks / Math.max(1, totalSearches) * 100
            },
            topSearchTerms: Object.entries(this.analytics.heatmap)
                .filter(([term]) => !term.includes(',')) // Exclude mouse coordinates
                .sort(([,a], [,b]) => (b.count || b) - (a.count || a))
                .slice(0, 10),
            userProfile: this.userProfile,
            performance: this.analytics.performance.slice(-20),
            recentSearches: this.currentSession?.searches.slice(-10) || []
        };
    }

    /**
     * Export analytics data
     */
    exportData() {
        const data = {
            analytics: this.analytics,
            userProfile: this.userProfile,
            exported: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-buffet-analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in other files
window.SearchAnalytics = SearchAnalytics;