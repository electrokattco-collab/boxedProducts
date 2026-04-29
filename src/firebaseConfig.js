// firebaseConfig.js
// Firebase initialization using modular SDK v9+ syntax
// Includes enhanced auth persistence and security utilities

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Firebase configuration - boxedSneakers project
// NOTE: This is safe to expose in frontend for Firebase
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

// Export Firestore, Storage, and Auth instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const firebaseApp = app;

// Initialize auth persistence (call this before any auth operations)
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

// Auth state observer helper with admin claim checking
export function observeAuth(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Get the ID token result to check custom claims
            const idTokenResult = await user.getIdTokenResult(true);
            const isAdmin = idTokenResult.claims.admin === true;
            
            callback({
                user: user,
                isAdmin: isAdmin,
                uid: user.uid,
                email: user.email,
                token: idTokenResult.token
            });
        } else {
            callback(null);
        }
    });
}

// Sign in helper with persistence option
export async function signInAdmin(email, password, rememberMe = false) {
    try {
        // Set persistence before signing in
        await initializeAuthPersistence(rememberMe);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if user has admin claim
        const idTokenResult = await userCredential.user.getIdTokenResult(true);
        const isAdmin = idTokenResult.claims.admin === true;
        
        if (!isAdmin) {
            // Sign out if not admin
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

// Sign out helper
export async function signOutAdmin() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current auth token (useful for verifying admin status)
export async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('[Auth] Token retrieval failed:', error);
        return null;
    }
}

console.log('[Firebase] Initialized successfully with Auth');

// Expose auth for adminCRUD.js (avoids circular import issues)
if (typeof window !== 'undefined') {
    window._firebaseAuth = { auth };
}
