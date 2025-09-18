// Workers API Configuration
const API_BASE_URL = 'https://nam-portfolio-api.namhyunwoo0242.workers.dev/api';

// Global variables
let portfolios = [];
let editingPortfolioId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolios();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterPortfolios, 300));
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', filterPortfolios);
    
    // Portfolio form
    const portfolioForm = document.getElementById('portfolioForm');
    portfolioForm.addEventListener('submit', handlePortfolioSubmit);
}

// Load portfolios from Workers API
async function loadPortfolios() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolios`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            portfolios = result.data || [];
            displayPortfolios(portfolios);
            updateStats();
        } else {
            throw new Error(result.error || 'Failed to load portfolios');
        }
        
    } catch (error) {
        console.error('Error loading portfolios:', error);
        showMessage('포트폴리오 로드 실패: ' + error.message, 'error');
        displayPortfolios([]);
    }
}

// Display portfolios in the grid
function displayPortfolios(portfoliosToShow) {
    const grid = document.getElementById('portfolioGrid');
    
    if (portfoliosToShow.length === 0) {
        grid.innerHTML = '<div class="loading">등록된 포트폴리오가 없습니다.</div>';
        return;
    }
    
    grid.innerHTML = portfoliosToShow.map(portfolio => createPortfolioCard(portfolio)).join('');
}

// Create portfolio card HTML
function createPortfolioCard(portfolio) {
    const imageUrl = portfolio.main_image_url || './images/portfolio-fallback.jpg';
    const statusClass = portfolio.is_active ? 'active' : 'inactive';
    const featuredClass = portfolio.is_featured ? 'featured' : '';
    
    return `
        <div class="portfolio-card ${statusClass} ${featuredClass}">
            <div class="portfolio-image">
                <img src="${imageUrl}" alt="${portfolio.title}" onerror="this.src='./images/portfolio-fallback.jpg'">
            </div>
            <div class="portfolio-content">
                <div class="portfolio-title">${portfolio.title}</div>
                <div class="portfolio-category">${portfolio.category}</div>
                <div class="portfolio-description">${portfolio.description || '설명이 없습니다.'}</div>
                <div class="portfolio-actions">
                    <button class="action-btn edit-btn" onclick="editPortfolio(${portfolio.id})">✏️ 수정</button>
                    <button class="action-btn toggle-btn" onclick="togglePortfolioStatus(${portfolio.id})">
                        ${portfolio.is_active ? '🔒 비활성화' : '🔓 활성화'}
                    </button>
                    <button class="action-btn featured-btn" onclick="toggleFeaturedStatus(${portfolio.id})">
                        ${portfolio.is_featured ? '⭐ 피처드 해제' : '⭐ 피처드 설정'}
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePortfolio(${portfolio.id})">🗑️ 삭제</button>
                </div>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats() {
    const totalPortfolios = portfolios.length;
    const activePortfolios = portfolios.filter(p => p.is_active).length;
    const featuredPortfolios = portfolios.filter(p => p.is_featured).length;
    const categories = new Set(portfolios.map(p => p.category)).size;
    
    document.getElementById('totalPortfolios').textContent = totalPortfolios;
    document.getElementById('activePortfolios').textContent = activePortfolios;
    document.getElementById('featuredPortfolios').textContent = featuredPortfolios;
    document.getElementById('totalCategories').textContent = categories;
}

// Filter portfolios
function filterPortfolios() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = portfolios;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(portfolio => 
            portfolio.title.toLowerCase().includes(searchTerm) ||
            portfolio.description?.toLowerCase().includes(searchTerm) ||
            portfolio.client_name?.toLowerCase().includes(searchTerm) ||
            portfolio.technologies_used?.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(portfolio => portfolio.category === categoryFilter);
    }
    
    displayPortfolios(filtered);
}

// Open add modal
function openAddModal() {
    editingPortfolioId = null;
    document.getElementById('modalTitle').textContent = '새 포트폴리오 추가';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioModal').classList.add('active');
}

