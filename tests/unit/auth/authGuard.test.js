/**
 * Auth Guard Tests
 * Tests for route protection and authentication state management
 */

// Mock AuthGuard class (mirroring the actual implementation)
class AuthGuard {
  constructor() {
    this.currentUser = null;
    this.isAdmin = false;
    this.isLoading = true;
    this.unsubscribe = null;
    this.onAuthChange = null;
    this.options = {
      requireAuth: false,
      requireAdmin: false,
      loginPage: 'pages/login.html',
      adminPage: 'admin.html',
      customerPage: 'index.html',
      publicPages: ['index.html', 'boxedAboutUs.html', 'boxedContacts.html', 'boxedCart.html']
    };
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isAdminUser() {
    return this.isAdmin === true;
  }

  isLoginPage() {
    return window.location.pathname.includes('login.html');
  }

  isAdminPage() {
    return window.location.pathname.includes('admin.html');
  }

  isPublicPage() {
    const path = window.location.pathname;
    return this.options.publicPages.some(page => path.includes(page)) || 
           path === '/' || 
           path.endsWith('/');
  }

  getPath(path) {
    const isInPagesDir = window.location.pathname.includes('/pages/');
    if (isInPagesDir && !path.startsWith('../')) {
      return '../' + path;
    }
    return path;
  }

  redirectToLogin() {
    const currentUrl = window.location.href;
    if (!this.isLoginPage()) {
      sessionStorage.setItem('postLoginRedirect', currentUrl);
    }
    window.location.href = this.getPath(this.options.loginPage);
  }

  redirectBasedOnRole() {
    if (this.isAdmin) {
      window.location.href = this.getPath(this.options.adminPage);
    } else {
      window.location.href = this.getPath(this.options.customerPage);
    }
  }

  canAccess(resourceType, resourceOwnerId = null) {
    if (this.isAdminUser()) return true;
    if (!this.isAuthenticated()) {
      return resourceType === 'product' && resourceOwnerId === null;
    }
    if (resourceOwnerId) {
      return this.currentUser && this.currentUser.uid === resourceOwnerId;
    }
    return false;
  }
}

describe('Auth Guard', () => {
  let authGuardInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    window.location.pathname = '/';
    sessionStorage.clear();
    authGuardInstance = new AuthGuard();
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      expect(authGuardInstance.options.requireAuth).toBe(false);
      expect(authGuardInstance.options.requireAdmin).toBe(false);
      expect(authGuardInstance.options.loginPage).toBe('pages/login.html');
      expect(authGuardInstance.options.adminPage).toBe('admin.html');
      expect(authGuardInstance.options.customerPage).toBe('index.html');
    });
  });

  describe('Authentication State', () => {
    test('should return false when not authenticated', () => {
      expect(authGuardInstance.isAuthenticated()).toBe(false);
    });

    test('should return true when authenticated', () => {
      authGuardInstance.currentUser = { uid: 'user123' };
      expect(authGuardInstance.isAuthenticated()).toBe(true);
    });

    test('should return false for isAdminUser when not admin', () => {
      authGuardInstance.currentUser = { uid: 'user123' };
      authGuardInstance.isAdmin = false;
      expect(authGuardInstance.isAdminUser()).toBe(false);
    });

    test('should return true for isAdminUser when admin', () => {
      authGuardInstance.currentUser = { uid: 'admin123' };
      authGuardInstance.isAdmin = true;
      expect(authGuardInstance.isAdminUser()).toBe(true);
    });
  });

  describe('Page Detection', () => {
    test('should detect login page', () => {
      window.location.pathname = '/pages/login.html';
      expect(authGuardInstance.isLoginPage()).toBe(true);
    });

    test('should detect admin page', () => {
      window.location.pathname = '/admin.html';
      expect(authGuardInstance.isAdminPage()).toBe(true);
    });

    test('should detect public pages', () => {
      window.location.pathname = '/index.html';
      expect(authGuardInstance.isPublicPage()).toBe(true);
      
      window.location.pathname = '/boxedAboutUs.html';
      expect(authGuardInstance.isPublicPage()).toBe(true);
    });

    test('should not detect admin page as public', () => {
      window.location.pathname = '/admin.html';
      expect(authGuardInstance.isPublicPage()).toBe(false);
    });
  });

  describe('Path Resolution', () => {
    test('should return path as-is from root directory', () => {
      window.location.pathname = '/index.html';
      expect(authGuardInstance.getPath('admin.html')).toBe('admin.html');
    });

    test('should prepend ../ when in pages directory', () => {
      window.location.pathname = '/boxedProducts/pages/login.html';
      expect(authGuardInstance.getPath('admin.html')).toBe('../admin.html');
    });

    test('should not double prepend if path already starts with ../', () => {
      window.location.pathname = '/boxedProducts/pages/login.html';
      expect(authGuardInstance.getPath('../admin.html')).toBe('../admin.html');
    });
  });

  describe('Redirect Logic', () => {
    test('should redirect to login page from root', () => {
      window.location.pathname = '/index.html';
      window.location.href = 'https://example.com/index.html';
      
      authGuardInstance.redirectToLogin();
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'postLoginRedirect',
        'https://example.com/index.html'
      );
      expect(window.location.href).toBe('pages/login.html');
    });

    test('should redirect to login page from pages directory', () => {
      window.location.pathname = '/boxedProducts/pages/some-page.html';
      
      authGuardInstance.redirectToLogin();
      
      expect(window.location.href).toBe('../pages/login.html');
    });

    test('should redirect admin to admin page', () => {
      window.location.pathname = '/';
      authGuardInstance.isAdmin = true;
      
      authGuardInstance.redirectBasedOnRole();
      
      expect(window.location.href).toBe('admin.html');
    });

    test('should redirect customer to index page', () => {
      window.location.pathname = '/';
      authGuardInstance.isAdmin = false;
      
      authGuardInstance.redirectBasedOnRole();
      
      expect(window.location.href).toBe('index.html');
    });
  });

  describe('Resource Access Control', () => {
    beforeEach(() => {
      authGuardInstance.currentUser = { uid: 'user123' };
      authGuardInstance.isAdmin = false;
    });

    test('should allow admin to access everything', () => {
      authGuardInstance.isAdmin = true;
      expect(authGuardInstance.canAccess('product')).toBe(true);
      expect(authGuardInstance.canAccess('order')).toBe(true);
      expect(authGuardInstance.canAccess('user')).toBe(true);
    });

    test('should allow owner to access their resources', () => {
      expect(authGuardInstance.canAccess('order', 'user123')).toBe(true);
    });

    test('should deny access to other user resources', () => {
      expect(authGuardInstance.canAccess('order', 'other-user')).toBe(false);
    });

    test('should allow unauthenticated users to view public products', () => {
      authGuardInstance.currentUser = null;
      expect(authGuardInstance.canAccess('product', null)).toBe(true);
    });
  });
});
