/**
 * Auth Guard - Route Protection Module
 * Location: src/auth/authGuard.js
 * 
 * Enforces role-based access control at the route level
 * - Protects admin routes (admin only)
 * - Protects customer routes (authenticated users) - configurable
 * - Redirects unauthenticated users to login
 * 
 * Usage:
 *   // For admin pages: enforce admin-only access
 *   authGuard.init(null, { requireAuth: true, requireAdmin: true });
 *   
 *   // For customer pages: enforce authentication (optional)
 *   authGuard.init(null, { requireAuth: true, requireAdmin: false });
 *   
 *   // For public pages: just track auth state
 *   authGuard.init(callback);
 */

import { observeAuth, getIdTokenResult } from '../services/firebaseConfig.js';
import { auth } from '../services/firebaseConfig.js';

class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.isLoading = true;
        this.unsubscribe = null;
        this.onAuthChange = null;
        this.options = {
            requireAuth: false,
            requireAdmin: false,
            loginPage: 'pages/login.html',
            adminPage: 'admin.html',
            customerPage: 'index.html',
            publicPages: ['index.html', 'boxedAboutUs.html', 'boxedContacts.html', 'boxedCart.html']
        };
    }

    /**
     * Initialize auth state observer
     * @param {Function} callback - Called when auth state changes
     * @param {Object} options - Configuration options
     * @param {boolean} options.requireAuth - Require authentication on this page
     * @param {boolean} options.requireAdmin - Require admin role on this page
     * @param {string} options.loginPage - Path to login page
     * @param {string} options.adminPage - Path to admin page
     * @param {string} options.customerPage - Path to customer home page
     */
    init(callback = null, options = {}) {
        this.onAuthChange = callback;
        this.options = { ...this.options, ...options };
        
        this.unsubscribe = observeAuth((authData) => {
            this.isLoading = false;
            
            if (authData) {
                this.currentUser = authData.user;
                this.isAdmin = authData.isAdmin;
            } else {
                this.currentUser = null;
                this.isAdmin = false;
            }
            
            if (callback) {
                callback({
                    user: this.currentUser,
                    isAdmin: this.isAdmin,
                    isAuthenticated: this.isAuthenticated()
                });
            }
            
            // Auto-redirect based on current page
            this.enforceRouteProtection();
        });
        
        return this;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdminUser() {
        return this.isAdmin === true;
    }

    /**
     * Get current user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if currently on login page
     * @returns {boolean}
     */
    isLoginPage() {
        return window.location.pathname.includes('login.html');
    }

    /**
     * Check if currently on admin page
     * @returns {boolean}
     */
    isAdminPage() {
        return window.location.pathname.includes('admin.html');
    }

    /**
     * Check if currently on a public page (no auth required)
     * @returns {boolean}
     */
    isPublicPage() {
        const path = window.location.pathname;
        return this.options.publicPages.some(page => path.includes(page)) || 
               path === '/' || 
               path.endsWith('/');
    }

    /**
     * Get proper path based on current directory
     */
    getPath(path) {
        const isInPagesDir = window.location.pathname.includes('/pages/');
        if (isInPagesDir && !path.startsWith('../')) {
            return '../' + path;
        }
        return path;
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        // Preserve current URL for post-login redirect
        const currentUrl = window.location.href;
        if (!this.isLoginPage()) {
            sessionStorage.setItem('postLoginRedirect', currentUrl);
        }
        window.location.href = this.getPath(this.options.loginPage);
    }

    /**
     * Redirect to appropriate page based on role
     */
    redirectBasedOnRole() {
        if (this.isAdmin) {
            window.location.href = this.getPath(this.options.adminPage);
        } else {
            window.location.href = this.getPath(this.options.customerPage);
        }
    }

    /**
     * Enforce route protection rules
     * Call this after auth state is determined
     */
    enforceRouteProtection() {
        const path = window.location.pathname;
        
        // If on login page and already authenticated, redirect away
        if (this.isLoginPage() && this.isAuthenticated()) {
            const redirectUrl = sessionStorage.getItem('postLoginRedirect');
            sessionStorage.removeItem('postLoginRedirect');
            const targetPage = this.isAdmin ? this.options.adminPage : this.options.customerPage;
            window.location.href = redirectUrl || this.getPath(targetPage);
            return;
        }

        // If on admin page and not admin, redirect
        if (this.isAdminPage() && !this.isAdminUser()) {
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
            } else {
                // User is authenticated but not admin
                window.location.href = this.getPath(this.options.customerPage);
            }
            return;
        }

        // If this page requires authentication and user is not authenticated
        if (this.options.requireAuth && !this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        // If this page requires admin and user is not admin
        if (this.options.requireAdmin && !this.isAdminUser()) {
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
            } else {
                window.location.href = this.getPath(this.options.customerPage);
            }
            return;
        }
    }

    /**
     * Require authentication (returns promise that resolves when auth state is known)
     * @param {Object} options
     * @param {boolean} options.requireAdmin - Also require admin role
     * @param {number} options.timeout - Timeout in ms (default: 5000)
     * @returns {Promise<{authenticated: boolean, isAdmin: boolean, user: Object|null}>}
     */
    async requireAuth(options = {}) {
        const { requireAdmin = false, timeout = 5000 } = options;
        
        return new Promise((resolve) => {
            // If already loaded, resolve immediately
            if (!this.isLoading) {
                const authenticated = this.isAuthenticated();
                const isAdmin = this.isAdminUser();
                
                if (requireAdmin && !isAdmin) {
                    resolve({ authenticated: false, isAdmin: false, user: null });
                    return;
                }
                
                resolve({
                    authenticated: authenticated,
                    isAdmin: isAdmin,
                    user: this.currentUser
                });
                return;
            }
            
            // Wait for auth state
            let resolved = false;
            
            const checkInterval = setInterval(() => {
                if (!this.isLoading) {
                    resolved = true;
                    clearInterval(checkInterval);
                    clearTimeout(timeoutId);
                    
                    const authenticated = this.isAuthenticated();
                    const isAdmin = this.isAdminUser();
                    
                    if (requireAdmin && !isAdmin) {
                        resolve({ authenticated: false, isAdmin: false, user: null });
                        return;
                    }
                    
                    resolve({
                        authenticated: authenticated,
                        isAdmin: isAdmin,
                        user: this.currentUser
                    });
                }
            }, 100);
            
            const timeoutId = setTimeout(() => {
                if (!resolved) {
                    clearInterval(checkInterval);
                    resolve({ authenticated: false, isAdmin: false, user: null });
                }
            }, timeout);
        });
    }

    /**
     * Check if user can access a specific resource
     * @param {string} resourceType - 'product', 'order', 'user'
     * @param {string} resourceOwnerId - ID of the resource owner
     * @returns {boolean}
     */
    canAccess(resourceType, resourceOwnerId = null) {
        // Admins can access everything
        if (this.isAdminUser()) return true;
        
        // Unauthenticated users can only read public products
        if (!this.isAuthenticated()) {
            return resourceType === 'product' && resourceOwnerId === null;
        }
        
        // For user-specific resources, check ownership
        if (resourceOwnerId) {
            return this.currentUser && this.currentUser.uid === resourceOwnerId;
        }
        
        return false;
    }

    /**
     * Get auth token for API requests
     * @param {boolean} forceRefresh - Force token refresh
     * @returns {Promise<string|null>} JWT token or null
     */
    async getToken(forceRefresh = false) {
        if (!this.currentUser) return null;
        try {
            const tokenResult = await getIdTokenResult(this.currentUser, forceRefresh);
            return tokenResult?.token || null;
        } catch (error) {
            console.error('[AuthGuard] Token retrieval failed:', error);
            return null;
        }
    }

    /**
     * Refresh user claims (useful after admin claim is set)
     * @returns {Promise<boolean>}
     */
    async refreshClaims() {
        if (!this.currentUser) return false;
        try {
            const tokenResult = await getIdTokenResult(this.currentUser, true);
            this.isAdmin = tokenResult?.isAdmin || false;
            return true;
        } catch (error) {
            console.error('[AuthGuard] Claims refresh failed:', error);
            return false;
        }
    }

    /**
     * Clean up observer
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}

// Create singleton instance
const authGuard = new AuthGuard();

// Auto-initialize on page load (for pages without explicit init)
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-init if not explicitly initialized
    if (!authGuard.unsubscribe) {
        authGuard.init();
    }
});

export { AuthGuard, authGuard };
export default authGuard;
