/**
 * Customer Service - Customer/User Management for Admins
 * Location: src/services/customerService.js
 * 
 * Provides operations for managing customers:
 * - List all customers
 * - Get customer details with order history
 * - Update customer role (promote/demote)
 * - Search customers
 * - Customer analytics
 * 
 * Security: All operations require admin access
 */

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    startAfter,
    onSnapshot,
    serverTimestamp,
    getCountFromServer
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebaseConfig.js';
import { getAuthState } from '../contexts/AuthContext.js';
import { getAllOrders } from './orderService.js';

const USERS_COLLECTION = 'users';

/**
 * Check if current user is admin
 * @returns {boolean}
 */
function isAdmin() {
    const authState = getAuthState();
    return authState.isAdmin === true;
}

/**
 * Get all customers/users
 * @param {Object} options - Query options
 * @returns {Promise<{success: boolean, customers?: Array, lastDoc?: Object, error?: string}>}
 */
export async function getAllCustomers(options = {}) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const { 
            limit: queryLimit = 50, 
            startAfterDoc = null,
            role = null,
            search = null
        } = options;

        let constraints = [orderBy('createdAt', 'desc'), limit(queryLimit)];

        if (role) {
            constraints.unshift(where('role', '==', role));
        }

        if (startAfterDoc) {
            constraints.push(startAfter(startAfterDoc));
        }

        const q = query(collection(db, USERS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let customers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side search (Firestore doesn't support partial text search)
        if (search) {
            const searchLower = search.toLowerCase();
            customers = customers.filter(customer => 
                customer.email?.toLowerCase().includes(searchLower) ||
                customer.displayName?.toLowerCase().includes(searchLower) ||
                customer.phoneNumber?.includes(search)
            );
        }

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { 
            success: true, 
            customers,
            lastDoc: lastDoc || null
        };
    } catch (error) {
        console.error('[CustomerService] Get all customers error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get customer by ID with order history
 * @param {string} customerId - Customer UID
 * @returns {Promise<{success: boolean, customer?: Object, error?: string}>}
 */
export async function getCustomerDetails(customerId) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        // Get user profile
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, customerId));
        if (!userDoc.exists()) {
            return { success: false, error: 'Customer not found' };
        }

        const customer = {
            id: userDoc.id,
            ...userDoc.data()
        };

        // Get customer orders
        const ordersResult = await getAllOrders({ userId: customerId, limit: 100 });
        if (ordersResult.success) {
            customer.orders = ordersResult.orders;
            
            // Calculate stats
            customer.orderStats = {
                total: ordersResult.orders.length,
                completed: ordersResult.orders.filter(o => o.status === 'delivered').length,
                totalSpent: ordersResult.orders
                    .filter(o => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + (o.total || 0), 0),
                lastOrder: ordersResult.orders[0] || null
            };
        }

        return { success: true, customer };
    } catch (error) {
        console.error('[CustomerService] Get customer details error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update customer role (promote to admin or demote to customer)
 * @param {string} customerId - Customer UID
 * @param {string} newRole - 'admin' or 'customer'
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateCustomerRole(customerId, newRole) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        if (!['admin', 'customer'].includes(newRole)) {
            return { success: false, error: 'Invalid role. Must be "admin" or "customer"' };
        }

        // Prevent self-demotion
        const authState = getAuthState();
        if (customerId === authState.currentUser?.uid && newRole === 'customer') {
            return { success: false, error: 'Cannot demote yourself' };
        }

        const docRef = doc(db, USERS_COLLECTION, customerId);
        await updateDoc(docRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });

        console.log('[CustomerService] Updated customer role:', customerId, newRole);
        return { success: true };
    } catch (error) {
        console.error('[CustomerService] Update role error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update customer profile (admin override)
 * @param {string} customerId - Customer UID
 * @param {Object} updates - Profile updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateCustomerProfile(customerId, updates) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        // Prevent changing sensitive fields
        const allowedFields = ['displayName', 'phoneNumber', 'address', 'adminNotes'];
        const sanitizedUpdates = {};
        
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        }

        sanitizedUpdates.updatedAt = serverTimestamp();

        const docRef = doc(db, USERS_COLLECTION, customerId);
        await updateDoc(docRef, sanitizedUpdates);

        return { success: true };
    } catch (error) {
        console.error('[CustomerService] Update profile error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search customers
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<{success: boolean, customers?: Array, error?: string}>}
 */
export async function searchCustomers(searchTerm, options = {}) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const { limit: queryLimit = 20 } = options;
        const searchLower = searchTerm.toLowerCase();

        // Query by email (most efficient)
        const emailQuery = query(
            collection(db, USERS_COLLECTION),
            where('email', '>=', searchLower),
            where('email', '<=', searchLower + '\uf8ff'),
            limit(queryLimit)
        );

        const querySnapshot = await getDocs(emailQuery);
        const customers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, customers };
    } catch (error) {
        console.error('[CustomerService] Search error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get customer statistics
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export async function getCustomerStats() {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        // Get total users count
        const usersColl = collection(db, USERS_COLLECTION);
        const countSnapshot = await getCountFromServer(usersColl);
        const totalUsers = countSnapshot.data().count;

        // Get recent users
        const recentQuery = query(
            usersColl,
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentUsers = recentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get admins
        const adminQuery = query(
            usersColl,
            where('role', '==', 'admin')
        );
        const adminSnapshot = await getDocs(adminQuery);
        const admins = adminSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate growth (users created this month)
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthQuery = query(
            usersColl,
            where('createdAt', '>=', thisMonth.toISOString())
        );
        const thisMonthSnapshot = await getDocs(thisMonthQuery);
        const newThisMonth = thisMonthSnapshot.size;

        return {
            success: true,
            stats: {
                total: totalUsers,
                admins: admins.length,
                customers: totalUsers - admins.length,
                newThisMonth,
                recentUsers,
                adminsList: admins
            }
        };
    } catch (error) {
        console.error('[CustomerService] Get stats error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to all customers (real-time)
 * @param {Function} callback - Called when customers change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToCustomers(callback) {
    if (!isAdmin()) {
        callback({ success: false, error: 'Admin access required', customers: [] });
        return () => {};
    }

    const q = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
    );

    return onSnapshot(q, (querySnapshot) => {
        const customers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback({ success: true, customers });
    }, (error) => {
        console.error('[CustomerService] Subscribe error:', error);
        callback({ success: false, error: error.message, customers: [] });
    });
}

/**
 * Get customer activity summary
 * @param {string} customerId - Customer UID
 * @returns {Promise<{success: boolean, activity?: Object, error?: string}>}
 */
export async function getCustomerActivity(customerId) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const customerResult = await getCustomerDetails(customerId);
        if (!customerResult.success) {
            return customerResult;
        }

        const customer = customerResult.customer;
        const orders = customer.orders || [];

        // Calculate activity metrics
        const activity = {
            customerId,
            customerName: customer.displayName || customer.email,
            memberSince: customer.createdAt,
            lastLogin: customer.lastLoginAt,
            totalOrders: orders.length,
            totalSpent: customer.orderStats?.totalSpent || 0,
            averageOrderValue: orders.length > 0 
                ? (customer.orderStats?.totalSpent || 0) / orders.length 
                : 0,
            orderHistory: orders.map(o => ({
                id: o.id,
                date: o.createdAt,
                total: o.total,
                status: o.status,
                itemCount: o.items?.length || 0
            })),
            statusBreakdown: {}
        };

        // Count orders by status
        orders.forEach(order => {
            activity.statusBreakdown[order.status] = 
                (activity.statusBreakdown[order.status] || 0) + 1;
        });

        return { success: true, activity };
    } catch (error) {
        console.error('[CustomerService] Get activity error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Bulk update customer roles (admin only)
 * @param {Array<string>} customerIds - Array of customer UIDs
 * @param {string} newRole - New role
 * @returns {Promise<{success: boolean, updated?: number, error?: string}>}
 */
export async function bulkUpdateRoles(customerIds, newRole) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const authState = getAuthState();
        const updates = [];

        for (const customerId of customerIds) {
            // Prevent self-demotion
            if (customerId === authState.currentUser?.uid && newRole === 'customer') {
                continue;
            }

            const docRef = doc(db, USERS_COLLECTION, customerId);
            updates.push(updateDoc(docRef, {
                role: newRole,
                updatedAt: serverTimestamp()
            }));
        }

        await Promise.all(updates);
        console.log('[CustomerService] Bulk updated roles:', updates.length);

        return { success: true, updated: updates.length };
    } catch (error) {
        console.error('[CustomerService] Bulk update error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    getAllCustomers,
    getCustomerDetails,
    updateCustomerRole,
    updateCustomerProfile,
    searchCustomers,
    getCustomerStats,
    subscribeToCustomers,
    getCustomerActivity,
    bulkUpdateRoles
};
