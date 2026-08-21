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
 * @param {Object} additionalData - Additional profile data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createUserProfile(user, additionalData = {}) {
    const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName || '',
        photoURL: user.photoURL || additionalData.photoURL || '',
        role: additionalData.role || 'customer', // Default role is customer
        emailVerified: user.emailVerified || false,
        provider: user.providerData[0]?.providerId || 'password',
        phoneNumber: additionalData.phoneNumber || '',
        address: additionalData.address || {
            street: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'South Africa'
        },
        preferences: additionalData.preferences || {
            newsletter: false,
            notifications: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
    };
    
    return await saveUserProfile(user.uid, profileData);
}

/**
 * Get user role from profile
 * @param {string} uid - User ID
 * @returns {Promise<string|null>} User role or null
 */
export async function getUserRole(uid) {
    try {
        const result = await getUserProfile(uid);
        if (result.success && result.data) {
            return result.data.role || 'customer';
        }
        return null;
    } catch (error) {
        console.error('[UserService] Get role error:', error);
        return null;
    }
}

/**
 * Update user role (admin function)
 * @param {string} uid - User ID
 * @param {string} role - New role ('admin' or 'customer')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserRole(uid, role) {
    try {
        if (!['admin', 'customer'].includes(role)) {
            return { success: false, error: 'Invalid role' };
        }
        
        return await saveUserProfile(uid, { role });
    } catch (error) {
        console.error('[UserService] Update role error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user address
 * @param {string} uid - User ID
 * @param {Object} address - Address object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserAddress(uid, address) {
    try {
        return await saveUserProfile(uid, { address });
    } catch (error) {
        console.error('[UserService] Update address error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user phone number
 * @param {string} uid - User ID
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserPhone(uid, phoneNumber) {
    try {
        return await saveUserProfile(uid, { phoneNumber });
    } catch (error) {
        console.error('[UserService] Update phone error:', error);
        return { success: false, error: error.message };
    }
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
