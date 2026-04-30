/**
 * User Service
 * Location: src/services/userService.js
 * 
 * User profile management and utilities
 */

import { db } from './firebaseConfig.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const USERS_COLLECTION = 'users';

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getUserProfile(uid) {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return {
                success: true,
                data: userSnap.data()
            };
        } else {
            return {
                success: false,
                error: 'User profile not found'
            };
        }
    } catch (error) {
        console.error('[UserService] Get profile error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create or update user profile
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveUserProfile(uid, profileData) {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            // Update existing
            await updateDoc(userRef, {
                ...profileData,
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new
            await setDoc(userRef, {
                ...profileData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('[UserService] Save profile error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create user profile after first login
 * @param {Object} user - Firebase user object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createUserProfile(user) {
    const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        provider: user.providerData[0]?.providerId || 'password'
    };
    
    return await saveUserProfile(user.uid, profileData);
}

/**
 * Check if user exists in Firestore
 * @param {string} uid - User ID
 * @returns {Promise<boolean>}
 */
export async function userExists(uid) {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
    } catch (error) {
        console.error('[UserService] Check existence error:', error);
        return false;
    }
}

export default {
    getUserProfile,
    saveUserProfile,
    createUserProfile,
    userExists
};
