/**
 * Product Renderer Tests
 * Tests for product display and rendering functionality
 */

const { mockProducts, getVisibleProducts, getInStockProducts, getProductById } = require('../../mocks/products.js');

// Mock ProductRenderer class
class ProductRenderer {
  constructor(containerId) {
    this.container = { innerHTML: '' };
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderProductCard(product) {
    const price = parseFloat(product.price).toFixed(2);
    const image = product.images?.[0] || 'assets/placeholder.jpg';
    const safeName = this._escapeHtml(product.name);
    const safeTag = this._escapeHtml(product.tag || 'New');
    const safeImage = this._escapeHtml(image);
    const safeId = this._escapeHtml(product.id);

    return `
      <article class="product-card" data-product-id="${safeId}">
        <div class="product-top">
          <span class="product-badge">${safeTag}</span>
        </div>
        <img src="${safeImage}" alt="${safeName}" onerror="this.src='assets/placeholder.jpg'">
        <h3>${safeName}</h3>
        <div class="product-price">R ${price}</div>
        <button class="add-btn" ${product.inventoryStatus === 'outOfStock' ? 'disabled' : ''}>
          ${product.inventoryStatus === 'outOfStock' ? 'Out of Stock' : 'Add to bag'}
        </button>
      </article>
    `;
  }

  formatPrice(price) {
    return 'R ' + parseFloat(price).toFixed(2);
  }

  getStockBadge(status) {
    const badges = {
      inStock: '<span class="badge in-stock">In Stock</span>',
      lowStock: '<span class="badge low-stock">Low Stock</span>',
      outOfStock: '<span class="badge out-of-stock">Out of Stock</span>'
    };
    return badges[status] || '';
  }
}

describe('Product Renderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new ProductRenderer('product-grid');
  });

  describe('Price Formatting', () => {
    test('should format price with R prefix and 2 decimal places', () => {
      expect(renderer.formatPrice(1999.99)).toBe('R 1999.99');
      expect(renderer.formatPrice(100)).toBe('R 100.00');
      expect(renderer.formatPrice(99.9)).toBe('R 99.90');
    });

    test('should handle string prices', () => {
      expect(renderer.formatPrice('1499.99')).toBe('R 1499.99');
    });

    test('should handle zero price', () => {
      expect(renderer.formatPrice(0)).toBe('R 0.00');
    });
  });

  describe('HTML Escaping', () => {
    test('should escape HTML tags', () => {
      const malicious = '<script>alert(1)</script>';
      const escaped = renderer._escapeHtml(malicious);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;');
    });

    test('should handle empty or null strings', () => {
      expect(renderer._escapeHtml('')).toBe('');
      expect(renderer._escapeHtml(null)).toBe('');
      expect(renderer._escapeHtml(undefined)).toBe('');
    });

    test('should escape quotes', () => {
      const input = 'Product "Special Edition"';
      const escaped = renderer._escapeHtml(input);
      expect(escaped).toContain('&quot;');
    });
  });

  describe('Product Card Rendering', () => {
    test('should render product card with all required elements', () => {
      const product = mockProducts[0]; // Nike Airforce 1
      const html = renderer.renderProductCard(product);

      expect(html).toContain('product-card');
      expect(html).toContain(product.id);
      expect(html).toContain(product.name);
      expect(html).toContain('R 1999.99');
      expect(html).toContain(product.images[0]);
      expect(html).toContain(product.tag);
    });

    test('should use placeholder for missing images', () => {
      const product = { ...mockProducts[0], images: [] };
      const html = renderer.renderProductCard(product);

      expect(html).toContain('assets/placeholder.jpg');
    });

    test('should disable add button for out of stock items', () => {
      const outOfStockProduct = mockProducts.find(p => p.inventoryStatus === 'outOfStock');
      const html = renderer.renderProductCard(outOfStockProduct);

      expect(html).toContain('disabled');
      expect(html).toContain('Out of Stock');
    });

    test('should enable add button for in stock items', () => {
      const inStockProduct = mockProducts.find(p => p.inventoryStatus === 'inStock');
      const html = renderer.renderProductCard(inStockProduct);

      expect(html).not.toContain('disabled');
      expect(html).toContain('Add to bag');
    });

    test('should escape product name in HTML', () => {
      const maliciousProduct = {
        ...mockProducts[0],
        name: '<img src="x" onerror="alert(1)">',
        id: 'test-123'
      };
      const html = renderer.renderProductCard(maliciousProduct);

      // The escaped name should not contain unescaped HTML
      expect(html).toContain('&lt;img');
      expect(html).toContain('&gt;');
      expect(html).toContain('&quot;');
      expect(html).not.toContain('onerror="alert(1)"');
    });

    test('should default to "New" tag when tag is missing', () => {
      const product = { ...mockProducts[0], tag: null };
      const html = renderer.renderProductCard(product);

      expect(html).toContain('New');
    });
  });

  describe('Stock Badge Rendering', () => {
    test('should return correct badge for in stock', () => {
      const badge = renderer.getStockBadge('inStock');
      expect(badge).toContain('In Stock');
      expect(badge).toContain('in-stock');
    });

    test('should return correct badge for low stock', () => {
      const badge = renderer.getStockBadge('lowStock');
      expect(badge).toContain('Low Stock');
      expect(badge).toContain('low-stock');
    });

    test('should return correct badge for out of stock', () => {
      const badge = renderer.getStockBadge('outOfStock');
      expect(badge).toContain('Out of Stock');
      expect(badge).toContain('out-of-stock');
    });

    test('should return empty string for unknown status', () => {
      const badge = renderer.getStockBadge('unknown');
      expect(badge).toBe('');
    });
  });

  describe('Product Data Validation', () => {
    test('should handle product with minimal required fields', () => {
      const minimalProduct = {
        id: 'test-1',
        name: 'Test Product',
        price: 100,
        images: [],
        inventoryStatus: 'inStock'
      };

      const html = renderer.renderProductCard(minimalProduct);
      expect(html).toContain('Test Product');
      expect(html).toContain('R 100.00');
    });

    test('should handle very long product names', () => {
      const longNameProduct = {
        ...mockProducts[0],
        name: 'A'.repeat(200)
      };

      const html = renderer.renderProductCard(longNameProduct);
      expect(html).toContain('A'.repeat(200));
    });

    test('should handle special characters in product names', () => {
      const specialCharProduct = {
        ...mockProducts[0],
        name: 'Nike Air Max 90™ - Special Edition®'
      };

      const html = renderer.renderProductCard(specialCharProduct);
      expect(html).toContain('Nike Air Max 90™');
    });
  });
});

describe('Product Data Mock', () => {
  test('should have valid mock products', () => {
    expect(mockProducts.length).toBeGreaterThan(0);
    
    mockProducts.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('inventoryStatus');
    });
  });

  test('getVisibleProducts should filter out invisible products', () => {
    const visible = getVisibleProducts();
    const invisibleCount = mockProducts.filter(p => !p.isVisible).length;
    
    expect(visible.length).toBe(mockProducts.length - invisibleCount);
    expect(visible.every(p => p.isVisible)).toBe(true);
  });

  test('getInStockProducts should return only in stock items', () => {
    const inStock = getInStockProducts();
    
    expect(inStock.every(p => p.inventoryStatus === 'inStock' && p.isVisible)).toBe(true);
  });

  test('getProductById should return correct product', () => {
    const product = getProductById('sneaker-1');
    expect(product).toBeDefined();
    expect(product.name).toBe('Nike Airforce 1');
  });

  test('getProductById should return undefined for non-existent id', () => {
    const product = getProductById('non-existent');
    expect(product).toBeUndefined();
  });
});
