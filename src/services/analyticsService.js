/**
 * Analytics Service - Dashboard Statistics and Reports
 * Location: src/services/analyticsService.js
 * 
 * Provides analytics for the admin dashboard:
 * - Sales metrics
 * - Revenue statistics
 * - Product performance
 * - Customer insights
 * - Inventory alerts
 * 
 * Security: All operations require admin access
 */

import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit,
    getDocs,
    getCountFromServer,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebaseConfig.js';
import { getAuthState } from '../contexts/AuthContext.js';
import { getAllOrders, ORDER_STATUSES } from './orderService.js';

/**
 * Check if current user is admin
 * @returns {boolean}
 */
function isAdmin() {
    const authState = getAuthState();
    return authState.isAdmin === true;
}

/**
 * Get dashboard overview statistics
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export async function getDashboardStats() {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get orders
        const ordersResult = await getAllOrders({ limit: 1000 });
        if (!ordersResult.success) {
            return ordersResult;
        }
        const orders = ordersResult.orders;

        // Get products
        const productsColl = collection(db, 'products');
        const productsSnapshot = await getDocs(productsColl);
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Get users count
        const usersCount = await getCountFromServer(collection(db, 'users'));

        // Calculate stats
        const stats = {
            orders: {
                total: orders.length,
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0
            },
            revenue: {
                total: 0,
                today: 0,
                thisWeek: 0,
                thisMonth: 0
            },
            products: {
                total: products.length,
                inStock: 0,
                lowStock: 0,
                outOfStock: 0,
                visible: 0
            },
            customers: {
                total: usersCount.data().count
            },
            recentActivity: []
        };

        // Process orders
        orders.forEach(order => {
            const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
            const orderTotal = order.total || 0;
            const isCancelled = order.status === ORDER_STATUSES.CANCELLED;

            // Count by status
            if (stats.orders[order.status] !== undefined) {
                stats.orders[order.status]++;
            }

            // Revenue calculations (exclude cancelled)
            if (!isCancelled) {
                stats.revenue.total += orderTotal;

                if (orderDate >= today) {
                    stats.orders.today++;
                    stats.revenue.today += orderTotal;
                }

                if (orderDate >= thisWeek) {
                    stats.orders.thisWeek++;
                    stats.revenue.thisWeek += orderTotal;
                }

                if (orderDate >= thisMonth) {
                    stats.orders.thisMonth++;
                    stats.revenue.thisMonth += orderTotal;
                }
            }
        });

        // Process products
        products.forEach(product => {
            if (product.inventoryStatus === 'inStock') stats.products.inStock++;
            if (product.inventoryStatus === 'lowStock') stats.products.lowStock++;
            if (product.inventoryStatus === 'outOfStock') stats.products.outOfStock++;
            if (product.isVisible) stats.products.visible++;
        });

        // Recent activity (last 10 orders)
        stats.recentActivity = orders.slice(0, 10).map(order => ({
            type: 'order',
            id: order.id,
            description: `Order ${order.id?.slice(-6)} by ${order.userEmail}`,
            amount: order.total,
            status: order.status,
            timestamp: order.createdAt
        }));

        return { success: true, stats };
    } catch (error) {
        console.error('[AnalyticsService] Get dashboard stats error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get sales data for charts
 * @param {string} period - 'day', 'week', 'month', 'year'
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getSalesData(period = 'month') {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const ordersResult = await getAllOrders({ limit: 1000 });
        if (!ordersResult.success) {
            return ordersResult;
        }

        const now = new Date();
        const orders = ordersResult.orders.filter(o => o.status !== ORDER_STATUSES.CANCELLED);
        
        let dataPoints = [];
        let labels = [];
        let revenues = [];
        let counts = [];

        if (period === 'day') {
            // Hourly data for today
            for (let i = 0; i < 24; i++) {
                const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i);
                const nextHour = new Date(hour);
                nextHour.setHours(i + 1);

                const hourOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
                    return orderDate >= hour && orderDate < nextHour;
                });

                labels.push(`${i}:00`);
                revenues.push(hourOrders.reduce((sum, o) => sum + (o.total || 0), 0));
                counts.push(hourOrders.length);
            }
        } else if (period === 'week') {
            // Daily data for last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const dayOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
                    return orderDate >= dayStart && orderDate < dayEnd;
                });

                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                revenues.push(dayOrders.reduce((sum, o) => sum + (o.total || 0), 0));
                counts.push(dayOrders.length);
            }
        } else if (period === 'month') {
            // Daily data for this month
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayStart = new Date(now.getFullYear(), now.getMonth(), i);
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayEnd.getDate() + 1);

                const dayOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
                    return orderDate >= dayStart && orderDate < dayEnd;
                });

                labels.push(i.toString());
                revenues.push(dayOrders.reduce((sum, o) => sum + (o.total || 0), 0));
                counts.push(dayOrders.length);
            }
        } else if (period === 'year') {
            // Monthly data for this year
            for (let i = 0; i < 12; i++) {
                const monthStart = new Date(now.getFullYear(), i, 1);
                const monthEnd = new Date(now.getFullYear(), i + 1, 1);

                const monthOrders = orders.filter(o => {
                    const orderDate = o.createdAt?.toDate?.() || new Date(o.createdAt);
                    return orderDate >= monthStart && orderDate < monthEnd;
                });

                labels.push(monthStart.toLocaleDateString('en-US', { month: 'short' }));
                revenues.push(monthOrders.reduce((sum, o) => sum + (o.total || 0), 0));
                counts.push(monthOrders.length);
            }
        }

        return {
            success: true,
            data: {
                labels,
                revenues,
                counts,
                period
            }
        };
    } catch (error) {
        console.error('[AnalyticsService] Get sales data error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get top selling products
 * @param {number} limit - Number of products to return
 * @returns {Promise<{success: boolean, products?: Array, error?: string}>}
 */
