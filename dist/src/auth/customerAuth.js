/**
 * Customer Authentication Module
 * Location: src/auth/customerAuth.js
 * 
 * Provides authentication state management for customer-facing pages
 * - Shows login/logout button based on auth state
 * - Displays user info when authenticated
 * - Handles session persistence
 */

import { authGuard } from './authGuard.js';
import { signOutUser } from './login.js';

class CustomerAuth {
    constructor() {
        this.user = null;
        this.isAdmin = false;
        this.isInitialized = false;
    }

    /**
     * Initialize customer auth on a page
     * @param {Object} options - Configuration options
     * @param {boolean} options.showAuthButton - Whether to show login/logout button
     * @param {string} options.buttonContainerId - ID of container for auth button
     * @param {Function} options.onAuthChange - Callback when auth state changes
     */
    init(options = {}) {
        const defaults = {
            showAuthButton: true,
            buttonContainerId: 'authButtonContainer',
            onAuthChange: null
        };
        
        const config = { ...defaults, ...options };
        
        authGuard.init((authData) => {
            this.isInitialized = true;
            
            if (authData && authData.user) {
                this.user = authData.user;
                this.isAdmin = authData.isAdmin;
                this.updateUI(config, true);
            } else {
                this.user = null;
                this.isAdmin = false;
                this.updateUI(config, false);
            }
            
            // Call custom callback if provided
            if (config.onAuthChange) {
                config.onAuthChange(authData);
            }
        });
        
        return this;
    }

    /**
     * Update UI based on authentication state
     */
    updateUI(config, isAuthenticated) {
        if (!config.showAuthButton) return;
        
        const container = document.getElementById(config.buttonContainerId);
        if (!container) return;
        
        if (isAuthenticated) {
            // Build admin dashboard link if user is admin
            const adminLink = this.isAdmin 
                ? `<a href="admin.html" class="auth-btn admin-link" title="Go to Admin Dashboard">
                      <i class="fas fa-cog"></i>
                   </a>` 
                : '';
            
            container.innerHTML = `
                <div class="user-menu">
                    <span class="user-email">${this.escapeHtml(this.user.email)}</span>
                    ${this.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                    ${adminLink}
                    <button class="auth-btn logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `;
            
            // Attach event listener to logout button
            const logoutBtn = container.querySelector('#logoutBtn');
            if (logoutBtn) {
                // Remove any inline onclick (defensive against cached old code)
                logoutBtn.removeAttribute('onclick');
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.logout();
                });
            }
        } else {
            container.innerHTML = `
                <a href="pages/login.html" class="auth-btn login-btn">
                    <i class="fas fa-user"></i> Login
                </a>
            `;
        }
    }

    /**
     * Handle logout
     */
    async logout() {
        const result = await signOutUser();
        if (result.success) {
            window.location.reload();
        } else {
            console.error('[CustomerAuth] Logout failed:', result.error);
        }
    }

    /**
     * Get current user
     * @returns {Object|null}
     */
    getUser() {
        return this.user;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.user !== null;
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdminUser() {
        return this.isAdmin;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

}

// Create singleton instance
const customerAuth = new CustomerAuth();

// Expose to window for inline onclick handlers
if (typeof window !== 'undefined') {
    window.customerAuth = customerAuth;
}

export { CustomerAuth, customerAuth };
export default customerAuth;
