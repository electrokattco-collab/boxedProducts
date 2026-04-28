// adminConfig.js
// Configuration for Admin Dashboard - Firebase and Authentication Settings

const AdminConfig = {
    //  Firebase Configuration linked to boxedSneakers project
    firebase: {
        apiKey: "AIzaSyCyM_9yvMlKqNNZsMN-BjcnTfYZZJmYmjs",
        authDomain: "boxedsneakers.firebaseapp.com",
        projectId: "boxedsneakers",
        storageBucket: "boxedsneakers.firebasestorage.app",
        messagingSenderId: "26958229184",
        appId: "1:26958229184:web:8f32107b0aa9d4fb72c725",
        measurementId: "G-F77K45QBQQ"
    },

    // [cite: 280, 295] Collection names in Firestore for persistent storage
    collections: {
        products: 'products',
        adminLogs: 'adminLogs',
        categories: 'categories'
    },

    // Simple password protection (change for production use)
    auth: {
        passwordHash: '$2a$10$YourHashedPasswordHere',
        sessionDuration: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    },

    // [cite: 283, 337] Image upload settings for Firebase Storage
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        path: 'assets/products'
    },

    // [cite: 296] Default values for new products in the "Anything" store
    defaults: {
        inventoryStatus: 'inStock',
        stockQuantity: 10,
        isVisible: true,
        tag: 'New Arrival'
    },

    // [cite: 296] Inventory status tracking options
    inventoryStatuses: [
        { value: 'inStock', label: 'In Stock', color: '#22c55e' },
        { value: 'lowStock', label: 'Low Stock', color: '#f59e0b' },
        { value: 'outOfStock', label: 'Out of Stock', color: '#ef4444' },
        { value: 'discontinued', label: 'Discontinued', color: '#6b7280' }
    ],

    // Tagging system for storefront filtering
    tags: [
        'New Arrival', 'Trending', 'Premium', 'Sale', 
        'Limited Edition', 'Popular', 'Classic', 'Budget', 'Exclusive'
    ]
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminConfig;
}