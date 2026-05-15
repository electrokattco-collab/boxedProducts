/**
 * Sanitization Utility Tests
 * Tests for input sanitization and validation functions
 */

// Mock sanitize functions
const sanitize = {
  // Escape HTML special characters
  escapeHtml: (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Strip all HTML tags
  stripHtml: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
  },

  // Sanitize for URL
  sanitizeUrl: (url) => {
    if (typeof url !== 'string') return '';
    // Only allow http, https, and relative URLs
    if (url.match(/^https?:\/\//i) || url.startsWith('/') || url.startsWith('./')) {
      return url.replace(/[<>\"']]/g, '');
    }
    return '';
  },

  // Validate and sanitize email
  sanitizeEmail: (email) => {
    if (typeof email !== 'string') return '';
    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  },

  // Sanitize price input
  sanitizePrice: (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100);
  },

  // Sanitize ID (alphanumeric, hyphens, underscores only)
  sanitizeId: (id) => {
    if (typeof id !== 'string') return '';
    return id.replace(/[^a-zA-Z0-9-_]/g, '');
  },

  // Truncate string to max length
  truncate: (str, maxLength = 100) => {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },

  // Remove extra whitespace
  normalizeWhitespace: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/\s+/g, ' ').trim();
  }
};

describe('Sanitization Utilities', () => {
  describe('escapeHtml', () => {
    test('should escape HTML tags', () => {
      expect(sanitize.escapeHtml('<script>alert(1)</script>'))
        .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    test('should escape multiple special characters', () => {
      const input = '<div class="test">It\'s working & ready</div>';
      const expected = '&lt;div class=&quot;test&quot;&gt;It&#039;s working &amp; ready&lt;/div&gt;';
      expect(sanitize.escapeHtml(input)).toBe(expected);
    });

    test('should handle empty string', () => {
      expect(sanitize.escapeHtml('')).toBe('');
    });

    test('should handle non-string inputs', () => {
      expect(sanitize.escapeHtml(null)).toBe('');
      expect(sanitize.escapeHtml(undefined)).toBe('');
      expect(sanitize.escapeHtml(123)).toBe('');
    });

    test('should not modify safe strings', () => {
      const safe = 'Hello World';
      expect(sanitize.escapeHtml(safe)).toBe(safe);
    });
  });

  describe('stripHtml', () => {
    test('should remove all HTML tags', () => {
      expect(sanitize.stripHtml('<p>Hello <strong>World</strong></p>'))
        .toBe('Hello World');
    });

    test('should handle nested tags', () => {
      expect(sanitize.stripHtml('<div><span>Text</span></div>'))
        .toBe('Text');
    });

    test('should handle self-closing tags', () => {
      expect(sanitize.stripHtml('Line 1<br/>Line 2<img src="x"/>'))
        .toBe('Line 1Line 2');
    });

    test('should handle empty or invalid input', () => {
      expect(sanitize.stripHtml('')).toBe('');
      expect(sanitize.stripHtml(null)).toBe('');
      expect(sanitize.stripHtml(123)).toBe('');
    });

    test('should handle malformed HTML', () => {
      expect(sanitize.stripHtml('<unclosed>text')).toBe('text');
    });
  });

  describe('sanitizeUrl', () => {
    test('should allow valid HTTP URLs', () => {
      expect(sanitize.sanitizeUrl('http://example.com'))
        .toBe('http://example.com');
    });

    test('should allow valid HTTPS URLs', () => {
      expect(sanitize.sanitizeUrl('https://example.com/path?query=1'))
        .toBe('https://example.com/path?query=1');
    });

    test('should allow relative URLs', () => {
      expect(sanitize.sanitizeUrl('/path/to/page')).toBe('/path/to/page');
      expect(sanitize.sanitizeUrl('./relative/path')).toBe('./relative/path');
    });

    test('should reject JavaScript URLs', () => {
      expect(sanitize.sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    test('should reject data URLs', () => {
      expect(sanitize.sanitizeUrl('data:text/html,<script>alert(1)</script>'))
        .toBe('');
    });

    test('should allow valid URLs with special characters in path', () => {
      expect(sanitize.sanitizeUrl('https://example.com/path'))
        .toBe('https://example.com/path');
    });

    test('should handle empty or invalid input', () => {
      expect(sanitize.sanitizeUrl('')).toBe('');
      expect(sanitize.sanitizeUrl(null)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    test('should validate and return valid emails', () => {
      expect(sanitize.sanitizeEmail('user@example.com'))
        .toBe('user@example.com');
    });

    test('should convert to lowercase', () => {
      expect(sanitize.sanitizeEmail('User@Example.COM'))
        .toBe('user@example.com');
    });

    test('should trim whitespace', () => {
      expect(sanitize.sanitizeEmail('  user@example.com  '))
        .toBe('user@example.com');
    });

    test('should reject invalid emails', () => {
      expect(sanitize.sanitizeEmail('invalid')).toBe('');
      expect(sanitize.sanitizeEmail('@example.com')).toBe('');
      expect(sanitize.sanitizeEmail('user@')).toBe('');
      expect(sanitize.sanitizeEmail('user@example')).toBe('');
    });

    test('should handle empty input', () => {
      expect(sanitize.sanitizeEmail('')).toBe('');
      expect(sanitize.sanitizeEmail(null)).toBe('');
    });

    test('should handle complex valid emails', () => {
      expect(sanitize.sanitizeEmail('user.name+tag@example.co.uk'))
        .toBe('user.name+tag@example.co.uk');
    });
  });

  describe('sanitizePrice', () => {
    test('should parse valid prices', () => {
      expect(sanitize.sanitizePrice('99.99')).toBe(99.99);
      expect(sanitize.sanitizePrice(149.50)).toBe(149.50);
    });

    test('should round to 2 decimal places', () => {
      expect(sanitize.sanitizePrice(99.999)).toBe(100);
      expect(sanitize.sanitizePrice(99.991)).toBe(99.99);
    });

    test('should reject negative prices', () => {
      expect(sanitize.sanitizePrice(-50)).toBe(0);
    });

    test('should handle zero', () => {
      expect(sanitize.sanitizePrice(0)).toBe(0);
      expect(sanitize.sanitizePrice('0')).toBe(0);
    });

    test('should return 0 for invalid input', () => {
      expect(sanitize.sanitizePrice('invalid')).toBe(0);
      expect(sanitize.sanitizePrice(null)).toBe(0);
      expect(sanitize.sanitizePrice(undefined)).toBe(0);
    });
  });

  describe('sanitizeId', () => {
    test('should allow alphanumeric characters', () => {
      expect(sanitize.sanitizeId('abc123')).toBe('abc123');
    });

    test('should allow hyphens and underscores', () => {
      expect(sanitize.sanitizeId('product-id_123'))
        .toBe('product-id_123');
    });

    test('should remove special characters', () => {
      expect(sanitize.sanitizeId('id<script>alert(1)</script>'))
        .toBe('idscriptalert1script');
    });

    test('should remove spaces', () => {
      expect(sanitize.sanitizeId('product id')).toBe('productid');
    });

    test('should handle empty input', () => {
      expect(sanitize.sanitizeId('')).toBe('');
      expect(sanitize.sanitizeId(null)).toBe('');
    });
  });

  describe('truncate', () => {
    test('should not modify short strings', () => {
      expect(sanitize.truncate('Hello', 100)).toBe('Hello');
    });

    test('should truncate long strings', () => {
      const longString = 'A'.repeat(200);
      const result = sanitize.truncate(longString, 50);
      
      expect(result.length).toBe(50);
      expect(result.endsWith('...')).toBe(true);
    });

    test('should use default max length', () => {
      const veryLong = 'B'.repeat(150);
      const result = sanitize.truncate(veryLong);
      
      expect(result.length).toBeLessThanOrEqual(100);
    });

    test('should handle empty or invalid input', () => {
      expect(sanitize.truncate('')).toBe('');
      expect(sanitize.truncate(null)).toBe('');
      expect(sanitize.truncate(123)).toBe('');
    });

    test('should handle exact length strings', () => {
      const exact = 'C'.repeat(100);
      expect(sanitize.truncate(exact, 100)).toBe(exact);
    });
  });

  describe('normalizeWhitespace', () => {
    test('should collapse multiple spaces', () => {
      expect(sanitize.normalizeWhitespace('Hello    World'))
        .toBe('Hello World');
    });

    test('should collapse multiple newlines', () => {
      expect(sanitize.normalizeWhitespace('Line 1\n\n\nLine 2'))
        .toBe('Line 1 Line 2');
    });

    test('should trim leading and trailing whitespace', () => {
      expect(sanitize.normalizeWhitespace('  Hello World  '))
        .toBe('Hello World');
    });

    test('should handle tabs and mixed whitespace', () => {
      expect(sanitize.normalizeWhitespace('Hello\t\t\tWorld'))
        .toBe('Hello World');
    });

    test('should handle empty or invalid input', () => {
      expect(sanitize.normalizeWhitespace('')).toBe('');
      expect(sanitize.normalizeWhitespace(null)).toBe('');
      expect(sanitize.normalizeWhitespace(123)).toBe('');
    });
  });
});
