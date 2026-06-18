# React Migration Guide - Boxed Sneakers E-commerce

A comprehensive guide for migrating the static HTML/CSS/JS site to a dynamic React application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Migration Steps](#migration-steps)
5. [Component Mapping](#component-mapping)
6. [State Management](#state-management)
7. [Firebase Integration](#firebase-integration)
8. [Routing](#routing)
9. [Styling Strategy](#styling-strategy)
10. [Code Examples](#code-examples)

---

## Architecture Overview

### Current State (Static)
```
┌─────────────────────────────────────────────────────────┐
│  HTML Pages (index.html, cart.html, etc.)               │
│  ├─ Vanilla JavaScript (DOM manipulation)               │
│  ├─ CSS in <style> tags                                 │
│  └─ Firebase SDK via CDN                                │
└─────────────────────────────────────────────────────────┘
```

### Target State (React)
```
┌─────────────────────────────────────────────────────────┐
│  React App                                              │
│  ├─ Component-Based Architecture                        │
│  ├─ React Hooks for State Management                    │
│  ├─ React Router for Navigation                         │
│  ├─ Firebase SDK (npm package)                          │
│  └─ CSS Modules / Styled Components                     │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | ^18.2.0 |
| React DOM | DOM Renderer | ^18.2.0 |
| React Router DOM | Client-side Routing | ^6.20.0 |
| Vite | Build Tool | ^5.0.0 |

### State Management
| Technology | Purpose |
|------------|---------|
| React Context API | Global State (Auth, Cart) |
| Zustand / Redux Toolkit | Optional: Complex State |
| React Query | Server State (Firebase) |

### Firebase
| Package | Purpose |
|---------|---------|
| firebase | Core SDK |
| @react-firebase/hooks | React Firebase bindings |

### Styling
| Technology | Purpose |
|------------|---------|
| CSS Modules | Component-scoped styles |
| CSS Variables | Theme consistency |
| Tailwind CSS | Optional: Utility-first styling |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit Testing |
| React Testing Library | Component Testing |
| Playwright | E2E Testing |

---

## Project Structure

```
boxed-products-react/
├── public/
│   ├── assets/                  # Static assets (images, fonts)
│   └── favicon.ico
├── src/
│   ├── api/                     # Firebase API wrappers
│   │   ├── firebase.config.js
│   │   ├── products.api.js
│   │   ├── auth.api.js
│   │   └── cart.api.js
│   ├── components/              # Reusable components
│   │   ├── common/              # Shared UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   └── index.js
│   │   ├── layout/              # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── index.js
│   │   └── product/             # Product-specific components
│   │       ├── ProductCard/
│   │       ├── ProductGrid/
│   │       ├── ProductModal/
│   │       ├── ProductFilters/
│   │       └── index.js
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── ProductContext.jsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   ├── useProducts.js
│   │   └── useLocalStorage.js
│   ├── pages/                   # Page components
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── Cart/
│   │   ├── Login/
│   │   ├── Admin/
│   │   └── index.js
│   ├── routes/                  # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── styles/                  # Global styles
│   │   ├── variables.css
│   │   ├── global.css
│   │   └── reset.css
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Migration Steps

### Phase 1: Project Setup (1-2 days)

```bash
# 1. Create Vite project
npm create vite@latest boxed-products-react -- --template react

# 2. Install dependencies
cd boxed-products-react
npm install

# 3. Install additional packages
npm install react-router-dom firebase react-firebase-hooks
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 4. Copy assets
mkdir -p public/assets
cp -r ../boxedProducts/assets/* public/assets/
```

### Phase 2: Core Infrastructure (2-3 days)

1. **Firebase Configuration**
   - Move Firebase config from `src/firebaseConfig.js` to React
   - Create API wrapper functions
   - Set up Firebase Auth provider

2. **Routing Setup**
   - Create route definitions
   - Implement protected routes for admin
   - Set up route guards

3. **Global State**
   - Create AuthContext
   - Create CartContext with localStorage persistence
   - Create ProductContext

### Phase 3: Component Migration (5-7 days)

Migrate pages in this order:
1. Layout components (Header, Footer)
2. Static pages (About, Contact)
3. Product listing (Home)
4. Product details (Modal)
5. Cart functionality
6. Authentication (Login)
7. Admin dashboard

### Phase 4: Testing & Polish (2-3 days)

1. Unit tests for utilities
2. Component tests with React Testing Library
3. E2E tests with Playwright
4. Performance optimization
5. SEO improvements (React Helmet)

---

## Component Mapping

### HTML to React Components

| HTML Element | React Component | Location |
|--------------|-----------------|----------|
| `.glass-header` | `<Header />` | `components/layout/Header` |
| `.nav-links` | `<Navigation />` | `components/layout/Header/Navigation.jsx` |
| `.product-card` | `<ProductCard />` | `components/product/ProductCard` |
| `#product-grid` | `<ProductGrid />` | `components/product/ProductGrid` |
| `#productModal` | `<ProductModal />` | `components/product/ProductModal` |
| `#searchInput` | `<SearchBar />` | `components/common/SearchBar` |
| `.chip` | `<FilterChip />` | `components/product/FilterChip` |
| `.cart-item-row` | `<CartItem />` | `components/cart/CartItem` |
| `footer` | `<Footer />` | `components/layout/Footer` |
| `#contactForm` | `<ContactForm />` | `components/forms/ContactForm` |
| `#loginForm` | `<LoginForm />` | `components/forms/LoginForm` |

### CSS to CSS Modules Mapping

```css
/* Before: index.html inline styles */
.product-card { ... }

/* After: ProductCard.module.css */
.productCard { ... }  /* camelCase in modules */
```

---

## State Management

### Current State (Vanilla JS)
```javascript
// Cart stored in localStorage
const cart = JSON.parse(localStorage.getItem('sneakerCart'));

// Products fetched and rendered directly
fetch('data/products.json')
  .then(res => res.json())
  .then(products => renderProducts(products));
```

### React State Architecture

```jsx
// contexts/CartContext.jsx
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage('cart', []);
  
  const addToCart = (product, size, color) => {
    setCart(prev => [...prev, { ...product, size, color }]);
  };
  
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };
  
  const updateQuantity = (itemId, quantity) => {
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };
  
  const clearCart = () => setCart([]);
  
  const cartTotal = cart.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
```

### Using React Query for Firebase

```jsx
// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProduct } from '../api/products.api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

---

## Firebase Integration

### Current Implementation (CDN)
```javascript
// Using Firebase SDK via CDN with ES modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
```

### React Implementation (npm)

```javascript
// src/api/firebase.config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Real-time Products Hook

```jsx
// hooks/useRealtimeProducts.js
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase.config';

export const useRealtimeProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Build query based on filters
    let q = collection(db, 'products');
    const constraints = [where('isVisible', '==', true), orderBy('lastUpdated', 'desc')];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    q = query(q, ...constraints);
    
    // Real-time subscription
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.category]);

  return { products, loading, error };
};
```

---

## Routing

### Route Configuration

```jsx
// routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

import {
  Home,
  About,
  Contact,
  Cart,
  Login,
  Admin,
  NotFound
} from '../pages';

export const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/login" element={<Login />} />
    
    {/* Protected Admin Routes */}
    <Route path="/admin" element={
      <AdminRoute>
        <Admin />
      </AdminRoute>
    } />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
```

### Protected Route Component

```jsx
// routes/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return children;
};
```

---

## Styling Strategy

### Option 1: CSS Modules (Recommended)

```css
/* ProductCard.module.css */
.productCard {
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  padding: 18px 16px 22px;
  box-shadow: var(--shadow-md);
  transition: all 0.28s ease;
}

.productCard:hover {
  transform: translateY(-8px);
  border-color: var(--accent);
}

.badge {
  background: var(--badge);
  color: #fff;
  font-size: 0.72rem;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
}
```

```jsx
// ProductCard.jsx
import styles from './ProductCard.module.css';

export const ProductCard = ({ product }) => (
  <article className={styles.productCard}>
    <span className={styles.badge}>{product.tag}</span>
    {/* ... */}
  </article>
);
```

### Option 2: Tailwind CSS

```jsx
// ProductCard.jsx with Tailwind
export const ProductCard = ({ product }) => (
  <article className="
    bg-white/90 backdrop-blur-sm rounded-3xl p-5
    shadow-lg transition-all duration-300
    hover:-translate-y-2 hover:border-orange-400
  ">
    <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full">
      {product.tag}
    </span>
    {/* ... */}
  </article>
);
```

---

## Code Examples

### Product Card Component

```jsx
// components/product/ProductCard/ProductCard.jsx
import { useState } from 'react';
import { useCart } from '../../../hooks/useCart';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    onQuickView(product); // Open modal for size/color selection
  };
  
  const isOutOfStock = product.inventoryStatus === 'outOfStock';
  
  return (
    <article className={styles.productCard} data-product-id={product.id}>
      <div className={styles.productTop}>
        <span className={styles.badge}>{product.tag || 'New'}</span>
        <button 
          className={styles.quickViewBtn}
          onClick={() => onQuickView(product)}
          aria-label={`Quick view ${product.name}`}
        >
          <i className="fas fa-expand" />
        </button>
      </div>
      
      <img 
        src={product.images?.[0] || '/assets/placeholder.jpg'} 
        alt={product.name}
        className={styles.image}
        onError={(e) => { e.target.src = '/assets/placeholder.jpg'; }}
      />
      
      <h3 className={styles.title}>{product.name}</h3>
      
      <div className={styles.meta}>
        <div className={styles.price}>
          R {product.price.toFixed(2)}
        </div>
      </div>
      
      <div className={styles.delivery}>
        <i className="fas fa-truck" /> Free delivery nationwide
      </div>
      
      <button 
        className={styles.addBtn}
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to bag'}
      </button>
    </article>
  );
};
```

### Cart Context Provider

```jsx
// contexts/CartContext.jsx
import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage('cart', {
    items: [],
    version: 1,
    savedAt: null
  });

  const addToCart = useCallback((product, size, color, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.items.find(
        item => item.id === product.id && 
                item.size === size && 
                item.color === color
      );
      
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === product.id && 
            item.size === size && 
            item.color === color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          savedAt: new Date().toISOString()
        };
      }
      
      return {
        ...prev,
        items: [...prev.items, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          color,
          quantity
        }],
        savedAt: new Date().toISOString()
      };
    });
  }, [setCart]);

  const removeFromCart = useCallback((itemId, size, color) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(
        item => !(item.id === itemId && 
                  item.size === size && 
                  item.color === color)
      ),
      savedAt: new Date().toISOString()
    }));
  }, [setCart]);

  const updateQuantity = useCallback((itemId, size, color, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId, size, color);
      return;
    }
    
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId && 
        item.size === size && 
        item.color === color
          ? { ...item, quantity }
          : item
      ),
      savedAt: new Date().toISOString()
    }));
  }, [setCart, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({ items: [], version: 1, savedAt: new Date().toISOString() });
  }, [setCart]);

  const cartTotal = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  const itemCount = cart.items.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  return (
    <CartContext.Provider value={{
      cart: cart.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount
    }}>
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
```

---

## Environment Variables

```bash
# .env.example
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## Package.json Template

```json
{
  "name": "boxed-products-react",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "firebase": "^10.7.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-firebase-hooks": "^5.1.1",
    "react-helmet-async": "^2.0.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jsdom": "^23.0.0",
    "playwright": "^1.40.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Migration Checklist

- [ ] Set up Vite + React project
- [ ] Install all dependencies
- [ ] Configure Firebase SDK (npm version)
- [ ] Copy assets to public folder
- [ ] Create global styles (CSS variables)
- [ ] Set up routing
- [ ] Create AuthContext
- [ ] Create CartContext
- [ ] Migrate Header component
- [ ] Migrate Footer component
- [ ] Migrate ProductCard component
- [ ] Migrate ProductGrid with real-time sync
- [ ] Migrate ProductModal
- [ ] Migrate Home page
- [ ] Migrate About page
- [ ] Migrate Contact page
- [ ] Migrate Cart page
- [ ] Migrate Login page
- [ ] Migrate Admin dashboard
- [ ] Set up protected routes
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Performance optimization
- [ ] Deploy to hosting

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Setup | 1-2 days | Project init, dependencies, Firebase config |
| Core | 2-3 days | Routing, contexts, hooks |
| Components | 5-7 days | Migrate all UI components |
| Testing | 2-3 days | Unit, integration, E2E tests |
| **Total** | **10-15 days** | |

---

## Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Firebase React Guide](https://firebase.google.com/docs/web/setup)
- [Vite Guide](https://vitejs.dev/guide/)

---

*Generated for Boxed Sneakers E-commerce Migration*
