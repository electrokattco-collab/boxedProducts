/**
 * Comprehensive Sanitization Utilities
 * Location: src/utils/sanitization.js
 * 
 * Provides XSS protection and input sanitization for all user-generated content.
 * This is the central location for all sanitization logic.
 */

// ========== HTML SANITIZATION ==========

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - User input text
 * @returns {string} Escaped HTML-safe string
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    return text.replace(/[&<>"'`=/]/g, char => htmlEscapes[char]);
}

/**
 * Alternative: Use DOM-based escaping (slower but more thorough)
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtmlDom(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize HTML by removing all tags (for plain text display)
 * @param {string} html 
 * @returns {string}
 */
export function stripHtml(html) {
    if (typeof html !== 'string') return '';
    
    // Create a temporary element
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Get text content (this removes all HTML)
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Sanitize HTML by allowing only specific safe tags
 * @param {string} html 
 * @param {string[]} allowedTags - Array of allowed tag names
 * @returns {string}
 */
export function sanitizeHtml(html, allowedTags = []) {
    if (typeof html !== 'string') return '';
    
    if (allowedTags.length === 0) {
        return stripHtml(html);
    }
    
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Remove all scripts and event handlers
    const scripts = tmp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Process all elements
    const allElements = tmp.querySelectorAll('*');
    allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        
        // Remove if not allowed
        if (!allowedTags.includes(tagName)) {
            const text = document.createTextNode(el.textContent);
            el.parentNode.replaceChild(text, el);
            return;
        }
        
        // Remove event handlers and dangerous attributes
        const attributes = Array.from(el.attributes);
        attributes.forEach(attr => {
            const attrName = attr.name.toLowerCase();
            
            // Remove event handlers (onclick, onerror, etc.)
            if (attrName.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
            
            // Remove javascript: URLs
            if (attrName === 'href' || attrName === 'src') {
                const value = attr.value.toLowerCase().trim();
                if (value.startsWith('javascript:') || value.startsWith('data:')) {
                    el.removeAttribute(attr.name);
                }
            }
        });
    });
    
    return tmp.innerHTML;
}

// ========== URL SANITIZATION ==========

/**
 * Sanitize URL to prevent javascript: protocol injection
 * @param {string} url 
 * @returns {string} Safe URL or empty string
 */
export function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    
    const trimmed = url.trim();
    
    // Block dangerous protocols
    const dangerousProtocols = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        'about:',
        'blob:'
    ];
    
    const lowerUrl = trimmed.toLowerCase();
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            console.warn('[Sanitize] Blocked dangerous URL protocol:', protocol);
            return '';
        }
    }
    
    // Allow relative URLs and safe protocols
    return trimmed;
}

/**
 * Sanitize URL for use in href/src attributes
 * @param {string} url 
 * @returns {string}
 */
export function sanitizeHref(url) {
    const sanitized = sanitizeUrl(url);
    
    // If empty, return # to prevent broken links
    if (!sanitized) return '#';
    
    return sanitized;
}

// ========== STRING SANITIZATION ==========

/**
 * Sanitize string by removing control characters and trimming
 * @param {string} str 
 * @param {number} maxLength 
 * @returns {string}
 */
export function sanitizeString(str, maxLength = 10000) {
    if (typeof str !== 'string') return '';
    
    return str
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // Remove control characters
        .trim()
        .substring(0, maxLength);
}

/**
 * Sanitize email address
 * @param {string} email 
 * @returns {string}
 */
export function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    
    return email
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9._%+-@]/g, '');  // Remove invalid characters
}

/**
 * Sanitize ID (alphanumeric, hyphens, underscores only)
 * @param {string} id 
 * @returns {string}
 */
export function sanitizeId(id) {
    if (typeof id !== 'string') return '';
    
    return id.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 100);
}

/**
 * Sanitize filename
 * @param {string} filename 
 * @returns {string}
 */
