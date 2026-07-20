/**
 * AuthContext - Centralized Authentication State Management
 * Location: src/contexts/AuthContext.js
 * 
 * Provides global authentication state including:
 * - Current user
 * - Role (admin/customer)
 * - Authentication status
 * - Loading states
 * 
 * Usage:
 *   import { AuthProvider, useAuth } from './AuthContext.js';
 *   
 *   // Wrap app with provider
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *   
 *   // Use in components
 *   const { currentUser, isAdmin, isCustomer, isAuthenticated, loading, logout } = useAuth();
 */

import { observeAuth, getIdTokenResult, auth } from '../services/firebaseConfig.js';
import { getUserProfile, updateUserProfile } from '../services/userService.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

class AuthContextManager {
    constructor() {
        this.state = {
            currentUser: null,
            userProfile: null,
            isAdmin: false,
            isCustomer: false,
            isAuthenticated: false,
            loading: true,
            error: null,
            roleSource: null // 'claims' | 'firestore' | null
        };
        this.listeners = new Set();
        this.unsubscribeAuth = null;
        this.unsubscribeProfile = null;
    }

    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Called when auth state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        // Immediately call with current state
        callback({ ...this.state });
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        const state = { ...this.state };
        this.listeners.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('[AuthContext] Listener error:', error);
            }
        });
    }

    /**
     * Update state and notify listeners
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    /**
     * Initialize auth state observer
     */
    initialize() {
        if (this.unsubscribeAuth) {
            console.warn('[AuthContext] Already initialized');
            return;
        }

        console.log('[AuthContext] Initializing...');

        this.unsubscribeAuth = observeAuth(async (authData) => {
            if (authData) {
                await this.handleAuthenticatedUser(authData);
            } else {
                this.handleUnauthenticatedUser();
            }
        });
    }

    /**
     * Handle authenticated user
     */
    async handleAuthenticatedUser(authData) {
        try {
            // First check custom claims (most secure)
            let isAdmin = authData.isAdmin;
            let roleSource = 'claims';

            // Fetch user profile from Firestore
            let userProfile = null;
            try {
                userProfile = await getUserProfile(authData.uid);
            } catch (error) {
                console.warn('[AuthContext] Could not fetch user profile:', error);
            }

            // If no admin claim, check Firestore role (fallback)
            if (!isAdmin && userProfile) {
                isAdmin = userProfile.role === 'admin';
                if (isAdmin) roleSource = 'firestore';
            }

            // Create user profile if it doesn't exist
            if (!userProfile) {
                try {
                    userProfile = await this.createUserProfile(authData);
                } catch (error) {
                    console.error('[AuthContext] Failed to create user profile:', error);
                }
            }

            // Update last login
            if (userProfile) {
                try {
                    await updateUserProfile(authData.uid, {
                        lastLoginAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn('[AuthContext] Could not update last login:', error);
                }
            }

            this.setState({
                currentUser: authData.user,
                userProfile: userProfile,
                isAdmin: isAdmin,
                isCustomer: !isAdmin,
                isAuthenticated: true,
                loading: false,
                error: null,
                roleSource: roleSource
            });

            console.log('[AuthContext] User authenticated:', {
                uid: authData.uid,
                email: authData.email,
                role: isAdmin ? 'admin' : 'customer',
                source: roleSource
            });

        } catch (error) {
            console.error('[AuthContext] Error handling authenticated user:', error);
            this.setState({
                loading: false,
                error: error.message
            });
        }
    }

    /**
     * Handle unauthenticated user
     */
    handleUnauthenticatedUser() {
        this.setState({
            currentUser: null,
            userProfile: null,
            isAdmin: false,
            isCustomer: false,
            isAuthenticated: false,
            loading: false,
            error: null,
            roleSource: null
        });
        console.log('[AuthContext] User unauthenticated');
    }

    /**
     * Create user profile in Firestore
     */
    async createUserProfile(authData) {
        const profileData = {
            uid: authData.uid,
            email: authData.email,
            displayName: authData.displayName || '',
            photoURL: authData.photoURL || '',
            role: 'customer', // Default role
            emailVerified: authData.user.emailVerified || false,
            provider: authData.user.providerData[0]?.providerId || 'password',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        await updateUserProfile(authData.uid, profileData);
        return profileData;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await signOut(auth);
            this.handleUnauthenticatedUser();
            return { success: true };
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Refresh user role from Firestore
     */
    async refreshRole() {
        if (!this.state.currentUser) return;

        try {
            const userProfile = await getUserProfile(this.state.currentUser.uid);
            if (userProfile && userProfile.role) {
                const isAdmin = userProfile.role === 'admin';
                this.setState({
                    userProfile: userProfile,
                    isAdmin: isAdmin,
                    isCustomer: !isAdmin,
                    roleSource: 'firestore'
                });
            }
        } catch (error) {
            console.error('[AuthContext] Role refresh failed:', error);
        }
    }

    /**
     * Check if user has permission to access resource
     */
    canAccess(resourceType, resourceOwnerId = null) {
        // Admins can access everything
        if (this.state.isAdmin) return true;

        // Unauthenticated users can only read public products
        if (!this.state.isAuthenticated) {
            return resourceType === 'product' && resourceOwnerId === null;
        }

        // For user-specific resources, check ownership
        if (resourceOwnerId) {
            return this.state.currentUser && this.state.currentUser.uid === resourceOwnerId;
        }

        return false;
    }

    /**
     * Get auth token
     */
    async getToken(forceRefresh = false) {
        if (!this.state.currentUser) return null;
        try {
            const tokenResult = await getIdTokenResult(this.state.currentUser, forceRefresh);
            return tokenResult?.token || null;
        } catch (error) {
            console.error('[AuthContext] Token retrieval failed:', error);
            return null;
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
            this.unsubscribeAuth = null;
        }
        if (this.unsubscribeProfile) {
            this.unsubscribeProfile();
            this.unsubscribeProfile = null;
        }
        this.listeners.clear();
    }
}

// Create singleton instance
const authContext = new AuthContextManager();

/**
 * Hook-like function for components to use auth state
 * @param {Function} callback - Called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function useAuth(callback = null) {
    if (callback) {
        return authContext.subscribe(callback);
    }
    // Return current state if no callback
    return { ...authContext.state };
}

/**
 * Get current auth state synchronously
 * @returns {Object} Current auth state
 */
export function getAuthState() {
    return { ...authContext.state };
}

/**
 * Initialize AuthContext
 */
export function initializeAuthContext() {
    authContext.initialize();
}

/**
 * Logout wrapper
 */
export async function logoutUser() {
    return await authContext.logout();
}

/**
 * Check if current user can access resource
 */
export function canAccessResource(resourceType, resourceOwnerId = null) {
    return authContext.canAccess(resourceType, resourceOwnerId);
}

/**
 * Refresh user role
 */
export async function refreshUserRole() {
    return await authContext.refreshRole();
}

/**
 * Get auth token
 */
export async function getAuthToken(forceRefresh = false) {
    return await authContext.getToken(forceRefresh);
}

// Export the manager class for advanced use cases
export { AuthContextManager, authContext };

// Auto-initialize on module load
if (typeof window !== 'undefined') {
    initializeAuthContext();
}

export default authContext;
