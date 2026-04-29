// adminCRUD.js
// CRUD Operations for Admin Dashboard - Firebase Firestore (Modular SDK v9+)
// Uses: addDoc, getDocs, updateDoc, deleteDoc, onSnapshot for real-time sync
// Maintains Data-Driven Architecture with dynamic category support
// SECURITY: Uses Firebase Auth for user identification, no localStorage fallbacks

import { 
    collection, 
    doc, 
    addDoc, 
    setDoc,
    getDocs, 
    getDoc,
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';
import { db, storage } from './firebaseConfig.js';

class ProductAdmin {
    constructor() {
        this.db = db;
        this.storage = storage;
        this.isInitialized = true;
        this.productsCache = [];
        this.unsubscribe = null; // For real-time listener
        
        // Collection references
        this.productsCollection = collection(this.db, 'products');
        this.logsCollection = collection(this.db, 'adminLogs');
    }

    // ==================== REAL-TIME SYNC ====================
    
    /**
     * Subscribe to real-time product updates
     * @param {function} callback - Called whenever products change
     * @returns {function} Unsubscribe function
     */
    subscribeToProducts(callback) {
        const q = query(this.productsCollection, orderBy('lastUpdated', 'desc'));
        
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            this.productsCache = products;
            callback({ success: true, data: products });
        }, (error) => {
            console.error('[AdminCRUD] Real-time sync error:', error);
            callback({ success: false, error: error.message });
        });

        return this.unsubscribe;
    }

    /**
     * Stop real-time updates
     */
    unsubscribeFromProducts() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    // ==================== CREATE ====================
    
    /**
     * Create a new product in Firestore
     * Uses: addDoc() for auto-generated ID or setDoc() for custom ID
     */
    async createProduct(productData) {
        try {
            // Validate required fields
            const required = ['name', 'price', 'category'];
            for (const field of required) {
                if (!productData[field]) {
                    throw new Error(`Required field missing: ${field}`);
                }
            }

            // Add admin tracking fields with server timestamp
            const enrichedData = {
                ...productData,
                inventoryStatus: productData.inventoryStatus || 'inStock',
                stockQuantity: productData.stockQuantity || 10,
                isVisible: productData.isVisible !== undefined ? productData.isVisible : true,
                lastUpdated: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedBy: this.getCurrentUser()
            };

            // If ID provided, use doc() + set(), otherwise addDoc() for auto-ID
            let docRef;
            if (productData.id) {
                docRef = doc(this.productsCollection, productData.id);
                await setDoc(docRef, enrichedData);
            } else {
                docRef = await addDoc(this.productsCollection, enrichedData);
            }

            // Log the action
            await this.logAction('CREATE', docRef.id, enrichedData.name);

            return { 
                success: true, 
                id: docRef.id, 
                data: { ...enrichedData, id: docRef.id }
            };
        } catch (error) {
            console.error('[AdminCRUD] Create failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== READ ====================

    /**
     * Get all products from Firestore
     * Uses: getDocs() with query
     */
    async getAllProducts() {
        try {
            const q = query(this.productsCollection, orderBy('lastUpdated', 'desc'));
            const snapshot = await getDocs(q);

            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });

            this.productsCache = products;
            return { success: true, data: products };
        } catch (error) {
            console.error('[AdminCRUD] Read failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get a single product by ID
     * Uses: getDoc() with doc reference
     */
    async getProductById(productId) {
        try {
            const docRef = doc(this.productsCollection, productId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                return { success: false, error: 'Product not found' };
            }

            return { 
                success: true, 
                data: { id: docSnap.id, ...docSnap.data() } 
            };
        } catch (error) {
            console.error('[AdminCRUD] Get by ID failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get products filtered by category
     * Uses: query() with where() clause
     */
    async getProductsByCategory(category) {
        try {
            const q = query(
                this.productsCollection, 
                where('category', '==', category),
                orderBy('lastUpdated', 'desc')
            );
            const snapshot = await getDocs(q);

            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: products };
        } catch (error) {
            console.error('[AdminCRUD] Get by category failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get only visible products (for storefront)
     * Uses: query() with where() clauses
     */
    async getVisibleProducts() {
        try {
            const q = query(
                this.productsCollection,
                where('isVisible', '==', true),
                orderBy('lastUpdated', 'desc')
            );
            const snapshot = await getDocs(q);

            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: products };
        } catch (error) {
            console.error('[AdminCRUD] Get visible products failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== UPDATE ====================

    /**
     * Update a product
     * Uses: updateDoc() with doc reference
     */
    async updateProduct(productId, updates) {
        try {
            const docRef = doc(this.productsCollection, productId);
            
            // Add admin tracking fields
            const enrichedUpdates = {
                ...updates,
                lastUpdated: serverTimestamp(),
                updatedBy: this.getCurrentUser()
            };

            await updateDoc(docRef, enrichedUpdates);
            
            // Log the action
            await this.logAction('UPDATE', productId, updates.name || 'Unknown');

            return { success: true, id: productId };
        } catch (error) {
            console.error('[AdminCRUD] Update failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk update product status
     * Uses: writeBatch() for atomic multi-document updates
     */
    async bulkUpdateStatus(productIds, newStatus) {
        try {
            const batch = writeBatch(this.db);

            for (const productId of productIds) {
                const docRef = doc(this.productsCollection, productId);
                batch.update(docRef, {
                    inventoryStatus: newStatus,
                    lastUpdated: serverTimestamp(),
                    updatedBy: this.getCurrentUser()
                });
            }

            await batch.commit();
            await this.logAction('BULK_UPDATE', productIds.join(','), `Status changed to ${newStatus}`);

            return { success: true, updated: productIds.length };
        } catch (error) {
            console.error('[AdminCRUD] Bulk update failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== DELETE ====================

    /**
     * Delete a product
     * Uses: deleteDoc() with doc reference
     */
    async deleteProduct(productId) {
        try {
            // Get product name before deletion for logging
            const product = await this.getProductById(productId);
            const productName = product.success ? product.data.name : 'Unknown';

            const docRef = doc(this.productsCollection, productId);
            await deleteDoc(docRef);
            
            // Log the action
            await this.logAction('DELETE', productId, productName);

            return { success: true };
        } catch (error) {
            console.error('[AdminCRUD] Delete failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk delete products
     * Uses: writeBatch() for atomic deletes
     */
    async bulkDelete(productIds) {
        try {
            const batch = writeBatch(this.db);

            for (const productId of productIds) {
                const docRef = doc(this.productsCollection, productId);
                batch.delete(docRef);
            }

            await batch.commit();
            await this.logAction('BULK_DELETE', productIds.join(','), `Deleted ${productIds.length} products`);

            return { success: true, deleted: productIds.length };
        } catch (error) {
            console.error('[AdminCRUD] Bulk delete failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== IMAGE UPLOAD ====================

    /**
     * Upload image to Firebase Storage
     */
    async uploadImage(file, productId) {
        try {
            // Validate file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Allowed: JPG, PNG, WebP');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File too large. Max size: 5MB');
            }

            const fileName = `${productId}-${Date.now()}.${file.name.split('.').pop()}`;
            const filePath = `assets/products/${fileName}`;
            
            const storageRef = ref(this.storage, filePath);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            return { 
                success: true, 
                url: downloadURL,
                path: filePath 
            };
        } catch (error) {
            console.error('[AdminCRUD] Image upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete image from Firebase Storage
     */
    async deleteImage(imagePath) {
        try {
            const storageRef = ref(this.storage, imagePath);
            await deleteObject(storageRef);
            return { success: true };
        } catch (error) {
            console.error('[AdminCRUD] Image delete failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== AUTH & USER METHODS ====================

    /**
     * Get current authenticated user from Firebase Auth
     * SECURITY: Returns 'system' only if auth is unavailable (should never happen in production)
     * @returns {string} User email or UID for audit logging
     */
    getCurrentUser() {
        // Access auth from window object (set by firebaseConfig.js)
        const authModule = window._firebaseAuth;
        if (authModule && authModule.auth && authModule.auth.currentUser) {
            const user = authModule.auth.currentUser;
            // Prefer email for readability in logs, fallback to UID
            return user.email || user.uid;
        }
        // This should only happen if called before auth initializes
        console.warn('[AdminCRUD] No authenticated user found, using system fallback');
        return 'system';
    }

    // ==================== LOGGING ====================

    /**
     * Log admin actions to Firestore
     */
    async logAction(action, productId, details) {
        try {
            const logEntry = {
                action,
                productId,
                details,
                timestamp: serverTimestamp(),
                user: this.getCurrentUser()
            };

            await addDoc(this.logsCollection, logEntry);
        } catch (error) {
            console.error('[AdminCRUD] Log action failed:', error);
        }
    }

    /**
     * Get recent activity logs
     */
    async getRecentLogs(limit = 50) {
        try {
            const q = query(this.logsCollection, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);

            const logs = [];
            snapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: logs.slice(0, limit) };
        } catch (error) {
            console.error('[AdminCRUD] Get logs failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== EXPORT/IMPORT ====================

    // Export products to JSON (for backup)
    async exportToJSON() {
        try {
            const result = await this.getAllProducts();
            if (!result.success) throw new Error(result.error);

            const dataStr = JSON.stringify(result.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `products-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            console.error('[AdminCRUD] Export failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Import products from JSON
    async importFromJSON(jsonData) {
        try {
            const products = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!Array.isArray(products)) {
                throw new Error('Invalid JSON format: expected array');
            }

            const results = [];
            for (const product of products) {
                const result = await this.createProduct(product);
                results.push(result);
            }

            const successCount = results.filter(r => r.success).length;
            return {
                success: true,
                imported: successCount,
                failed: results.length - successCount
            };
        } catch (error) {
            console.error('[AdminCRUD] Import failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const productAdmin = new ProductAdmin();

// Export for module usage
export { ProductAdmin, productAdmin };
