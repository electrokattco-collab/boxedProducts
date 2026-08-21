// sanitize.js - XSS protection utilities

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - User input text
 * @returns {string} Escaped HTML-safe string
 */
export function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize product data before rendering
 * @param {Object} product - Product from Firestore
 * @returns {Object} Sanitized product
 */
export function sanitizeProduct(product) {
    return {
        ...product,
        id: escapeHtml(product.id),
        name: escapeHtml(product.name),
        description: escapeHtml(product.description),
        category: escapeHtml(product.category),
        tag: escapeHtml(product.tag),
        // Don't escape URLs, just validate they're strings
        images: Array.isArray(product.images) ? product.images : []
    };
}

/**
 * Create DOM element safely (alternative to innerHTML)
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string} text - Text content
 * @returns {HTMLElement}
 */
export function createSafeElement(tag, attrs = {}, text = '') {
    const el = document.createElement(tag);
    
    // Set attributes safely
    Object.keys(attrs).forEach(key => {
        if (key === 'textContent' || key === 'innerText') {
            el.textContent = attrs[key];
        } else {
            el.setAttribute(key, attrs[key]);
        }
    });
    
    if (text) {
        el.textContent = text;
    }
    
    return el;
}
