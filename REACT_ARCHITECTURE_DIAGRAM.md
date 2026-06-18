# React Migration Architecture Diagram

## Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           React Application                                  │
│                         (Single Page Application)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          BrowserRouter                                │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        App Component                            │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                   Context Providers                       │  │  │  │
│  │  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │  │  │
│  │  │  │  │  AuthContext │  │  CartContext │  │  QueryClient   │  │  │  │  │
│  │  │  │  └──────────────┘  └──────────────┘  └────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────┘  │  │  │
│  │  │                              │                                  │  │  │
│  │  │                              ▼                                  │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                      Layout Layer                         │  │  │  │
│  │  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │  │  │
│  │  │  │  │    Header    │  │     Main     │  │    Footer    │   │  │  │  │
│  │  │  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────┘  │  │  │
│  │  │                              │                                  │  │  │
│  │  │                              ▼                                  │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                     Routing Layer                         │  │  │  │
│  │  │  │  ┌─────┐ ┌─────┐ ┌───────┐ ┌─────┐ ┌───────┐ ┌────────┐ │  │  │  │
│  │  │  │  │Home │ │About│ │Contact│ │Cart │ │Login  │ │  Admin │ │  │  │  │
│  │  │  │  └─────┘ └─────┘ └───────┘ └─────┘ └───────┘ └────────┘ │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Services Layer                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │   Firebase Auth    │  │  Firestore (DB)    │  │  Firebase Storage  │    │
│  │                    │  │                    │  │                    │    │
│  │  • loginWithEmail  │  │  • Real-time sync  │  │  • Image upload    │    │
│  │  • loginWithGoogle │  │  • CRUD operations │  │  • File storage    │    │
│  │  • logout          │  │  • Query/filter    │  │                    │    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (Root)
├── BrowserRouter
│   └── QueryClientProvider
│       └── AuthProvider
│           └── CartProvider
│               └── HelmetProvider
│                   ├── Header (Layout)
│                   │   ├── Logo
│                   │   ├── Navigation
│                   │   └── CartBadge
│                   │
│                   ├── Routes (Switch based on URL)
│                   │   ├── / → Home
│                   │   │   ├── Hero
│                   │   │   ├── FilterChips
│                   │   │   ├── SearchBar
│                   │   │   └── ProductGrid
│                   │   │       └── ProductCard[]
│                   │   │           └── QuickViewButton
│                   │   │
│                   │   ├── /about → About
│                   │   │   ├── Hero
│                   │   │   ├── CompanyStory
│                   │   │   ├── PaymentSecurity
│                   │   │   └── RefundPolicy
│                   │   │
│                   │   ├── /contact → Contact
│                   │   │   ├── QuickActions
│                   │   │   ├── ContactForm
│                   │   │   └── ContactInfo
│                   │   │
│                   │   ├── /cart → Cart
│                   │   │   ├── CartItemList
│                   │   │   │   └── CartItem[]
│                   │   │   ├── CartSummary
│                   │   │   └── PaymentInfo
│                   │   │
│                   │   ├── /login → Login
│                   │   │   ├── LoginForm
│                   │   │   └── GoogleButton
│                   │   │
│                   │   └── /admin → Admin (Protected)
│                   │       ├── StatsCards
│                   │       ├── ProductTable
│                   │       └── ProductModal (Add/Edit)
│                   │
│                   └── Footer (Layout)
│                       ├── TrustSection
│                       └── FooterLinks
```

## Data Flow

```
User Action
     │
     ▼
┌─────────────────┐
│   Component     │
│   (UI Layer)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│     Context     │◄────│  Custom Hook    │
│   (State Mgmt)  │     │  (Business Logic)│
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Firebase API  │
│   (Data Layer)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │
│   (Database)    │
└─────────────────┘
```

## State Management Architecture

### Auth State Flow
```
Firebase Auth
     │ onAuthStateChanged
     ▼
AuthContext (Provider)
     │ user, isAdmin, isAuthenticated
     ▼
useAuth Hook
     │
     ├──► Header (show login/logout)
     ├──► ProtectedRoute (auth check)
     └──► AdminRoute (admin check)
```

### Cart State Flow
```
User Action (Add/Remove/Update)
     │
     ▼
