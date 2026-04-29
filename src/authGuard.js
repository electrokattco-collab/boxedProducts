// authGuard.js - Route protection and session management
// SECURITY: Verifies admin claims before allowing access to admin routes
import { observeAuth, signOutAdmin } from './firebaseConfig.js';

class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.unsubscribe = null;
    }

    // Initialize auth observer
    init(callback) {
        this.unsubscribe = observeAuth((authData) => {
            if (authData) {
                this.currentUser = authData.user;
                this.isAdmin = authData.isAdmin;
            } else {
                this.currentUser = null;
                this.isAdmin = false;
            }
            
            if (callback) {
                callback(authData);
            }
            
            // Redirect if on admin page without admin privileges
            if (this.isAdminPage() && !this.isAdmin) {
                this.redirectToLogin();
            }
        });
    }

    // Check if current page is admin
    isAdminPage() {
        return window.location.pathname.includes('admin.html');
    }

    // Redirect to login
    redirectToLogin() {
        window.location.href = 'admin.html';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user is an admin
    isAdminUser() {
        return this.isAdmin === true;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Require admin access (call this on admin page load)
    async requireAdmin() {
        return new Promise((resolve) => {
            if (this.isAdminUser()) {
                resolve(true);
                return;
            }
            
            // Wait for auth state
            const checkAdmin = setInterval(() => {
                if (this.isAdminUser()) {
                    clearInterval(checkAdmin);
                    resolve(true);
                } else if (this.currentUser !== null && !this.isAdminUser()) {
                    // User is logged in but not admin
                    clearInterval(checkAdmin);
                    this.redirectToLogin();
                    resolve(false);
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkAdmin);
                if (!this.isAdminUser()) {
                    this.redirectToLogin();
                    resolve(false);
                }
            }, 5000);
        });
    }

    // Clean up observer
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Create singleton
const authGuard = new AuthGuard();

// Auto-initialize on admin pages
if (window.location.pathname.includes('admin.html')) {
    authGuard.init();
}

export { AuthGuard, authGuard };
