/**
 * Firebase Configuration - Backward Compatibility Layer
 * Location: src/firebaseConfig.js
 * 
 * ⚠️ DEPRECATED: This file exists for backward compatibility.
 * Use src/services/firebaseConfig.js for new code.
 */

// Re-export everything from the new location
export { 
    db, 
    storage, 
    auth, 
    firebaseApp,
    initializeAuthPersistence,
    getIdTokenResult,
    observeAuth,
    getCurrentUser
} from './services/firebaseConfig.js';

// Legacy exports for old code
import { signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { auth, initializeAuthPersistence, getIdTokenResult } from './services/firebaseConfig.js';

/**
 * @deprecated Use src/auth/login.js signInWithEmail instead
 */
export async function signInAdmin(email, password, rememberMe = false) {
    console.warn('[DEPRECATED] signInAdmin is deprecated. Use src/auth/login.js');
    try {
        await initializeAuthPersistence(rememberMe);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idTokenResult = await getIdTokenResult(userCredential.user, true);
        const isAdmin = idTokenResult?.isAdmin || false;
        
        if (!isAdmin) {
            await signOut(auth);
            return { 
                success: false, 
                error: 'Access denied: Administrator privileges required',
                isAdmin: false
            };
        }
        
        return { 
            success: true, 
            user: userCredential.user,
            isAdmin: true
        };
    } catch (error) {
        console.error('[Auth] Sign in failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * @deprecated Use src/auth/login.js signOutUser instead
 */
export async function signOutAdmin() {
    console.warn('[DEPRECATED] signOutAdmin is deprecated. Use src/auth/login.js');
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Expose auth for legacy modules
if (typeof window !== 'undefined') {
    window._firebaseAuth = { auth };
}

console.log('[Firebase] Config loaded (backward compatibility mode)');
