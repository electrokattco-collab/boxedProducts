# Boxed Sneakers - Architecture Analysis & Two-Role System Design

## Executive Summary

The Boxed Sneakers application is a **production-ready e-commerce platform** built with vanilla JavaScript, Firebase Auth, Firestore, and Firebase Storage. The architecture is well-designed and already implements many enterprise-grade features including role-based access control, audit logging, and comprehensive security measures.

**Key Finding**: The application already HAS role-based authentication using Firebase custom claims. The main gaps are:
1. No centralized AuthContext for shared role state
2. Admin dashboard is product-only (missing orders, customers, analytics)
3. Orders are NOT persisted in Firestore (only localStorage + WhatsApp)
4. Limited role-based UI adaptations on customer side

---

## 1. Current Architecture Analysis

### 1.1 Authentication Provider
| Aspect | Current State |
|--------|--------------|
| **Provider** | Firebase Authentication |
| **Methods** | Email/Password, Google Sign-In |
| **Role Storage** | Firebase Auth Custom Claims (`claims.admin`) |
| **Persistence** | Local (remember me) or Session |
| **Rate Limiting** | ✅ 5 attempts per 15 min |

### 1.2 Database Structure (Firestore)

```
Firestore Collections:
├── products/          ✅ Complete CRUD, real-time sync
├── users/             ✅ User profiles
├── adminLogs/         ✅ Audit trail
└── orders/            ❌ NOT IMPLEMENTED
```

### 1.3 Current Routing System

| Page | File | Access | Protection |
|------|------|--------|------------|
| Storefront | `index.html` | Public | None |
| Login | `pages/login.html` | Public | Redirects if logged in |
| Admin Dashboard | `admin.html` | Admin Only | authGuard |
| Cart | `boxedCart.html` | Public | None |
| About | `boxedAboutUs.html` | Public | None |
| Contact | `boxedContacts.html` | Public | None |

### 1.4 Existing Security Measures

✅ **Already Implemented**:
- Firebase Auth custom claims for admin role
- Firestore security rules with role checks
- Rate limiting on login attempts
- Input validation and XSS sanitization
- CSP headers
- Audit logging for admin actions
- Session timeout (30 min) on admin pages

---

## 2. Authentication Flow (Current)

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User opens │────▶│  Firebase Auth  │────▶│  Check Claims   │
│  login page │     │  Sign In        │     │  getIdTokenResult│
└─────────────┘     └─────────────────┘     └────────┬────────┘
                                                      │
                           ┌──────────────────────────┼───────────┐
                           ▼                          ▼           ▼
                    ┌──────────┐               ┌──────────┐  ┌──────────┐
                    │ isAdmin  │               │ Customer │  │  Error   │
                    │ = true   │               │ isAdmin  │  │          │
                    └────┬─────┘               │ = false  │  └──────────┘
                         │                     └────┬─────┘
                         ▼                          ▼
                   ┌──────────┐               ┌──────────┐
                   │ admin.html│              │ index.html│
                   └──────────┘               └──────────┘
```

---

## 3. Weaknesses Identified

### 3.1 Critical Gaps

| Issue | Impact | Severity |
|-------|--------|----------|
| Orders not in Firestore | No order history, no admin order management | **High** |
| No centralized AuthContext | Duplicated auth checks across components | Medium |
| Admin dashboard limited | Only products, missing orders/customers/analytics | Medium |
| No customer order history | Customers can't view past orders | Medium |

### 3.2 Technical Debt

- No TypeScript (vanilla JS only)
- No test coverage for auth flows
- Some hardcoded paths in navigation
- Limited error boundaries

---

## 4. Required Changes

### 4.1 New Files to Create

```
src/
├── contexts/
│   └── AuthContext.js          # Centralized auth state with role info
├── services/
│   ├── orderService.js         # Order CRUD operations
│   ├── customerService.js      # Customer management for admin
│   └── analyticsService.js     # Dashboard statistics
├── layouts/
│   ├── AdminLayout.js          # Admin dashboard shell
│   └── CustomerLayout.js       # Customer page wrapper
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.js     # Navigation sidebar
│   │   ├── DashboardStats.js   # Stats cards
│   │   ├── OrdersTable.js      # Order management
│   │   ├── CustomersTable.js   # Customer list
│   │   └── RecentActivity.js   # Activity feed
│   └── shared/
│       ├── ProtectedRoute.js   # Route guard component
│       ├── RoleBadge.js        # Admin/Customer badge
│       └── UnauthorizedPage.js # 403 page
pages/
├── admin/
│   ├── dashboard.html          # Admin main dashboard
│   ├── orders.html             # Order management
│   ├── customers.html          # Customer list
│   └── settings.html           # Admin settings
└── unauthorized.html           # 403 access denied
```

### 4.2 Files to Modify

```
src/
├── auth/
│   ├── authGuard.js            # Enhance with Firestore role fallback
│   └── login.js                # Add post-login Firestore role check
├── services/
│   └── userService.js          # Add role field to user profiles
└── ui/
    └── header.js               # Show role-based navigation
