// productRenderer.js
// Storefront Product Renderer - Fetches from Firebase Firestore with Real-Time Sync
// Uses onSnapshot for live updates from admin panel
// Maintains Data-Driven Architecture - renders any product type dynamically
// XSS-SAFE: All user-generated content is escaped before rendering

import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    getDocs,
    getDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebaseConfig.js';

/**
 * ProductRenderer - Handles all storefront product rendering with live Firebase sync
 * Dynamically renders products based on their category attributes from schema.json
 */
class ProductRenderer {
    constructor() {
        this.db = db;
        this.productsCollection = collection(this.db, 'products');
        this.unsubscribe = null;
        this.currentProducts = [];
        this.schema = null;
        
        // Callbacks for UI updates
        this.onProductsUpdated = null;
        this.onLoading = null;
        this.onError = null;
    }

    /**
     * Initialize the renderer and load schema
     */
    async initialize() {
        try {
            await this.loadSchema();
            console.log('[ProductRenderer] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[ProductRenderer] Initialization failed:', error);
            return false;
        }
    }

    /**
     * Load category schema for dynamic rendering
     */
    async loadSchema() {
        try {
            const response = await fetch('data/schema.json');
            const schemaData = await response.json();
            this.schema = schemaData.categoryFieldMap;
        } catch (error) {
            console.warn('[ProductRenderer] Could not load schema, using defaults');
            this.schema = {};
        }
    }

    // ==================== REAL-TIME SYNC ====================

    /**
     * Subscribe to real-time product updates for the storefront
     * Uses onSnapshot from Firebase SDK for instant updates
     * Only fetches visible products (isVisible: true)
     * @param {function} onUpdate - Callback when products change
     * @param {function} onError - Callback for errors
     * @returns {function} Unsubscribe function
     */
    subscribeToStorefront(onUpdate, onError = null) {
        if (this.onProductsUpdated) {
            this.unsubscribeFromStorefront();
        }

        this.onProductsUpdated = onUpdate;
        this.onError = onError;

        // Query: Only visible products, ordered by last updated
        const q = query(
            this.productsCollection,
            where('isVisible', '==', true),
            orderBy('lastUpdated', 'desc')
        );

        console.log('[ProductRenderer] Subscribing to real-time product updates via onSnapshot...');

        // Use onSnapshot for real-time updates
        this.unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const products = [];
                snapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                
                this.currentProducts = products;
                console.log(`[ProductRenderer] Received ${products.length} products in real-time via onSnapshot`);
                
                if (this.onProductsUpdated) {
                    this.onProductsUpdated(products);
                }
            },
            (error) => {
                console.error('[ProductRenderer] onSnapshot error:', error);
                if (this.onError) {
                    this.onError(error.message);
                }
            }
        );

        return this.unsubscribe;
    }

    /**
     * Subscribe to products filtered by category
     */
    subscribeByCategory(category, onUpdate, onError = null) {
        this.unsubscribeFromStorefront();
        this.onProductsUpdated = onUpdate;
        this.onError = onError;

        const q = query(
            this.productsCollection,
            where('isVisible', '==', true),
            where('category', '==', category),
            orderBy('lastUpdated', 'desc')
        );

        this.unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const products = [];
                snapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                
                this.currentProducts = products;
                
                if (this.onProductsUpdated) {
                    this.onProductsUpdated(products);
                }
            },
            (error) => {
                console.error('[ProductRenderer] Category onSnapshot error:', error);
                if (this.onError) {
                    this.onError(error.message);
                }
            }
        );

        return this.unsubscribe;
    }

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribeFromStorefront() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
            console.log('[ProductRenderer] Unsubscribed from onSnapshot updates');
        }
    }

    // ==================== XSS PROTECTION ====================
    
    /**
     * Escape HTML to prevent XSS attacks
     * @private
     * @param {string} str - String to escape
     * @returns {string} Escaped HTML-safe string
     */
    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==================== DYNAMIC RENDERING ====================

    /**
     * Generate HTML for a product card - matches static site exactly
     * Shows: product name, price, image (NO quantity display)
     * XSS-SAFE: All dynamic content is escaped
     */
    renderProductCard(product) {
        const price = parseFloat(product.price).toFixed(2);
        const image = product.images?.[0] || 'assets/placeholder.jpg';
        
        // Escape all user-generated content to prevent XSS
        const safeId = this._escapeHtml(product.id);
        const safeName = this._escapeHtml(product.name);
        const safeTag = this._escapeHtml(product.tag || 'New');
        const safeImage = this._escapeHtml(image);
        
        // Match exact static site structure with escaped values
        return `
            <article class="product-card" data-product-id="${safeId}">
                <div class="product-top">
                    <span class="product-badge">${safeTag}</span>
                    <button class="quick-view-btn" type="button" aria-label="Quick view ${safeName}">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
                <img src="${safeImage}" alt="${safeName}" onerror="this.src='assets/placeholder.jpg'">
                <h3>${safeName}</h3>
                <div class="product-meta">
                    <div class="product-price">R ${price}</div>
                </div>
                <div class="delivery"><i class="fas fa-truck"></i> Free delivery nationwide</div>
                <button class="add-btn" type="button" 
                        data-id="${safeId}" 
                        data-name="${safeName}" 
                        data-price="${price}"
                        data-image="${safeImage}"
                        ${product.inventoryStatus === 'outOfStock' ? 'disabled' : ''}>
                    ${product.inventoryStatus === 'outOfStock' ? 'Out of Stock' : 'Add to bag'}
                </button>
            </article>
        `;
    }

    /**
     * Render a grid of products into the container
     * Uses #product-grid selector and adds product-grid class for styling
     */
    renderProductGrid(products, containerSelector = '#product-grid') {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`[ProductRenderer] Container not found: ${containerSelector}`);
            return;
        }

        // Add product-grid class for CSS styling
        container.classList.add('product-grid');

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No products available</h3>
                    <p>Check back later for new arrivals!</p>
                </div>
            `;
            return;
        }

        // Render product cards directly into container
        container.innerHTML = products.map(product => this.renderProductCard(product)).join('');

        // Attach event listeners to the rendered products
        this.attachProductEventListeners(container);
    }

    /**
     * Attach event listeners to rendered product cards
     */
    attachProductEventListeners(container) {
        // Quick view buttons
        container.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                const productId = card.dataset.productId;
                this.openQuickView(productId);
            });
        });

        // Add to cart buttons
        container.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const name = e.target.dataset.name;
                const price = parseFloat(e.target.dataset.price);
                const image = e.target.dataset.image;
                this.addToCart(productId, name, price, image);
            });
        });
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get current products (from cache)
     */
    getCurrentProducts() {
        return this.currentProducts;
    }

    /**
     * Filter products by search term
     */
    filterProducts(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.currentProducts.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.description?.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    }

    /**
     * Get products by category
     */
    getProductsByCategory(category) {
        return this.currentProducts.filter(p => p.category === category);
    }

    // Placeholder methods for cart/quick view (implement based on your needs)
    openQuickView(productId) {
        console.log('[ProductRenderer] Quick view:', productId);
        window.dispatchEvent(new CustomEvent('quickview', { detail: { productId } }));
    }

    addToCart(productId, name, price, image) {
        console.log('[ProductRenderer] Add to cart:', { productId, name, price, image });
        window.dispatchEvent(new CustomEvent('addtocart', { 
            detail: { productId, name, price, image } 
        }));
    }
}

// Create global instance
const productRenderer = new ProductRenderer();

// Export for module usage
export { ProductRenderer, productRenderer };
