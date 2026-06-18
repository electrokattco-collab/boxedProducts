# Boxed Sneakers - React Migration Starter

A complete starter template for migrating the static Boxed Sneakers e-commerce site to React.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 3. Copy assets from original project
cp -r ../assets public/

# 4. Start development server
npm run dev
```

## Project Structure

```
src/
├── api/               # Firebase API wrappers
├── components/        # Reusable components
│   ├── common/        # Button, Input, Modal, etc.
│   ├── layout/        # Header, Footer
│   └── product/       # ProductCard, ProductGrid, etc.
├── contexts/          # React Context (Auth, Cart)
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── routes/            # Routing config
├── styles/            # Global styles
└── utils/             # Utility functions
```

## Migration Checklist

- [x] Project setup (Vite + React)
- [x] Firebase configuration
- [x] Routing setup
- [x] AuthContext
- [x] CartContext
- [x] Header component
- [ ] Footer component
- [ ] ProductCard component
- [ ] ProductModal component
- [ ] Home page
- [ ] About page
- [ ] Contact page
- [ ] Cart page
- [ ] Login page
- [ ] Admin page
- [ ] Protected routes

## Key Files

| File | Purpose |
|------|---------|
| `src/api/firebase.config.js` | Firebase SDK initialization |
| `src/api/products.api.js` | Firestore CRUD operations |
| `src/contexts/AuthContext.jsx` | Authentication state |
| `src/contexts/CartContext.jsx` | Shopping cart state |
| `src/hooks/useProducts.js` | Product data fetching |
| `src/routes/AppRoutes.jsx` | Route definitions |

## Environment Variables

Create `.env` file with:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

## Next Steps

1. Complete the Footer component
2. Create ProductCard and ProductModal
3. Implement remaining pages
4. Add tests
5. Deploy to Firebase Hosting

See `REACT_MIGRATION_GUIDE.md` for complete migration documentation.
