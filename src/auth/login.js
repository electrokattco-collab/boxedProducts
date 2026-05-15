/**
 * Login Module - Unified Authentication
 * Location: src/auth/login.js
 */

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import {
    auth,
    initializeAuthPersistence,
    getIdTokenResult
} from '../services/firebaseConfig.js';

import { signInWithGoogle, handleGoogleRedirectResult } from './googleAuth.js';

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password
 */
function isValidPassword(password) {
    return password && password.length >= 6;
}

/**
 * Email/password login
 */
export async function signInWithEmail(email, password, rememberMe = false) {
    if (!email || !password) {
        return { success: false, error: 'Please enter both email and password.' };
    }

    if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!isValidPassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
        await initializeAuthPersistence(rememberMe);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const tokenResult = await getIdTokenResult(user, true);
        const isAdmin = tokenResult?.claims?.isAdmin || false;

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            },
            isAdmin
        };

    } catch (error) {
        console.error('[Email Auth] Sign in failed:', error);

        let errorMessage = 'Sign-in failed. Please try again.';

        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Try later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error.';
                break;
            default:
                errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Sign out
 */
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Redirect based on role
 */
export function redirectAfterLogin(isAdmin, redirectUrl = null) {
    if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
    }

    // Determine base path based on current location
    // If in pages/ directory, go up one level; otherwise stay at root
    const isInPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isInPagesDir ? '../' : '';
    
    window.location.href = isAdmin ? basePath + 'admin.html' : basePath + 'index.html';
}

/**
 * Safer session check
 */
export function checkExistingSession() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const tokenResult = await getIdTokenResult(user, false);
                const isAdmin = tokenResult?.claims?.isAdmin || false;

                redirectAfterLogin(isAdmin);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

/**
 * Handle Google redirect
 */
export async function handleRedirectResult() {
    const result = await handleGoogleRedirectResult();

    if (result.success) {
        redirectAfterLogin(result.isAdmin);
        return true;
    }

    return false;
}

export {
    signInWithGoogle,
    
};