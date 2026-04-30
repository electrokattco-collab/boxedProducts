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
                    <button class="auth-btn logout-btn" onclick="customerAuth.logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            `;
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

    /**
     * Add auth-aware CSS styles
     * Call this once to inject styles
     */
    injectStyles() {
        if (document.getElementById('customer-auth-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'customer-auth-styles';
        styles.textContent = `
            .user-menu {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .user-email {
                font-size: 0.875rem;
                color: #f0f3fa;
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .admin-badge {
                background: #22c55e;
                color: white;
                font-size: 0.625rem;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 999px;
                text-transform: uppercase;
            }
            
            .auth-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                border-radius: 999px;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.25s ease;
                cursor: pointer;
                border: none;
                font-size: 0.875rem;
            }
            
            .login-btn {
                background: rgba(255, 140, 60, 0.25);
                color: #fff;
            }
            
            .login-btn:hover {
                background: rgba(255, 140, 60, 0.4);
            }
            
            .logout-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #f0f3fa;
            }
            
            .logout-btn:hover {
                background: rgba(239, 68, 68, 0.3);
                color: #fff;
            }
            
            .admin-link {
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
                padding: 10px 14px;
            }
            
            .admin-link:hover {
                background: rgba(34, 197, 94, 0.35);
                color: #86efac;
            }
            
            @media (max-width: 768px) {
                .user-email {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create singleton instance
const customerAuth = new CustomerAuth();

// Auto-inject styles
customerAuth.injectStyles();

export { CustomerAuth, customerAuth };
export default customerAuth;
