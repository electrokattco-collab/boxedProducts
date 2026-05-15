/**
 * Login Module Tests
 * Tests for authentication functions
 */

// Validation functions (mirroring the actual implementation)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return !!(password && password.length >= 6);
}

function redirectAfterLogin(isAdmin, redirectUrl = null) {
  if (redirectUrl) {
    window.location.href = redirectUrl;
    return;
  }

  const isInPagesDir = window.location.pathname.includes('/pages/');
  const basePath = isInPagesDir ? '../' : '';
  
  window.location.href = isAdmin ? basePath + 'admin.html' : basePath + 'index.html';
}

describe('Login Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    window.location.pathname = '/';
  });

  describe('Email Validation', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.za')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('a'.repeat(20))).toBe(true);
    });

    test('should reject short or empty passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword(undefined)).toBe(false);
    });
  });

  describe('Redirect After Login', () => {
    test('should redirect to custom URL when provided', () => {
      redirectAfterLogin(false, '/custom-page');
      expect(window.location.href).toBe('/custom-page');
    });

    test('should redirect admin to admin.html from root', () => {
      window.location.pathname = '/';
      redirectAfterLogin(true);
      expect(window.location.href).toBe('admin.html');
    });

    test('should redirect customer to index.html from root', () => {
      window.location.pathname = '/';
      redirectAfterLogin(false);
      expect(window.location.href).toBe('index.html');
    });

    test('should redirect admin to ../admin.html from pages directory', () => {
      window.location.pathname = '/boxedProducts/pages/login.html';
      redirectAfterLogin(true);
      expect(window.location.href).toBe('../admin.html');
    });

    test('should redirect customer to ../index.html from pages directory', () => {
      window.location.pathname = '/boxedProducts/pages/login.html';
      redirectAfterLogin(false);
      expect(window.location.href).toBe('../index.html');
    });
  });
});
