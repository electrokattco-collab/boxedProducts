/**
 * Custom hook for product data fetching
 * Combines Firebase real-time sync with React state
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeToProducts, fetchProducts } from '../api/products.api';

export const useProducts = (options = {}) => {
  const { 
    filters = {}, 
    subscribe = true,  // Use real-time by default
    initialFetch = true 
  } = options;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(initialFetch);
  const [error, setError] = useState(null);

  // One-time fetch (fallback for SSR or when real-time not needed)
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await fetchProducts(filters);
    
    if (result.success) {
      setProducts(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, [filters]);

  // Real-time subscription
  useEffect(() => {
    if (!subscribe) {
      if (initialFetch) {
        fetch();
      }
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToProducts((result) => {
      if (result.success) {
        setProducts(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, filters);

    return () => unsubscribe();
  }, [filters.isVisible, filters.category, subscribe, initialFetch, fetch]);

  // Filter products client-side
  const filterBySearch = useCallback((searchTerm) => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }, [products]);

  const filterByCategory = useCallback((category) => {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
  }, [products]);

  return {
    products,
    loading,
    error,
    fetch,
    filterBySearch,
    filterByCategory
  };
};
