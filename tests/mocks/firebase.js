/**
 * Firebase Mock
 * Mock implementations for Firebase Authentication and Firestore
 */

// Mock user data
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-token',
    claims: { isAdmin: false },
    isAdmin: false
  })
};

export const mockAdminUser = {
  ...mockUser,
  uid: 'admin-user-456',
  email: 'admin@example.com',
  displayName: 'Admin User',
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-admin-token',
    claims: { isAdmin: true },
    isAdmin: true
  })
};

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    // Simulate no user by default
    callback(null);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
  createUserWithEmailAndPassword: jest.fn()
};

// Mock Google Auth Provider
export const mockGoogleProvider = {
  addScope: jest.fn(),
  setCustomParameters: jest.fn()
};

// Mock Firebase Config
export const mockFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id'
};

// Helper to simulate authenticated state
export function simulateAuthState(user = mockUser) {
  mockAuth.currentUser = user;
  mockAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(user);
    return jest.fn();
  });
}

// Helper to simulate unauthenticated state
export function simulateUnauthState() {
  mockAuth.currentUser = null;
  mockAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(null);
    return jest.fn();
  });
}

// Reset all mocks
export function resetFirebaseMocks() {
  mockAuth.currentUser = null;
  mockAuth.onAuthStateChanged.mockReset();
  mockAuth.signInWithEmailAndPassword.mockReset();
  mockAuth.signInWithPopup.mockReset();
  mockAuth.signOut.mockReset();
  mockUser.getIdToken.mockReset().mockResolvedValue('mock-token');
  mockUser.getIdTokenResult.mockReset().mockResolvedValue({
    token: 'mock-token',
    claims: { isAdmin: false },
    isAdmin: false
  });
}
