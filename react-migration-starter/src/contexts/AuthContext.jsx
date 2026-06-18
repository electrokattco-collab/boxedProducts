/**
 * Authentication Context
 * Replaces src/auth/authGuard.js and src/auth/login.js
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../api/firebase.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check admin status from custom claims
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setIsAdmin(idTokenResult.claims.isAdmin || false);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email, password, rememberMe = false) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      return {
        success: true,
        user: userCredential.user,
        isAdmin: idTokenResult.claims.isAdmin || false
      };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      return {
        success: true,
        user: userCredential.user,
        isAdmin: idTokenResult.claims.isAdmin || false
      };
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      isAuthenticated: !!user,
      loginWithEmail,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper function for error messages
function getAuthErrorMessage(code) {
  const messages = {
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/invalid-email': 'Invalid email format.',
    'auth/user-disabled': 'Account disabled.',
    'auth/too-many-requests': 'Too many attempts. Try later.',
    'auth/network-request-failed': 'Network error.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/cancelled-popup-request': 'Sign-in popup was cancelled.'
  };
  return messages[code] || 'Sign-in failed. Please try again.';
}
