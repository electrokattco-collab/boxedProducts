/**
 * Product Mock Data
 * Mock product data for testing
 */

const mockProducts = [
  {
    id: 'sneaker-1',
    name: 'Nike Airforce 1',
    price: 1999.99,
    description: 'Chunky everyday statement pair',
    category: 'shoes',
    tag: 'Trending',
    images: ['assets/sneaker1.jpg', 'assets/sneaker1a.jpg'],
    inventoryStatus: 'inStock',
    stockQuantity: 25,
    adminNotes: 'Popular item, monitor stock levels',
    lastUpdated: '2025-01-15T10:30:00Z',
    updatedBy: 'admin',
    isVisible: true,
    attributes: {
      sizes: [3, 4, 5, 6, 7, 8, 9, 10],
      colors: ['White', 'Black', 'Red', 'Blue'],
      brand: 'Nike',
      material: 'Leather'
    }
  },
  {
    id: 'sneaker-2',
    name: 'Adidas Stan Smith',
    price: 1349.99,
    description: 'Clean minimalist lifestyle icon',
    category: 'shoes',
    tag: 'Classic',
    images: ['assets/sneaker4.jpg'],
    inventoryStatus: 'inStock',
    stockQuantity: 42,
    adminNotes: 'Steady seller, good margins',
    lastUpdated: '2025-01-15T08:15:00Z',
    updatedBy: 'admin',
    isVisible: true,
    attributes: {
      sizes: [3, 4, 5, 6, 7, 8, 9, 10],
      colors: ['White', 'Green', 'Navy'],
      brand: 'Adidas',
      material: 'Synthetic Leather'
    }
  },
  {
    id: 'sneaker-3',
    name: 'Limited Edition Jordan',
    price: 3499.99,
    description: 'Rare collectible sneaker',
    category: 'shoes',
    tag: 'Limited Edition',
    images: ['assets/jordan1.jpg'],
    inventoryStatus: 'lowStock',
    stockQuantity: 3,
    adminNotes: 'Very limited stock',
    lastUpdated: '2025-01-10T14:20:00Z',
    updatedBy: 'admin',
    isVisible: true,
    attributes: {
      sizes: [8, 9, 10],
      colors: ['Red/Black'],
      brand: 'Jordan',
      material: 'Leather'
    }
  },
  {
    id: 'sneaker-4',
    name: 'Out of Stock Item',
    price: 999.99,
    description: 'Currently unavailable',
    category: 'shoes',
    tag: 'Sold Out',
    images: ['assets/sneaker2.jpg'],
    inventoryStatus: 'outOfStock',
    stockQuantity: 0,
    adminNotes: 'Restock needed',
    lastUpdated: '2025-01-05T09:00:00Z',
    updatedBy: 'admin',
    isVisible: true,
    attributes: {
      sizes: [6, 7, 8],
      colors: ['Black'],
      brand: 'Puma',
      material: 'Canvas'
    }
  },
  {
    id: 'hidden-1',
    name: 'Hidden Product',
    price: 599.99,
    description: 'Not visible to customers',
    category: 'shoes',
    tag: 'Hidden',
    images: ['assets/sneaker5.jpg'],
    inventoryStatus: 'inStock',
    stockQuantity: 100,
    adminNotes: 'Draft product',
    lastUpdated: '2025-01-01T10:00:00Z',
    updatedBy: 'admin',
    isVisible: false,
    attributes: {
      sizes: [7, 8, 9],
      colors: ['White'],
      brand: 'Vans',
      material: 'Canvas'
    }
  }
];

const mockProductCategories = ['All', 'Trending', 'Classic', 'Limited Edition', 'Sold Out'];

// Helper functions
function getVisibleProducts() {
  return mockProducts.filter(p => p.isVisible);
}

function getInStockProducts() {
  return mockProducts.filter(p => p.inventoryStatus === 'inStock' && p.isVisible);
}

function getLowStockProducts() {
  return mockProducts.filter(p => p.inventoryStatus === 'lowStock');
}

function getProductById(id) {
  return mockProducts.find(p => p.id === id);
}

function getProductsByCategory(category) {
  if (category === 'All') return getVisibleProducts();
  return getVisibleProducts().filter(p => p.category === category || p.tag === category);
}

module.exports = {
  mockProducts,
  mockProductCategories,
  getVisibleProducts,
  getInStockProducts,
  getLowStockProducts,
  getProductById,
  getProductsByCategory
};