CartContext (Provider)
     │ cart[], addToCart(), removeFromCart(), updateQuantity()
     ▼
useCart Hook
     │
     ├──► Header (cart badge count)
     ├──► ProductCard (add to cart)
     ├──► ProductModal (add with size/color)
     └──► CartPage (display items, totals)
     │
     ▼
LocalStorage (Persistence)
```

### Product State Flow
```
Firestore
     │ onSnapshot (real-time)
     ▼
useProducts Hook
     │ products, loading, error
     ▼
     ├──► Home (product grid)
     ├──► ProductCard (individual products)
     └──► Admin (product table)
```

## File Organization by Feature

```
src/
├── api/                          # Data access layer
│   ├── firebase.config.js        # SDK initialization
│   ├── products.api.js           # Product CRUD
│   └── auth.api.js               # Auth operations
│
├── components/                   # UI components
│   ├── common/                   # Shared UI elements
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Toast/
│   │
│   ├── layout/                   # Page layout
│   │   ├── Header/
│   │   └── Footer/
│   │
│   └── product/                  # Product-specific
│       ├── ProductCard/
│       ├── ProductGrid/
│       ├── ProductModal/
│       └── ProductFilters/
│
├── contexts/                     # Global state
│   ├── AuthContext.jsx           # Auth state
│   └── CartContext.jsx           # Cart state
│
├── hooks/                        # Custom hooks
│   ├── useAuth.js                # Auth hook
│   ├── useCart.js                # Cart hook
│   ├── useProducts.js            # Products hook
│   └── useLocalStorage.js        # Persistence hook
│
├── pages/                        # Route components
│   ├── Home/
│   ├── About/
│   ├── Contact/
│   ├── Cart/
│   ├── Login/
│   └── Admin/
│
├── routes/                       # Routing
│   ├── AppRoutes.jsx             # Route definitions
│   ├── ProtectedRoute.jsx        # Auth guard
│   └── AdminRoute.jsx            # Admin guard
│
└── styles/                       # Styling
    ├── global.css                # Global styles
    └── variables.css             # CSS variables
```

## Technology Stack Layers

```
┌────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  React Components (JSX) + CSS Modules                   │  │
│  │  • Functional components with hooks                     │  │
│  │  • CSS Modules for scoped styling                       │  │
│  └─────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                         State Layer                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  React Context + Hooks                                  │  │
│  │  • AuthContext for user state                           │  │
│  │  • CartContext for shopping cart                        │  │
│  │  • Custom hooks for data fetching                       │  │
│  └─────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                        Routing Layer                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  React Router v6                                        │  │
│  │  • Declarative routing                                  │  │
│  │  • Protected routes                                     │  │
│  │  • Route guards                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                       Data Layer                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Firebase SDK (npm package)                             │  │
│  │  • Firebase Auth (authentication)                       │  │
│  │  • Firestore (database)                                 │  │
│  │  • Firebase Storage (file uploads)                      │  │
│  └─────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                       Build Layer                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Vite                                                   │  │
│  │  • Fast development server                              │  │
│  │  • Optimized production builds                          │  │
│  │  • Hot module replacement                               │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Migration Mapping

| Static (HTML/JS) | React Equivalent |
|------------------|------------------|
| `index.html` | `pages/Home/Home.jsx` |
| `boxedAboutUs.html` | `pages/About/About.jsx` |
| `boxedContacts.html` | `pages/Contact/Contact.jsx` |
| `boxedCart.html` | `pages/Cart/Cart.jsx` |
| `pages/login.html` | `pages/Login/Login.jsx` |
| `admin.html` | `pages/Admin/Admin.jsx` |
| `.glass-header` | `components/layout/Header` |
| `.product-card` | `components/product/ProductCard` |
| `#productModal` | `components/product/ProductModal` |
| `src/auth/*.js` | `contexts/AuthContext.jsx` |
| `localStorage cart` | `contexts/CartContext.jsx` |
| `src/productRenderer.js` | `hooks/useProducts.js` |
| `src/adminCRUD.js` | `api/products.api.js` |
| Inline styles | CSS Modules |
| Page navigation | `react-router-dom` |
| `<script>` tags | Component lifecycle |

---

*This architecture supports scalability, maintainability, and modern React best practices.*
