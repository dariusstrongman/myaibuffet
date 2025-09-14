// Simple Dynamic Tools System
'use strict';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the tools page
    const toolsGrid = document.getElementById('dynamic-tools-grid');
    if (!toolsGrid) {
        console.log('❌ Not on tools page, skipping initialization');
        return;
    }
    
    console.log('🚀 Initializing Simple Dynamic Tools System...');
    
    // Check database availability
    if (!window.AI_TOOLS_DATABASE || !Array.isArray(window.AI_TOOLS_DATABASE)) {
        console.error('❌ AI_TOOLS_DATABASE not found');
        showError('Failed to load tools database');
        return;
    }
    
    console.log(`✅ Database found with ${window.AI_TOOLS_DATABASE.length} tools`);
    
    // Initialize the tools
    initializeTools();
});

let currentTools = [];
let filteredTools = [];
let activeCategory = 'all';

function initializeTools() {
    try {
        // Load tools data
        currentTools = [...window.AI_TOOLS_DATABASE];
        filteredTools = [...currentTools];
        
        // Set up event listeners
        setupEventListeners();
        
        // Render initial tools
        renderTools();
        
        // Hide loading, show tools
        hideLoading();
        
        console.log(`✅ Successfully loaded ${currentTools.length} tools`);
        
    } catch (error) {
        console.error('❌ Failed to initialize tools:', error);
        showError('Failed to load AI tools. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Category filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    console.log('✅ Event listeners set up');
}

function handleCategoryFilter(event) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update category
    activeCategory = event.target.dataset.category;
    
    // Apply filters and render
    applyFilters();
    renderTools();
    updateCounts();
}

function handleSortChange(event) {
    const sortBy = event.target.value;
    sortTools(sortBy);
    renderTools();
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query) {
        filteredTools = currentTools.filter(tool => 
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.company.toLowerCase().includes(query) ||
            tool.tags.some(tag => tag.toLowerCase().includes(query))
        );
    } else {
        applyFilters();
    }
    
    renderTools();
    updateCounts();
}

function applyFilters() {
    if (activeCategory === 'all') {
        filteredTools = [...currentTools];
    } else {
        filteredTools = currentTools.filter(tool => tool.category === activeCategory);
    }
}

function sortTools(criteria) {
    switch (criteria) {
        case 'popularity':
            filteredTools.sort((a, b) => b.marketData.popularity - a.marketData.popularity);
            break;
        case 'rating':
            filteredTools.sort((a, b) => b.rating - a.rating);
            break;
        case 'alphabetical':
            filteredTools.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // rank
            filteredTools.sort((a, b) => {
                const scoreA = calculateSimpleScore(a);
                const scoreB = calculateSimpleScore(b);
                return scoreB - scoreA;
            });
    }
}

function calculateSimpleScore(tool) {
    return (
        tool.marketData.popularity * 0.3 +
        tool.rating * 20 +
        tool.marketData.trustScore * 0.4 +
        tool.growth * 0.3
    );
}

function renderTools() {
    const toolsGrid = document.getElementById('dynamic-tools-grid');
    if (!toolsGrid) return;
    
    if (filteredTools.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    // Show first 15 tools
    const toolsToShow = filteredTools.slice(0, 15);
    
    const toolsHTML = toolsToShow.map((tool, index) => 
        generateToolCard(tool, index + 1)
    ).join('');
    
    toolsGrid.innerHTML = toolsHTML;
    
    console.log(`⚡ Rendered ${toolsToShow.length} tools`);
}

function generateToolCard(tool, rank) {
    const trendIcon = tool.marketData.lastWeekChange > 0 ? '↗️' : 
                     tool.marketData.lastWeekChange < 0 ? '↘️' : '→';
    
    return `
        <article class="tool-card ${rank <= 3 ? 'tool-card--featured' : ''}" 
                 data-tool-id="${tool.id}">
            <div class="tool-card__rank">
                <span class="rank-number">${rank}</span>
                ${rank === 1 ? '<span class="rank-badge">🏆</span>' : ''}
                ${rank === 2 ? '<span class="rank-badge">🥈</span>' : ''}
                ${rank === 3 ? '<span class="rank-badge">🥉</span>' : ''}
            </div>
            
            <div class="tool-card__header">
                <div class="tool-card__icon">
                    <img src="${tool.icon}" 
                         alt="${tool.name} icon" 
                         width="48" 
                         height="48"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2Ij7wn6SWPC90ZXh0Pgo8L3N2Zz4='">
                </div>
                <div class="tool-card__title-area">
                    <h3 class="tool-card__title">
                        <a href="${tool.url}" target="_blank" rel="noopener" class="tool-card__link">
                            ${tool.name}
                        </a>
                    </h3>
                    <div class="tool-card__category">${getCategoryName(tool.category)}</div>
                    <div class="tool-card__company">by ${tool.company}</div>
                </div>
            </div>
            
            <p class="tool-card__description">${tool.description}</p>
            
            <div class="tool-card__metrics">
                <div class="metric">
                    <span class="metric-value">${tool.rating}</span>
                    <span class="metric-label">Rating</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${tool.users}</span>
                    <span class="metric-label">Users</span>
                </div>
                <div class="metric">
                    <span class="metric-value">${trendIcon} ${Math.abs(tool.marketData.lastWeekChange).toFixed(1)}%</span>
                    <span class="metric-label">7-day Change</span>
                </div>
            </div>
            
            <div class="tool-card__pricing">
                <span class="price-badge ${tool.pricing.range[0] === 0 ? 'price-badge--free' : ''}">
                    ${tool.pricing.type}
                </span>
                <span class="price-details">${tool.pricing.cost}</span>
            </div>
            
            <div class="tool-card__tags">
                ${tool.tags.slice(0, 4).map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('')}
                ${tool.tags.length > 4 ? `<span class="tag tag--more">+${tool.tags.length - 4}</span>` : ''}
            </div>
        </article>
    `;
}

function getCategoryName(category) {
    const names = {
        writing: 'Writing & Content',
        coding: 'Coding & Development', 
        design: 'Design & Creative',
        business: 'Business & Analytics',
        research: 'Research & Analysis',
        productivity: 'Productivity'
    };
    return names[category] || category;
}

function updateCounts() {
    const visibleCount = document.getElementById('visible-count');
    const totalCount = document.getElementById('total-count');
    
    if (visibleCount) {
        visibleCount.textContent = Math.min(filteredTools.length, 15);
    }
    if (totalCount) {
        totalCount.textContent = filteredTools.length;
    }
    
    const lastUpdateTime = document.getElementById('last-update-time');
    if (lastUpdateTime) {
        lastUpdateTime.textContent = 'Just now';
    }
}

function showLoading() {
    const spinner = document.getElementById('tools-loading');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideLoading() {
    const spinner = document.getElementById('tools-loading');
    if (spinner) {
        spinner.style.display = 'none';
    }
    updateCounts();
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const toolsGrid = document.getElementById('dynamic-tools-grid');
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    if (toolsGrid) {
        toolsGrid.style.display = 'none';
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const toolsGrid = document.getElementById('dynamic-tools-grid');
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (toolsGrid) {
        toolsGrid.style.display = 'grid';
    }
}

function showError(message) {
    console.error('❌', message);
    const toolsGrid = document.getElementById('dynamic-tools-grid');
    if (toolsGrid) {
        toolsGrid.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error Loading Tools</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Refresh Page
                </button>
            </div>
        `;
    }
    hideLoading();
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}