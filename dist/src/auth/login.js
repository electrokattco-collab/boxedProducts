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
import { validateEmail, validatePassword, sanitizeEmail } from '../utils/validation.js';
import { checkLoginLimit, clearLoginAttempts } from '../utils/rateLimiter.js';
import { handleFirebaseError } from '../services/errorHandler.js';

/**
 * Email/password login with rate limiting and validation
 */
export async function signInWithEmail(email, password, rememberMe = false) {
    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    
    // Validate inputs
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.message };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.message };
    }
    
    // Check rate limit
    const rateLimit = checkLoginLimit(sanitizedEmail);
    if (!rateLimit.allowed) {
        return { 
            success: false, 
            error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.resetInMs / 60000)} minutes.`
        };
    }

    try {
        await initializeAuthPersistence(rememberMe);

        const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
        const user = userCredential.user;
        
        // Clear failed login attempts on success
        clearLoginAttempts(sanitizedEmail);

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
        
        // Use centralized error handler for consistent messaging
        const errorResult = handleFirebaseError('login', error, { log: false, notify: false });
        
        // Override specific messages for security
        let errorMessage = errorResult.message;
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                // Use generic message to prevent user enumeration
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
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