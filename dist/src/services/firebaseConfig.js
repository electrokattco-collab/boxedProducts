/**
 * Firebase Configuration - Unified Auth System
 * Location: src/services/firebaseConfig.js
 * 
 * Core Firebase initialization and auth utilities
 * Used by all authentication flows (admin + customer)
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { 
    getAuth, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Firebase configuration - boxedSneakers project
const firebaseConfig = {
    apiKey: "AIzaSyCyM_9yvMlKqNNZsMN-BjcnTfYZZJmYmjs",
    authDomain: "boxedsneakers.firebaseapp.com",
    projectId: "boxedsneakers",
    storageBucket: "boxedsneakers.firebasestorage.app",
    messagingSenderId: "26958229184",
    appId: "1:26958229184:web:8f32107b0aa9d4fb72c725",
    measurementId: "G-F77K45QBQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export service instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const firebaseApp = app;

/**
 * Initialize auth persistence (local or session)
 * @param {boolean} rememberMe - true for local persistence, false for session
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function initializeAuthPersistence(rememberMe = false) {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    try {
        await setPersistence(auth, persistence);
        return { success: true };
    } catch (error) {
        console.error('[Auth] Persistence setup failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's ID token result with claims
 * @param {Object} user - Firebase user object
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<{token: string, claims: Object}>}
 */
export async function getIdTokenResult(user, forceRefresh = false) {
    if (!user) return null;
    try {
        const idTokenResult = await user.getIdTokenResult(forceRefresh);
        return {
            token: idTokenResult.token,
            claims: idTokenResult.claims,
            isAdmin: idTokenResult.claims.admin === true
        };
    } catch (error) {
        console.error('[Auth] Token retrieval failed:', error);
        return null;
    }
}

/**
 * Auth state observer with role detection
 * @param {Function} callback - Called with {user, isAdmin, uid, email, token} or null
 * @returns {Function} Unsubscribe function
 */
export function observeAuth(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const tokenResult = await getIdTokenResult(user, true);
            callback({
                user: user,
                isAdmin: tokenResult?.isAdmin || false,
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                token: tokenResult?.token || null
            });
        } else {
            callback(null);
        }
    });
}

/**
 * Get current auth state (synchronous)
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
    return auth.currentUser;
}

console.log('[Firebase] Initialized successfully');
