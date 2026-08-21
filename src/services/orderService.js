/**
 * Order Service - Order Management Operations
 * Location: src/services/orderService.js
 * 
 * Provides CRUD operations for orders including:
 * - Create orders from cart
 * - Read orders (with role-based filtering)
 * - Update order status
 * - Cancel orders
 * - Real-time order subscriptions
 * 
 * Security: All operations respect Firestore security rules
 */

import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebaseConfig.js';
import { getAuthState } from '../contexts/AuthContext.js';
import { getUserProfile } from './userService.js';

const ORDERS_COLLECTION = 'orders';

// Order status workflow
export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Valid status transitions
const STATUS_TRANSITIONS = {
    [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
    [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
    [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
    [ORDER_STATUSES.DELIVERED]: [ORDER_STATUSES.REFUNDED],
    [ORDER_STATUSES.CANCELLED]: [],
    [ORDER_STATUSES.REFUNDED]: []
};

/**
 * Validate status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean}
 */
export function canTransitionStatus(currentStatus, newStatus) {
    if (currentStatus === newStatus) return true;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
}

/**
 * Get status display info
 * @param {string} status - Order status
 * @returns {Object} Display info (label, color, icon)
 */
export function getStatusDisplay(status) {
    const displays = {
        [ORDER_STATUSES.PENDING]: { 
            label: 'Pending', 
            color: '#f59e0b', 
            bgColor: '#fef3c7',
            icon: 'fa-clock',
            description: 'Order received, awaiting processing'
        },
        [ORDER_STATUSES.PROCESSING]: { 
            label: 'Processing', 
            color: '#3b82f6', 
            bgColor: '#dbeafe',
            icon: 'fa-cog',
            description: 'Order is being prepared'
        },
        [ORDER_STATUSES.SHIPPED]: { 
            label: 'Shipped', 
            color: '#8b5cf6', 
            bgColor: '#ede9fe',
            icon: 'fa-truck',
            description: 'Order has been shipped'
        },
        [ORDER_STATUSES.DELIVERED]: { 
            label: 'Delivered', 
            color: '#10b981', 
            bgColor: '#d1fae5',
            icon: 'fa-check-circle',
            description: 'Order delivered successfully'
        },
        [ORDER_STATUSES.CANCELLED]: { 
            label: 'Cancelled', 
            color: '#ef4444', 
            bgColor: '#fee2e2',
            icon: 'fa-times-circle',
            description: 'Order was cancelled'
        },
        [ORDER_STATUSES.REFUNDED]: { 
            label: 'Refunded', 
            color: '#6b7280', 
            bgColor: '#f3f4f6',
            icon: 'fa-undo',
            description: 'Payment refunded'
        }
    };
    return displays[status] || { 
        label: status, 
        color: '#6b7280', 
        bgColor: '#f3f4f6',
        icon: 'fa-question-circle',
        description: ''
    };
}

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, orderId?: string, error?: string}>}
 */
export async function createOrder(orderData) {
    try {
        const authState = getAuthState();
        if (!authState.isAuthenticated) {
            return { success: false, error: 'User must be authenticated to create an order' };
        }

        // Get user profile for additional info
        const userProfile = await getUserProfile(authState.currentUser.uid);

        // Calculate totals
        const subtotal = orderData.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const shipping = orderData.shipping || 0;
        const total = subtotal + shipping;

        const order = {
            userId: authState.currentUser.uid,
            userEmail: authState.currentUser.email,
            userName: userProfile?.displayName || authState.currentUser.displayName || 'Guest',
            userPhone: userProfile?.phoneNumber || orderData.phone || '',
            items: orderData.items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size || null,
                color: item.color || null,
                image: item.image || null
            })),
            status: ORDER_STATUSES.PENDING,
            paymentStatus: 'pending',
            paymentMethod: orderData.paymentMethod || 'bank_transfer',
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            shippingAddress: {
                name: orderData.shippingAddress?.name || '',
                phone: orderData.shippingAddress?.phone || '',
                street: orderData.shippingAddress?.street || '',
                city: orderData.shippingAddress?.city || '',
                province: orderData.shippingAddress?.province || '',
                postalCode: orderData.shippingAddress?.postalCode || ''
            },
            notes: orderData.notes || '',
            adminNotes: '',
            timeline: [{
                status: ORDER_STATUSES.PENDING,
                timestamp: new Date().toISOString(),
                note: 'Order placed',
                updatedBy: authState.currentUser.uid
            }],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
        
        console.log('[OrderService] Order created:', docRef.id);
        return { success: true, orderId: docRef.id };
    } catch (error) {
        console.error('[OrderService] Create order error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<{success: boolean, order?: Object, error?: string}>}
 */
export async function getOrder(orderId) {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Order not found' };
        }

        const order = { id: docSnap.id, ...docSnap.data() };
        
        // Check access permission
        const authState = getAuthState();
        if (!authState.isAdmin && order.userId !== authState.currentUser?.uid) {
            return { success: false, error: 'Access denied' };
        }

        return { success: true, order };
    } catch (error) {
        console.error('[OrderService] Get order error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get orders for current user
 * @param {Object} options - Query options
 * @returns {Promise<{success: boolean, orders?: Array, error?: string}>}
 */
export async function getMyOrders(options = {}) {
    try {
        const authState = getAuthState();
        if (!authState.isAuthenticated) {
            return { success: false, error: 'User must be authenticated' };
        }

        const { status, limit: queryLimit = 50 } = options;
        
        let q = query(
            collection(db, ORDERS_COLLECTION),
            where('userId', '==', authState.currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(queryLimit)
        );

        if (status) {
            q = query(q, where('status', '==', status));
        }

        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, orders };
    } catch (error) {
        console.error('[OrderService] Get my orders error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all orders (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<{success: boolean, orders?: Array, error?: string}>}
 */
export async function getAllOrders(options = {}) {
    try {
        const authState = getAuthState();
        if (!authState.isAdmin) {
            return { success: false, error: 'Admin access required' };
        }

        const { 
            status, 
            userId,
            startDate, 
            endDate,
            limit: queryLimit = 100 
        } = options;

        let constraints = [orderBy('createdAt', 'desc'), limit(queryLimit)];

        if (status) {
            constraints.unshift(where('status', '==', status));
        }

        if (userId) {
            constraints.unshift(where('userId', '==', userId));
        }

        const q = query(collection(db, ORDERS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);
        
        let orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side date filtering (Firestore doesn't support multiple range queries on different fields)
        if (startDate) {
            const start = new Date(startDate);
            orders = orders.filter(order => {
                const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
                return orderDate >= start;
            });
        }

        if (endDate) {
            const end = new Date(endDate);
            orders = orders.filter(order => {
                const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
                return orderDate <= end;
            });
        }

        return { success: true, orders };
    } catch (error) {
        console.error('[OrderService] Get all orders error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {string} note - Optional note
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateOrderStatus(orderId, newStatus, note = '') {
    try {
        const authState = getAuthState();
        if (!authState.isAuthenticated) {
            return { success: false, error: 'Authentication required' };
        }

        // Get current order
        const orderResult = await getOrder(orderId);
        if (!orderResult.success) {
            return orderResult;
        }

        const order = orderResult.order;

        // Check permissions
        if (!authState.isAdmin && order.userId !== authState.currentUser.uid) {
            return { success: false, error: 'Access denied' };
        }

        // Customers can only cancel their own pending orders
        if (!authState.isAdmin) {
            if (newStatus !== ORDER_STATUSES.CANCELLED) {
                return { success: false, error: 'Customers can only cancel orders' };
            }
            if (order.status !== ORDER_STATUSES.PENDING) {
                return { success: false, error: 'Can only cancel pending orders' };
            }
        }

        // Validate status transition
        if (!canTransitionStatus(order.status, newStatus)) {
            return { 
                success: false, 
                error: `Cannot transition from ${order.status} to ${newStatus}` 
            };
        }

        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        const timelineEntry = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status changed to ${newStatus}`,
            updatedBy: authState.currentUser.uid
        };

        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
            timeline: [...order.timeline, timelineEntry]
        });

        console.log('[OrderService] Order status updated:', orderId, newStatus);
        return { success: true };
    } catch (error) {
        console.error('[OrderService] Update status error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add admin note to order
 * @param {string} orderId - Order ID
 * @param {string} note - Admin note
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addAdminNote(orderId, note) {
    try {
        const authState = getAuthState();
        if (!authState.isAdmin) {
            return { success: false, error: 'Admin access required' };
        }

        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(docRef, {
            adminNotes: note,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('[OrderService] Add admin note error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelOrder(orderId, reason = '') {
    return updateOrderStatus(
        orderId, 
        ORDER_STATUSES.CANCELLED, 
        reason || 'Order cancelled by user'
    );
}

/**
 * Subscribe to order updates
 * @param {string} orderId - Order ID
 * @param {Function} callback - Called when order changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToOrder(orderId, callback) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const order = { id: docSnap.id, ...docSnap.data() };
            callback({ success: true, order });
        } else {
            callback({ success: false, error: 'Order not found' });
        }
    }, (error) => {
        console.error('[OrderService] Subscribe error:', error);
        callback({ success: false, error: error.message });
    });
}

/**
 * Subscribe to user's orders
 * @param {Function} callback - Called when orders change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMyOrders(callback) {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
        callback({ success: false, error: 'User not authenticated', orders: [] });
        return () => {};
    }

    const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', authState.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback({ success: true, orders });
    }, (error) => {
        console.error('[OrderService] Subscribe to my orders error:', error);
        callback({ success: false, error: error.message, orders: [] });
    });
}

/**
 * Subscribe to all orders (admin only)
 * @param {Function} callback - Called when orders change
 * @param {Object} options - Filter options
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAllOrders(callback, options = {}) {
    const authState = getAuthState();
    if (!authState.isAdmin) {
        callback({ success: false, error: 'Admin access required', orders: [] });
        return () => {};
    }

    const { status, limit: queryLimit = 100 } = options;
    
    let constraints = [orderBy('createdAt', 'desc'), limit(queryLimit)];
    if (status) {
        constraints.unshift(where('status', '==', status));
    }

    const q = query(collection(db, ORDERS_COLLECTION), ...constraints);

    return onSnapshot(q, (querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback({ success: true, orders });
    }, (error) => {
        console.error('[OrderService] Subscribe to all orders error:', error);
        callback({ success: false, error: error.message, orders: [] });
    });
}

/**
 * Get order statistics (admin only)
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export async function getOrderStats() {
    try {
        const authState = getAuthState();
        if (!authState.isAdmin) {
            return { success: false, error: 'Admin access required' };
        }

        const result = await getAllOrders({ limit: 1000 });
        if (!result.success) {
            return result;
        }

        const orders = result.orders;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
            total: orders.length,
            totalRevenue: orders
                .filter(o => o.status !== ORDER_STATUSES.CANCELLED)
                .reduce((sum, o) => sum + (o.total || 0), 0),
            byStatus: {},
            today: {
                count: 0,
                revenue: 0
            },
            thisMonth: {
                count: 0,
                revenue: 0
            },
            recent: orders.slice(0, 5)
        };

        // Count by status
        Object.values(ORDER_STATUSES).forEach(status => {
            stats.byStatus[status] = orders.filter(o => o.status === status).length;
        });

        // Today stats
        orders.forEach(order => {
            const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
            
            if (orderDate >= today) {
                stats.today.count++;
                if (order.status !== ORDER_STATUSES.CANCELLED) {
                    stats.today.revenue += order.total || 0;
                }
            }

            if (orderDate >= thisMonth) {
                stats.thisMonth.count++;
                if (order.status !== ORDER_STATUSES.CANCELLED) {
                    stats.thisMonth.revenue += order.total || 0;
                }
            }
        });

        return { success: true, stats };
    } catch (error) {
        console.error('[OrderService] Get stats error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Bulk update order statuses (admin only)
 * @param {Array<string>} orderIds - Array of order IDs
 * @param {string} newStatus - New status
 * @returns {Promise<{success: boolean, updated?: number, error?: string}>}
 */
export async function bulkUpdateOrderStatus(orderIds, newStatus) {
    try {
        const authState = getAuthState();
        if (!authState.isAdmin) {
            return { success: false, error: 'Admin access required' };
        }

        const batch = writeBatch(db);
        const updatedAt = serverTimestamp();

        for (const orderId of orderIds) {
            const docRef = doc(db, ORDERS_COLLECTION, orderId);
            batch.update(docRef, {
                status: newStatus,
                updatedAt: updatedAt
            });
        }

        await batch.commit();
        console.log('[OrderService] Bulk updated orders:', orderIds.length);
        
        return { success: true, updated: orderIds.length };
    } catch (error) {
        console.error('[OrderService] Bulk update error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    createOrder,
    getOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    addAdminNote,
    subscribeToOrder,
    subscribeToMyOrders,
    subscribeToAllOrders,
    getOrderStats,
    bulkUpdateOrderStatus,
    canTransitionStatus,
    getStatusDisplay,
    ORDER_STATUSES
};
