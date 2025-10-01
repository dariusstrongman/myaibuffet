#!/usr/bin/env node

/**
 * SEO Enhancement Functions for AI Buffet
 * Provides utilities for improving SEO across the site
 */

/**
 * Calculate reading time for article content
 * Average reading speed: 200-250 words per minute
 * @param {string} text - Article content
 * @returns {number} - Reading time in minutes
 */
function calculateReadingTime(text) {
    if (!text) return 1;

    const wordsPerMinute = 225; // Average reading speed
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Extract keywords from title and content for similarity matching
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Array<string>} - Array of keywords
 */
function extractKeywords(title, content = '') {
    const text = `${title} ${content}`.toLowerCase();

    // AI-related keywords to look for
    const aiKeywords = [
        'chatgpt', 'gpt-4', 'gpt-5', 'openai',
        'claude', 'anthropic',
        'gemini', 'google', 'bard',
        'midjourney', 'dall-e', 'stable diffusion',
        'machine learning', 'ml', 'deep learning',
        'neural network', 'llm', 'large language model',
        'ai model', 'training', 'reasoning',
        'computer vision', 'nlp', 'natural language',
        'automation', 'agent', 'agentic',
        'prompt', 'fine-tuning', 'rag',
        'multimodal', 'vision', 'audio',
        'microsoft', 'meta', 'llama',
        'ai tools', 'productivity', 'business'
    ];

    const foundKeywords = aiKeywords.filter(keyword => text.includes(keyword));

    // Also extract important words from title (excluding common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can'];
    const titleWords = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));

    return [...new Set([...foundKeywords, ...titleWords])];
}

/**
 * Find related articles based on keyword similarity
 * @param {Object} currentArticle - Current article object
 * @param {Array<Object>} allArticles - Array of all articles
 * @param {number} limit - Number of related articles to return
 * @returns {Array<Object>} - Array of related articles
 */
function findRelatedArticles(currentArticle, allArticles, limit = 3) {
    const currentKeywords = extractKeywords(
        currentArticle.title || '',
        currentArticle.description || currentArticle.content_snippet || ''
    );

    // Score each article based on keyword overlap
    const scoredArticles = allArticles
        .filter(article => article.id !== currentArticle.id) // Exclude current article
        .map(article => {
            const articleKeywords = extractKeywords(
                article.title || '',
                article.description || article.content_snippet || ''
            );

            // Calculate similarity score (number of matching keywords)
            const matchingKeywords = currentKeywords.filter(kw =>
                articleKeywords.includes(kw)
            );

            return {
                article,
                score: matchingKeywords.length,
                matchingKeywords
            };
        })
        .filter(item => item.score > 0) // Only include articles with at least one matching keyword
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, limit); // Limit results

    return scoredArticles.map(item => item.article);
}

/**
 * Generate breadcrumb schema for SEO
 * @param {Array<Object>} breadcrumbs - Array of breadcrumb items {name, url}
 * @returns {Object} - Breadcrumb schema object
 */
function generateBreadcrumbSchema(breadcrumbs) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

/**
 * Generate enhanced Article schema with more SEO properties
 * @param {Object} article - Article object
 * @param {string} canonicalUrl - Full canonical URL
 * @param {number} wordCount - Article word count
 * @returns {Object} - Enhanced Article schema
 */
function generateArticleSchema(article, canonicalUrl, wordCount = 0) {
    const pubDate = article.pub_date ? new Date(article.pub_date).toISOString() : new Date().toISOString();
    const modDate = article.updated_at ? new Date(article.updated_at).toISOString() : pubDate;

    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title || 'AI News Article',
        "description": article.description || article.content_snippet || '',
        "articleBody": article.content_snippet || article.description || '',
        "author": {
            "@type": "Person",
            "name": article.author || 'AI Buffet Team'
        },
        "publisher": {
            "@type": "Organization",
            "name": "AI Buffet",
            "url": "https://myaibuffet.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://myaibuffet.com/img/Logo.png",
                "width": 512,
                "height": 512
            }
        },
        "datePublished": pubDate,
        "dateModified": modDate,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "image": {
            "@type": "ImageObject",
            "url": "https://myaibuffet.com/og-image.jpg",
            "width": 1200,
            "height": 630
        },
        "url": canonicalUrl,
        "articleSection": "AI News",
        "wordCount": wordCount,
        "keywords": extractKeywords(article.title || '', article.description || '').join(', '),
        "inLanguage": "en-US"
    };
}