export function sanitizeFilename(filename) {
    if (typeof filename !== 'string') return '';
    
    return filename
        .replace(/[\\/:*?"<>|]/g, '_')  // Replace invalid filename characters
        .replace(/\.{2,}/g, '.')          // Prevent path traversal
        .trim()
        .substring(0, 255);
}

// ========== PRODUCT DATA SANITIZATION ==========

/**
 * Sanitize product data before display
 * @param {Object} product 
 * @returns {Object}
 */
export function sanitizeProduct(product) {
    if (!product || typeof product !== 'object') {
        return {};
    }
    
    const sanitized = {
        ...product,
        id: sanitizeId(product.id),
        name: escapeHtml(sanitizeString(product.name, 200)),
        description: escapeHtml(sanitizeString(product.description, 2000)),
        category: sanitizeString(product.category, 50),
        tag: escapeHtml(sanitizeString(product.tag, 50)),
        price: typeof product.price === 'number' ? product.price : 0,
        stockQuantity: typeof product.stockQuantity === 'number' ? product.stockQuantity : 0
    };
    
    // Sanitize images array
    if (Array.isArray(product.images)) {
        sanitized.images = product.images
            .map(img => sanitizeUrl(img))
            .filter(img => img !== '');
    } else {
        sanitized.images = [];
    }
    
    // Sanitize attributes object
    if (product.attributes && typeof product.attributes === 'object') {
        sanitized.attributes = {};
        for (const [key, value] of Object.entries(product.attributes)) {
            const sanitizedKey = sanitizeString(key, 50);
            
            if (typeof value === 'string') {
                sanitized.attributes[sanitizedKey] = escapeHtml(sanitizeString(value, 500));
            } else if (Array.isArray(value)) {
                sanitized.attributes[sanitizedKey] = value
                    .map(v => typeof v === 'string' ? escapeHtml(sanitizeString(v, 100)) : v)
                    .slice(0, 100);  // Limit array size
            } else {
                sanitized.attributes[sanitizedKey] = value;
            }
        }
    }
    
    return sanitized;
}

/**
 * Sanitize user profile data
 * @param {Object} profile 
 * @returns {Object}
 */
export function sanitizeUserProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        return {};
    }
    
    return {
        uid: sanitizeId(profile.uid),
        email: sanitizeEmail(profile.email),
        displayName: escapeHtml(sanitizeString(profile.displayName, 100)),
        photoURL: sanitizeUrl(profile.photoURL),
        phoneNumber: sanitizeString(profile.phoneNumber, 20)
    };
}

// ========== FORM INPUT SANITIZATION ==========

/**
 * Sanitize form input based on expected type
 * @param {*} value 
 * @param {string} type - 'string', 'number', 'email', 'url', 'html'
 * @returns {*}
 */
export function sanitizeInput(value, type = 'string') {
    switch (type) {
        case 'string':
            return sanitizeString(value);
            
        case 'number':
            const num = Number(value);
            return isNaN(num) ? 0 : num;
            
        case 'email':
            return sanitizeEmail(value);
            
        case 'url':
            return sanitizeUrl(value);
            
        case 'html':
            return sanitizeHtml(value);
            
        case 'id':
            return sanitizeId(value);
            
        default:
            return sanitizeString(value);
    }
}

// ========== CSS SANITIZATION ==========

/**
 * Sanitize CSS value to prevent injection
 * @param {string} value 
 * @returns {string}
 */
export function sanitizeCssValue(value) {
    if (typeof value !== 'string') return '';
    
    // Remove CSS expression and other dangerous values
    const dangerous = [
        'expression',
        'javascript:',
        'vbscript:',
        '@import',
        '@media',
        'behavior:',
        'binding:'
    ];
    
    const lowerValue = value.toLowerCase();
    for (const pattern of dangerous) {
        if (lowerValue.includes(pattern)) {
            console.warn('[Sanitize] Blocked dangerous CSS:', pattern);
            return '';
        }
    }
    
    return value;
}

// ========== SAFE DOM CREATION ==========

/**
 * Create a safe text node
 * @param {string} text 
 * @returns {Text}
 */
export function createSafeText(text) {
    return document.createTextNode(sanitizeString(text));
}

/**
 * Create a safe element with sanitized content
 * @param {string} tag 
 * @param {Object} options 
 * @returns {HTMLElement}
 */
export function createSafeElement(tag, options = {}) {
    const { 
        text = '', 
        html = '', 
        className = '', 
        attributes = {},
        safeHtml = false 
    } = options;
    
    const element = document.createElement(tag);
    
    // Add classes safely
    if (className) {
        element.className = sanitizeString(className, 500);
    }
    
    // Add attributes safely
    for (const [key, value] of Object.entries(attributes)) {
        const sanitizedKey = sanitizeString(key, 100);
        
        // Skip event handlers
        if (sanitizedKey.toLowerCase().startsWith('on')) {
            continue;
        }
        
        // Sanitize URL attributes
        if (sanitizedKey === 'href' || sanitizedKey === 'src') {
            element.setAttribute(sanitizedKey, sanitizeHref(value));
        } else {
            element.setAttribute(sanitizedKey, sanitizeString(value, 5000));
        }
    }
    
    // Add content
    if (text) {
        element.textContent = sanitizeString(text);
    } else if (html && safeHtml) {
        element.innerHTML = sanitizeHtml(html, ['b', 'i', 'em', 'strong', 'a', 'br']);
    }
    
    return element;
}

// ========== EXPORT ALL ==========

export default {
    escapeHtml,
    escapeHtmlDom,
    stripHtml,
    sanitizeHtml,
    sanitizeUrl,
    sanitizeHref,
    sanitizeString,
    sanitizeEmail,
    sanitizeId,
    sanitizeFilename,
    sanitizeProduct,
    sanitizeUserProfile,
    sanitizeInput,
    sanitizeCssValue,
    createSafeText,
    createSafeElement
};