export async function getTopProducts(limit = 10) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const ordersResult = await getAllOrders({ limit: 1000 });
        if (!ordersResult.success) {
            return ordersResult;
        }

        const orders = ordersResult.orders.filter(o => o.status !== ORDER_STATUSES.CANCELLED);
        
        // Aggregate product sales
        const productSales = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                const productId = item.productId;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        name: item.name,
                        image: item.image,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[productId].quantity += item.quantity || 0;
                productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
            });
        });

        // Convert to array and sort by quantity
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);

        return { success: true, products: topProducts };
    } catch (error) {
        console.error('[AnalyticsService] Get top products error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get low stock alerts
 * @param {number} threshold - Stock threshold for low stock alert
 * @returns {Promise<{success: boolean, products?: Array, error?: string}>}
 */
export async function getLowStockAlerts(threshold = 10) {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const productsColl = collection(db, 'products');
        const q = query(
            productsColl,
            where('stockQuantity', '<=', threshold),
            where('inventoryStatus', 'in', ['inStock', 'lowStock']),
            orderBy('stockQuantity', 'asc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, products };
    } catch (error) {
        console.error('[AnalyticsService] Get low stock alerts error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get customer insights
 * @returns {Promise<{success: boolean, insights?: Object, error?: string}>}
 */
export async function getCustomerInsights() {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const ordersResult = await getAllOrders({ limit: 1000 });
        if (!ordersResult.success) {
            return ordersResult;
        }

        const orders = ordersResult.orders.filter(o => o.status !== ORDER_STATUSES.CANCELLED);
        
        // Calculate customer metrics
        const customerData = {};
        orders.forEach(order => {
            const userId = order.userId;
            if (!customerData[userId]) {
                customerData[userId] = {
                    userId,
                    email: order.userEmail,
                    orders: 0,
                    totalSpent: 0
                };
            }
            customerData[userId].orders++;
            customerData[userId].totalSpent += order.total || 0;
        });

        const customers = Object.values(customerData);
        
        // Calculate insights
        const insights = {
            totalCustomers: customers.length,
            averageOrdersPerCustomer: customers.length > 0 
                ? orders.length / customers.length 
                : 0,
            averageOrderValue: orders.length > 0 
                ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / orders.length 
                : 0,
            topCustomers: customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 10),
            repeatCustomers: customers.filter(c => c.orders > 1).length,
            oneTimeCustomers: customers.filter(c => c.orders === 1).length
        };

        return { success: true, insights };
    } catch (error) {
        console.error('[AnalyticsService] Get customer insights error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get inventory summary
 * @returns {Promise<{success: boolean, summary?: Object, error?: string}>}
 */
export async function getInventorySummary() {
    try {
        if (!isAdmin()) {
            return { success: false, error: 'Admin access required' };
        }

        const productsColl = collection(db, 'products');
        const snapshot = await getDocs(productsColl);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const summary = {
            total: products.length,
            totalStock: 0,
            byCategory: {},
            byStatus: {
                inStock: 0,
                lowStock: 0,
                outOfStock: 0,
                discontinued: 0
            },
            lowStockItems: [],
            outOfStockItems: []
        };

        products.forEach(product => {
            // Total stock
            summary.totalStock += product.stockQuantity || 0;

            // By category
            const category = product.category || 'uncategorized';
            if (!summary.byCategory[category]) {
                summary.byCategory[category] = {
                    count: 0,
                    stock: 0
                };
            }
            summary.byCategory[category].count++;
            summary.byCategory[category].stock += product.stockQuantity || 0;

            // By status
            if (summary.byStatus[product.inventoryStatus] !== undefined) {
                summary.byStatus[product.inventoryStatus]++;
            }

            // Low stock
            if (product.inventoryStatus === 'lowStock' || 
                (product.stockQuantity <= 10 && product.inventoryStatus === 'inStock')) {
                summary.lowStockItems.push({
                    id: product.id,
                    name: product.name,
                    stock: product.stockQuantity
                });
            }

            // Out of stock
            if (product.inventoryStatus === 'outOfStock') {
                summary.outOfStockItems.push({
                    id: product.id,
                    name: product.name
                });
            }
        });

        return { success: true, summary };
    } catch (error) {
        console.error('[AnalyticsService] Get inventory summary error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    getDashboardStats,
    getSalesData,
    getTopProducts,
    getLowStockAlerts,
    getCustomerInsights,
    getInventorySummary
};