// Open edit modal
function editPortfolio(id) {
    const portfolio = portfolios.find(p => p.id === id);
    if (!portfolio) return;
    
    editingPortfolioId = id;
    document.getElementById('modalTitle').textContent = '포트폴리오 수정';
    
    // Fill form with portfolio data
    document.getElementById('title').value = portfolio.title;
    document.getElementById('description').value = portfolio.description || '';
    document.getElementById('category').value = portfolio.category;
    document.getElementById('clientName').value = portfolio.client_name || '';
    document.getElementById('mainImageUrl').value = portfolio.main_image_url || '';
    document.getElementById('imageUrls').value = portfolio.image_urls?.join(', ') || '';
    document.getElementById('websiteUrl').value = portfolio.website_url || '';
    document.getElementById('githubUrl').value = portfolio.github_url || '';
    document.getElementById('technologiesUsed').value = portfolio.technologies_used || '';
    document.getElementById('isFeatured').checked = portfolio.is_featured;
    document.getElementById('isActive').checked = portfolio.is_active;
    
    document.getElementById('portfolioModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('portfolioModal').classList.remove('active');
    editingPortfolioId = null;
}

// Handle portfolio form submission
async function handlePortfolioSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const portfolioData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        client_name: formData.get('clientName'),
        main_image_url: formData.get('mainImageUrl'),
        image_urls: formData.get('imageUrls').split(',').map(url => url.trim()).filter(url => url),
        website_url: formData.get('websiteUrl'),
        github_url: formData.get('githubUrl'),
        technologies_used: formData.get('technologiesUsed'),
        is_featured: formData.get('isFeatured') === 'on',
        is_active: formData.get('isActive') === 'on'
    };
    
    try {
        let response;
        
        if (editingPortfolioId) {
            // Update existing portfolio
            response = await fetch(`${API_BASE_URL}/portfolios/${editingPortfolioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolioData)
            });
        } else {
            // Create new portfolio
            response = await fetch(`${API_BASE_URL}/portfolios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolioData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message || '포트폴리오가 성공적으로 저장되었습니다.', 'success');
            closeModal();
            loadPortfolios();
        } else {
            throw new Error(result.error || 'Failed to save portfolio');
        }
        
    } catch (error) {
        console.error('Error saving portfolio:', error);
        showMessage('포트폴리오 저장 실패: ' + error.message, 'error');
    }
}

// Toggle portfolio status
async function togglePortfolioStatus(id) {
    const portfolio = portfolios.find(p => p.id === id);
    if (!portfolio) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: !portfolio.is_active })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`포트폴리오가 ${!portfolio.is_active ? '활성화' : '비활성화'}되었습니다.`, 'success');
            loadPortfolios();
        } else {
            throw new Error(result.error || 'Failed to toggle portfolio status');
        }
        
    } catch (error) {
        console.error('Error toggling portfolio status:', error);
        showMessage('상태 변경 실패: ' + error.message, 'error');
    }
}

// Toggle featured status
async function toggleFeaturedStatus(id) {
    const portfolio = portfolios.find(p => p.id === id);
    if (!portfolio) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_featured: !portfolio.is_featured })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`포트폴리오가 ${!portfolio.is_featured ? '피처드로 설정' : '피처드 해제'}되었습니다.`, 'success');
            loadPortfolios();
        } else {
            throw new Error(result.error || 'Failed to toggle featured status');
        }
        
    } catch (error) {
        console.error('Error toggling featured status:', error);
        showMessage('피처드 상태 변경 실패: ' + error.message, 'error');
    }
}

// Delete portfolio
async function deletePortfolio(id) {
    if (!confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message || '포트폴리오가 성공적으로 삭제되었습니다.', 'success');
            loadPortfolios();
        } else {
            throw new Error(result.error || 'Failed to delete portfolio');
        }
        
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        showMessage('포트폴리오 삭제 실패: ' + error.message, 'error');
    }
}

// Show message
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Debounce function
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

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('portfolioModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
