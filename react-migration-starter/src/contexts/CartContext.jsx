/**
 * Cart Context
 * Replaces cart functionality from index.html and boxedCart.html
 */

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'sneakerCart';

const validateCartItem = (item) => {
  return item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    item.price >= 0;
};

const sanitizeCartItem = (item) => ({
  id: String(item.id).substring(0, 100),
  name: String(item.name).substring(0, 200),
  price: Math.max(0, parseFloat(item.price) || 0),
  quantity: Math.min(99, Math.max(1, parseInt(item.quantity) || 1)),
  image: item.image ? String(item.image).substring(0, 500) : '',
  size: item.size ? String(item.size).substring(0, 20) : null,
  color: item.color ? String(item.color).substring(0, 50) : null
});

export const CartProvider = ({ children }) => {
  const [cartData, setCartData] = useLocalStorage(CART_STORAGE_KEY, {
    items: [],
    version: 1,
    savedAt: null
  });

  const cart = useMemo(() => {
    // Validate and sanitize on read
    if (!cartData?.items || !Array.isArray(cartData.items)) {
      return [];
    }
    return cartData.items.filter(validateCartItem).map(sanitizeCartItem);
  }, [cartData]);

  const saveCart = useCallback((items) => {
    const sanitized = items.map(sanitizeCartItem);
    setCartData({
      items: sanitized,
      version: 1,
      savedAt: new Date().toISOString()
    });
  }, [setCartData]);

  const addToCart = useCallback((product, size, color, quantity = 1) => {
    const existingIndex = cart.findIndex(
      item => item.id === product.id && 
              item.size === size && 
              item.color === color
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        size,
        color,
        quantity
      }]);
    }
  }, [cart, saveCart]);

  const removeFromCart = useCallback((productId, size, color) => {
    saveCart(cart.filter(
      item => !(item.id === productId && 
                item.size === size && 
                item.color === color)
    ));
  }, [cart, saveCart]);

  const updateQuantity = useCallback((productId, size, color, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    
    saveCart(cart.map(item =>
      item.id === productId && 
      item.size === size && 
      item.color === color
        ? { ...item, quantity }
        : item
    ));
  }, [cart, saveCart, removeFromCart]);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, [saveCart]);

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const itemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
    isEmpty: cart.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
