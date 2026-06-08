/**
 * Rate Limiting Utility
 * Location: src/utils/rateLimiter.js
 * 
 * Provides client-side rate limiting for authentication operations
 * to prevent brute force attacks and abuse.
 */

/**
 * Rate limiter configuration
 */
const DEFAULT_CONFIG = {
    // Auth operations
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },      // 5 attempts per 15 minutes
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },     // 3 attempts per hour
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    
    // General API operations
    api: { maxAttempts: 100, windowMs: 60 * 1000 },           // 100 requests per minute
    
    // Storage operations
    upload: { maxAttempts: 10, windowMs: 60 * 1000 },         // 10 uploads per minute
    
    // Storage keys
    storageKey: 'rateLimiter_data'
};

/**
 * RateLimiter class for tracking and enforcing rate limits
 */
export class RateLimiter {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.attempts = this.loadAttempts();
    }
    
    /**
     * Load attempts from localStorage
     * @returns {Object}
     */
    loadAttempts() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                // Clean up expired entries
                return this.cleanExpired(data);
            }
        } catch (error) {
            console.warn('[RateLimiter] Failed to load attempts:', error);
        }
        return {};
    }
    
    /**
     * Save attempts to localStorage
     */
    saveAttempts() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.attempts));
        } catch (error) {
            console.warn('[RateLimiter] Failed to save attempts:', error);
        }
    }
    
    /**
     * Clean expired attempt entries
     * @param {Object} data 
     * @returns {Object}
     */
    cleanExpired(data) {
        const now = Date.now();
        const cleaned = {};
        
        for (const [key, attempts] of Object.entries(data)) {
            // Keep non-expired attempts
            const validAttempts = attempts.filter(timestamp => {
                const action = key.split(':')[0];
                const config = this.config[action] || this.config.api;
                return now - timestamp < config.windowMs;
            });
            
            if (validAttempts.length > 0) {
                cleaned[key] = validAttempts;
            }
        }
        
        return cleaned;
    }
    
    /**
     * Get the storage key for an action and identifier
     * @param {string} action 
     * @param {string} identifier 
     * @returns {string}
     */
    getKey(action, identifier) {
        return `${action}:${identifier}`;
    }
    
    /**
     * Check if an action is allowed
     * @param {string} action - Action type (login, signup, api, etc.)
     * @param {string} identifier - Unique identifier (email, IP, etc.)
     * @returns {Object} Result with allowed boolean and remaining info
     */
    checkLimit(action, identifier) {
        const config = this.config[action] || this.config.api;
        const key = this.getKey(action, identifier);
        const now = Date.now();
        
        // Get attempts for this key
        const attempts = this.attempts[key] || [];
        
        // Filter to only include attempts within the window
        const windowStart = now - config.windowMs;
        const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
        
        // Calculate remaining
        const remaining = Math.max(0, config.maxAttempts - recentAttempts.length);
        const allowed = remaining > 0;
        
        // Calculate reset time
        const oldestAttempt = recentAttempts[0];
        const resetTime = oldestAttempt ? oldestAttempt + config.windowMs : now;
        
        return {
            allowed,
            remaining,
            total: config.maxAttempts,
            resetTime: new Date(resetTime),
            resetInMs: Math.max(0, resetTime - now)
        };
    }
    
    /**
     * Record an attempt
     * @param {string} action 
     * @param {string} identifier 
     */
    recordAttempt(action, identifier) {
        const key = this.getKey(action, identifier);
        const now = Date.now();
        
        if (!this.attempts[key]) {
            this.attempts[key] = [];
        }
        
        this.attempts[key].push(now);
        this.saveAttempts();
    }
    
    /**
     * Clear attempts for an action/identifier
     * @param {string} action 
     * @param {string} identifier 
     */
    clearAttempts(action, identifier) {
        const key = this.getKey(action, identifier);
        delete this.attempts[key];
        this.saveAttempts();
    }
    
    /**
     * Clear all attempts (e.g., on logout)
     */
    clearAll() {
        this.attempts = {};
        this.saveAttempts();
    }
    
    /**
     * Check and record if allowed
     * @param {string} action 
     * @param {string} identifier 
     * @returns {Object} Result with allowed boolean
     */
    checkAndRecord(action, identifier) {
        const result = this.checkLimit(action, identifier);
        
        if (result.allowed) {
            this.recordAttempt(action, identifier);
        }
        
        return result;
    }
    
    /**
     * Format remaining time for display
     * @param {number} ms 
     * @returns {string}
     */
    formatRemainingTime(ms) {
        const minutes = Math.ceil(ms / (60 * 1000));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 
                ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
                : `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    /**
     * Get human-readable rate limit message
     * @param {string} action 
     * @param {Object} limitResult 
     * @returns {string}
     */
    getRateLimitMessage(action, limitResult) {
        const actionNames = {
            login: 'login attempts',
            signup: 'sign up attempts',
            passwordReset: 'password reset attempts',
            api: 'API requests',
            upload: 'uploads'
        };
        
        const actionName = actionNames[action] || 'requests';
        const timeStr = this.formatRemainingTime(limitResult.resetInMs);
        
        return `Too many ${actionName}. Please try again in ${timeStr}.`;
    }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * Check login rate limit
 * @param {string} email 
 * @returns {Object}
 */
export function checkLoginLimit(email) {
    const sanitizedEmail = email.toLowerCase().trim();
    return rateLimiter.checkAndRecord('login', sanitizedEmail);
}

/**
 * Check signup rate limit
 * @param {string} email 
 * @returns {Object}
 */
export function checkSignupLimit(email) {
    const sanitizedEmail = email.toLowerCase().trim();
    return rateLimiter.checkAndRecord('signup', sanitizedEmail);
}

/**
 * Check password reset rate limit
 * @param {string} email 
 * @returns {Object}
 */
export function checkPasswordResetLimit(email) {
    const sanitizedEmail = email.toLowerCase().trim();
    return rateLimiter.checkAndRecord('passwordReset', sanitizedEmail);
}

/**
 * Clear login attempts (e.g., on successful login)
 * @param {string} email 
 */
export function clearLoginAttempts(email) {
    const sanitizedEmail = email.toLowerCase().trim();
    rateLimiter.clearAttempts('login', sanitizedEmail);
}

/**
 * Wrap async function with rate limiting
 * @param {Function} fn - Function to wrap
 * @param {string} action - Rate limit action type
 * @param {Function} getIdentifier - Function to get identifier from arguments
 * @returns {Function}
 */
export function withRateLimit(fn, action, getIdentifier) {
    return async function(...args) {
        const identifier = getIdentifier(...args);
        const limitCheck = rateLimiter.checkAndRecord(action, identifier);
        
        if (!limitCheck.allowed) {
            const error = new Error(rateLimiter.getRateLimitMessage(action, limitCheck));
            error.code = 'rate-limit-exceeded';
            error.limitResult = limitCheck;
            throw error;
        }
        
        try {
            const result = await fn.apply(this, args);
            return result;
        } catch (error) {
            // Don't count failed attempts for certain error types
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                // Already recorded, no need to revert
            }
            throw error;
        }
    };
}

// ========== EXPORTS ==========

export { rateLimiter };
export default rateLimiter;
