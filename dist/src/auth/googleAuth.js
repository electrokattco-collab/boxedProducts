/**
 * Google Authentication Module
 * Location: src/auth/googleAuth.js
 */

import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import {
    auth,
    getIdTokenResult
} from '../services/firebaseConfig.js';

const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * Popup login
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

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
        let errorMessage = 'Google sign-in failed.';

        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage = 'Popup blocked.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in cancelled.';
                break;
            case 'auth/account-exists-with-different-credential':
                errorMessage = 'Account exists with another method.';
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
 * Redirect login (mobile fallback)
 */
export async function signInWithGoogleRedirect() {
    await signInWithRedirect(auth, googleProvider);
}

/**
 * Handle redirect result
 */
export async function handleGoogleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);

        if (!result) {
            return { success: false };
        }

        const user = result.user;

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
        return {
            success: false,
            error: error.message
        };
    }
}

export default {
    signInWithGoogle,
    signInWithGoogleRedirect,
    handleGoogleRedirectResult
};