admin.html                      # Expand to full dashboard
firestore.rules                 # Add orders collection rules
```

---

## 5. Implementation Plan

### Phase 1: Core Auth Infrastructure
1. Create `AuthContext.js` for centralized role state
2. Enhance `authGuard.js` with Firestore role fallback
3. Update `userService.js` to include role field

### Phase 2: Order System
1. Create `orderService.js` with full CRUD
2. Design orders collection schema
3. Integrate order creation from cart checkout
4. Add order history to customer profile

### Phase 3: Admin Dashboard Expansion
1. Create `AdminLayout.js` component
2. Build DashboardStats with real-time metrics
3. Implement OrdersTable with status management
4. Create CustomersTable for user management
5. Add RecentActivity feed

### Phase 4: Customer UI Improvements
1. Add order history page
2. Show role badges in UI
3. Improve profile management
4. Add wishlist functionality

### Phase 5: Security & Rules
1. Update Firestore security rules
2. Add role-based UI permissions
3. Implement proper error boundaries
4. Add loading states and skeletons

---

## 6. Database Schema (Proposed)

### 6.1 Users Collection (Enhanced)
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL: string,
  role: 'customer' | 'admin',  // NEW: Explicit role field
  emailVerified: boolean,
  provider: string,
  phoneNumber: string,      // NEW
  address: {                // NEW
    street: string,
    city: string,
    province: string,
    postalCode: string,
    country: string
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp    // NEW
}
```

### 6.2 Orders Collection (NEW)
```javascript
{
  id: string,
  userId: string,           // Customer UID
  userEmail: string,
  userName: string,
  items: [{
    productId: string,
    name: string,
    price: number,
    quantity: number,
    size: string,
    color: string,
    image: string
  }],
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentMethod: 'bank_transfer' | 'cash_on_delivery',
  subtotal: number,
  shipping: number,
  total: number,
  shippingAddress: {
    name: string,
    phone: string,
    street: string,
    city: string,
    province: string,
    postalCode: string
  },
  notes: string,            // Customer notes
  adminNotes: string,       // Internal admin notes
  timeline: [{              // Status history
    status: string,
    timestamp: timestamp,
    note: string,
    updatedBy: string
  }],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6.3 Products Collection (Existing)
```javascript
{
  id: string,
  name: string,
  price: number,
  description: string,
  category: string,
  tag: string,
  images: string[],
  inventoryStatus: 'inStock' | 'lowStock' | 'outOfStock' | 'discontinued',
  stockQuantity: number,
  isVisible: boolean,
  attributes: {},           // Category-specific
  lastUpdated: timestamp,
  updatedBy: string,
  adminNotes: string
}
```

---

## 7. Security Rules (Proposed)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.admin == true || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    function isCustomer() {
      return isAuthenticated() && !isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && 
        !request.resource.data.keys().hasAny(['role', 'admin', 'permissions']);
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['role', 'admin', 'permissions', 'uid', 'email']);
      allow delete: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;  // Public read
      allow write: if isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAdmin() || 
        (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin() || 
        (isOwner(resource.data.userId) && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['notes']));
      allow delete: if isAdmin();
    }
    
    // Admin logs
    match /adminLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update, delete: if false;
    }
  }
}
```

---

## 8. Deliverables Checklist

### Infrastructure
- [ ] AuthContext with role state
- [ ] Enhanced authGuard with Firestore fallback
- [ ] Firestore security rules
- [ ] ProtectedRoute component

### Admin Dashboard
- [ ] AdminLayout with sidebar navigation
- [ ] DashboardStats with real-time metrics
- [ ] OrdersTable with status management
- [ ] CustomersTable with user management
- [ ] RecentActivity feed
- [ ] Settings page

### Order System
- [ ] Order service with CRUD
- [ ] Order creation from cart
- [ ] Order status workflow
- [ ] Order history for customers
- [ ] Order notifications

### Customer UI
- [ ] Order history page
- [ ] Enhanced profile management
- [ ] Role badges
- [ ] Improved navigation

### Testing & Documentation
- [ ] Testing checklist
- [ ] Security audit
- [ ] Performance review

---

## 9. Future Scalability Recommendations

1. **Migrate to React/Vue**: The react-migration-starter folder suggests this is planned
2. **Cloud Functions**: Use Firebase Functions for order notifications, inventory updates
3. **Search**: Implement Algolia or Elasticsearch for product search
4. **Caching**: Add Redis for session and product caching
5. **CDN**: Use Firebase Hosting CDN for global asset delivery
6. **Monitoring**: Add Sentry for error tracking, Firebase Analytics for user behavior

---

*Analysis completed. Ready for implementation.*
