# BoxedProducts Admin Dashboard

A lightweight, schema-driven admin panel for managing products across multiple categories.

## Quick Start

1. Open `admin.html` in your browser
2. Default password: `admin123` (change in admin.html)
3. Start managing products!

## Features

### Dynamic Category Support
The admin panel automatically generates appropriate form fields based on product category:

- **Shoes**: Sizes, Colors, Brand, Material
- **Electronics**: Brand, Warranty, Battery Life, Connectivity
- **Digital**: Format, Duration, Files, Access Duration
- **Furniture**: Material, Dimensions, Weight, Assembly
- **Clothing**: Sizes, Colors, Material, Care Instructions
- **Accessories**: Type, Material, Dimensions

### Admin Features
- ✅ Add/Edit/Delete products
- ✅ Inventory status tracking
- ✅ Stock quantity management
- ✅ Visibility toggle (hide from store)
- ✅ Admin notes for internal use
- ✅ Image URL management
- ✅ Category filtering
- ✅ Search functionality
- ✅ Export to JSON

### Data-Driven Architecture
Adding a new category requires ZERO code changes:
1. Edit `data/schema.json`
2. Add category definition with fields
3. UI automatically adapts!

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  admin.html  │────▶│  adminCRUD   │────▶│  Firebase    │
│  (UI Layer)  │     │  (Logic)     │     │  (Database)  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  adminUI     │
                     │  (Dynamic    │
                     │   Forms)     │
                     └──────────────┘
```

## File Structure

| File | Purpose |
|------|---------|
| `admin.html` | Main dashboard interface |
| `src/adminConfig.js` | Configuration & constants |
| `src/adminCRUD.js` | Create, Read, Update, Delete operations |
| `src/adminUI.js` | Dynamic UI generation |
| `data/schema.json` | Category field definitions |
| `data/products.json` | Sample product data |

## Data Model

Each product includes:
```javascript
{
  // Basic Info
  id, name, price, category, description, images, tag,
  
  // Admin Fields (NEW)
  inventoryStatus,  // inStock | lowStock | outOfStock | discontinued
  stockQuantity,    // number
  adminNotes,       // internal notes
  lastUpdated,      // ISO timestamp
  updatedBy,        // admin username
  isVisible         // show in store?
  
  // Category Attributes (Dynamic)
  attributes: { /* category-specific fields */ }
}
```

## Deployment Options

### Option 1: Firebase (Recommended)
- Real-time updates
- Cloud storage for images
- Authentication
- See ADMIN_GUIDE.md for setup

### Option 2: Static Files Only
- Uses localStorage
- No backend required
- Data persists in browser
- Export/Import JSON for backup

### Option 3: Custom Backend
- Replace `adminCRUD.js` methods
- Keep `adminUI.js` for dynamic forms
- API endpoints for CRUD operations

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Security Notes

**Current**: Simple password (client-side)
**Production**: Enable Firebase Authentication

To upgrade security:
1. Enable Firebase Auth in console
2. Uncomment auth code in admin.html
3. Update Firestore security rules

## Customization

### Change Admin Password
Edit `admin.html`:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### Add New Category
Edit `data/schema.json`:
```json
"newcategory": {
  "label": "Display Name",
  "icon": "fa-icon-name",
  "fields": [
    {
      "name": "fieldName",
      "type": "text",
      "label": "Field Label"
    }
  ]
}
```

### Modify Colors
Edit CSS variables in `admin.html`:
```css
:root {
  --primary: #0f1a2c;
  --accent: #ff7e3f;
  --success: #22c55e;
  --danger: #ef4444;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check password in admin.html |
| Products not saving | Check browser console for errors |
| Images not showing | Verify image paths in assets/ folder |
| Category fields not appearing | Check schema.json is valid JSON |

## Next Steps

1. Set up Firebase for production use
2. Add Firebase Authentication
3. Configure image upload to Firebase Storage
4. Update storefront to fetch from Firebase
5. Add user roles (admin, editor, viewer)

## License

Part of BoxedProducts - Premium e-commerce template