/**
 * Generate FAQ schema for FAQ pages
 * @param {Array<Object>} faqs - Array of FAQ items {question, answer}
 * @returns {Object} - FAQ schema object
 */
function generateFAQSchema(faqs) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

/**
 * Generate HTML for related articles section
 * @param {Array<Object>} relatedArticles - Array of related article objects
 * @param {string} currentSlug - Slug of current article (to generate relative URLs)
 * @returns {string} - HTML for related articles section
 */
function generateRelatedArticlesHTML(relatedArticles, currentSlug = '') {
    if (!relatedArticles || relatedArticles.length === 0) {
        // Fallback to general links
        return `
            <section style="margin-top: var(--space-12);">
                <h2 style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-6); text-align: center; color: var(--color-text-primary);">
                    📰 Explore More
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                    <a href="../../pages/news.html" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: var(--space-6); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--neon-blue)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'">
                        <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--space-3); color: var(--color-text-primary);">Latest AI News</h3>
                        <p style="color: var(--color-text-secondary);">Stay updated with the latest developments in artificial intelligence</p>
                    </a>
                    <a href="../../pages/tools.html" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: var(--space-6); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--neon-blue)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'">
                        <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--space-3); color: var(--color-text-primary);">AI Tools</h3>
                        <p style="color: var(--color-text-secondary);">Discover and review the best AI tools for productivity</p>
                    </a>
                    <a href="../../pages/prompts.html" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: var(--space-6); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--neon-blue)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'">
                        <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--space-3); color: var(--color-text-primary);">AI Prompts</h3>
                        <p style="color: var(--color-text-secondary);">200+ proven ChatGPT prompts for every use case</p>
                    </a>
                </div>
            </section>
        `;
    }

    const articlesHTML = relatedArticles.map(article => {
        const slug = generateSlug(article.title || 'untitled');
        const title = (article.title || 'AI News').substring(0, 80);
        const description = (article.description || article.content_snippet || '').substring(0, 120);
        const pubDate = article.pub_date ? new Date(article.pub_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

        return `
            <a href="${slug}.html" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: var(--space-6); text-decoration: none; transition: all 0.3s ease; display: block;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--neon-blue)'; this.style.boxShadow='var(--glow-blue)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--glass-border)'; this.style.boxShadow=''">
                <div style="color: var(--color-text-tertiary); font-size: var(--font-size-sm); margin-bottom: var(--space-2);">${pubDate}</div>
                <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--space-3); color: var(--color-text-primary); line-height: var(--line-height-snug);">${title}</h3>
                <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${description}...</p>
                <span style="display: inline-block; margin-top: var(--space-4); color: var(--neon-blue); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Read more →</span>
            </a>
        `;
    }).join('');

    return `
        <section style="margin-top: var(--space-12);">
            <h2 style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-bottom: var(--space-6); color: var(--color-text-primary);">
                🔗 Related Articles
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                ${articlesHTML}
            </div>
        </section>
    `;
}

/**
 * Generate slug from title (duplicate from main script for module use)
 * @param {string} title - Article title
 * @returns {string} - URL-safe slug
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

module.exports = {
    calculateReadingTime,
    extractKeywords,
    findRelatedArticles,
    generateBreadcrumbSchema,
    generateArticleSchema,
    generateFAQSchema,
    generateRelatedArticlesHTML,
    generateSlug
};
