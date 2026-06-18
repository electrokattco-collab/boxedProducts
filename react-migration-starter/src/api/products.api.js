/**
 * Products API - Firebase Firestore Operations
 * Replaces adminCRUD.js and productRenderer.js functionality
 */

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
} from 'firebase/firestore';
import { db } from './firebase.config';

const PRODUCTS_COLLECTION = 'products';
const productsRef = collection(db, PRODUCTS_COLLECTION);

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToProducts = (callback, filters = {}) => {
  const constraints = [orderBy('lastUpdated', 'desc')];
  
  if (filters.isVisible !== undefined) {
    constraints.push(where('isVisible', '==', filters.isVisible));
  }
  
  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }
  
  const q = query(productsRef, ...constraints);
  
  return onSnapshot(q, 
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ success: true, data: products });
    },
    (error) => {
      callback({ success: false, error: error.message });
    }
  );
};

// ==================== CRUD OPERATIONS ====================

export const fetchProducts = async (filters = {}) => {
  try {
    const constraints = [orderBy('lastUpdated', 'desc')];
    
    if (filters.isVisible) {
      constraints.push(where('isVisible', '==', true));
    }
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return {
      success: true,
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchProductById = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Product not found' };
    }
    
    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createProduct = async (productData) => {
  try {
    const enrichedData = {
      ...productData,
      inventoryStatus: productData.inventoryStatus || 'inStock',
      stockQuantity: productData.stockQuantity || 10,
      isVisible: productData.isVisible !== undefined ? productData.isVisible : true,
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    let docRef;
    if (productData.id) {
      docRef = doc(productsRef, productData.id);
      await setDoc(docRef, enrichedData);
    } else {
      docRef = await addDoc(productsRef, enrichedData);
    }
    
    return {
      success: true,
      id: docRef.id,
      data: { ...enrichedData, id: docRef.id }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (productId, updates) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const enrichedUpdates = {
      ...updates,
      lastUpdated: serverTimestamp()
    };
    
    await updateDoc(docRef, enrichedUpdates);
    return { success: true, id: productId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bulkUpdateProducts = async (productIds, updates) => {
  try {
    const batch = writeBatch(db);
    
    for (const productId of productIds) {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      batch.update(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    }
    
    await batch.commit();
    return { success: true, updated: productIds.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bulkDeleteProducts = async (productIds) => {
  try {
    const batch = writeBatch(db);
    
    for (const productId of productIds) {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      batch.delete(docRef);
    }
    
    await batch.commit();
    return { success: true, deleted: productIds.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
