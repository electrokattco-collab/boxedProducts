// firebaseConfig.js
// Firebase initialization using modular SDK v9+ syntax
// This module initializes Firebase and exports db/instance for use across the app

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

// Firebase configuration - boxedSneakers project
const firebaseConfig = {
    apiKey: "AIzaSyCyM_9yvMlKqNNZsMN-BjcnTfYZZJmYmjs",
    authDomain: "boxedsneakers.firebaseapp.com",
    projectId: "boxedsneakers",
    storageBucket: "boxedsneakers.firebasestorage.app",
    messagingSenderId: "26958229184",
    appId: "1:26958229184:web:8f32107b0aa9d4fb72c725",
    measurementId: "G-F77K45QBQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Storage instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseApp = app;

console.log('[Firebase] Initialized successfully');
