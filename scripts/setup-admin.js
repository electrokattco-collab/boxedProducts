#!/usr/bin/env node
/**
 * Admin Setup Script
 * 
 * This script sets the admin custom claim for a Firebase Auth user.
 * Run this after creating the admin user in Firebase Console.
 * 
 * Prerequisites:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Set your project: firebase use boxedsneakers
 * 4. Run this script: node scripts/setup-admin.js <USER_UID>
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Link to your new key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  if (!uid) {
    console.error('❌ Error: Please provide a user UID');
    console.log('Usage: node setup-admin.js <USER_UID>');
    console.log('');
    console.log('To find the UID:');
    console.log('1. Go to Firebase Console → Authentication → Users');
    console.log('2. Find the user and copy the UID');
    process.exit(1);
  }

  try {
    // Set the admin claim
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    // Verify it was set
    const user = await admin.auth().getUser(uid);
    
    console.log('✅ Admin claim set successfully!');
    console.log('');
    console.log('User Details:');
    console.log('  UID:', user.uid);
    console.log('  Email:', user.email);
    console.log('  Admin:', user.customClaims?.admin === true);
    console.log('');
    console.log('⚠️  Important:');
    console.log('  The user must re-login for the claim to take effect.');
    console.log('  Or they can wait up to 1 hour for the token to refresh.');
    
  } catch (error) {
    console.error('❌ Error setting admin claim:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('');
      console.log('The user UID was not found. Please check:');
      console.log('1. The UID is correct');
      console.log('2. You are using the correct Firebase project');
    }
    
    if (error.code === 'auth/insufficient-permission') {
      console.log('');
      console.log('You need admin permissions. Try:');
      console.log('1. firebase login (to ensure you are logged in)');
      console.log('2. firebase use boxedsneakers (to select the project)');
    }
    
    process.exit(1);
  }
  
  process.exit(0);
}

// Get UID from command line arguments
const uid = process.argv[2];
setAdminClaim(uid);
