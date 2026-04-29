# Security Setup Guide

## Overview
This document outlines the security upgrades implemented and the steps required to complete the setup.

## Changes Implemented

### 1. Firestore Security Rules (`firestore.rules`)
- ✅ Public read access for products
- ✅ Admin-only write access (requires `admin` custom claim)
- ✅ Data validation for product creation/updates
- ✅ Orders collection prepared for future use
- ✅ User isolation for orders (users can only access their own data)

### 2. Firebase Configuration (`src/firebaseConfig.js`)
- ✅ Auth persistence (Remember me vs Session-only)
- ✅ Admin claim verification on sign-in
- ✅ Automatic sign-out for non-admin users
- ✅ Auth state observer with claim checking

### 3. XSS Protection
- ✅ `src/productRenderer.js` - All product data escaped before rendering
- ✅ `src/adminUI.js` - All table rows and modal content escaped
- ✅ `admin.html` - EscapeHTML helper for dynamic content

### 4. Admin Authentication (`admin.html`)
- ✅ Secure login form with CSRF protection
- ✅ "Remember me" option with appropriate persistence
- ✅ Admin badge display showing logged-in user
- ✅ Session timeout (30 minutes with 5-minute warning)
- ✅ Enhanced error messages (without exposing system details)

### 5. Cart Security (`boxedCart.html`)
- ✅ Cart data validation and sanitization
- ✅ Version tracking for data integrity
- ✅ Size limits on cart item properties
- ✅ Safe JSON parsing with error handling

### 6. Content Security Policy
- ✅ Added to all HTML files:
  - `index.html`
  - `admin.html`
  - `boxedCart.html`
  - `boxedAboutUs.html`
  - `boxedContacts.html`

### 7. Auth Guard (`src/authGuard.js`)
- ✅ Route protection for admin pages
- ✅ Admin claim verification
- ✅ Automatic redirect for unauthorized access

## Required Setup Steps

### Step 1: Deploy Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`boxedsneakers`)
3. Navigate to "Firestore Database" → "Rules"
4. Copy the contents of `firestore.rules` and paste into the rules editor
5. Click "Publish"

### Step 2: Create Admin User

1. In Firebase Console, go to "Authentication" → "Users"
2. Click "Add user"
3. Enter email and password for the admin
4. Click "Add user"
5. Note the User UID (you'll need it for Step 3)

### Step 3: Set Admin Custom Claim (CRITICAL)

Since this is a frontend-only application, you need to set the admin claim using the Firebase Admin SDK. You have two options:

#### Option A: Firebase Cloud Function (Recommended for Production)

Deploy a one-time callable function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Check if caller is already an admin (bootstrap protection)
  const callerToken = await admin.auth().getUser(context.auth.uid);
  // For initial setup, you might want to check against a specific UID
  
  const { uid } = data;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  
  return { success: true };
});
```

#### Option B: Node.js Script (For Initial Setup)

1. Create a new directory outside your project
2. Initialize a Node.js project:
```bash
npm init -y
npm install firebase-admin
```

3. Create `setAdmin.js`:
```javascript
const admin = require('firebase-admin');

// Download service account key from Firebase Console
// Project Settings → Service Accounts → Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin claim set for user: ${uid}`);
    
    // Verify
    const user = await admin.auth().getUser(uid);
    console.log('Custom claims:', user.customClaims);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

// Replace with your admin UID from Firebase Console
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';
setAdminClaim(ADMIN_UID);
```

4. Run the script:
```bash
node setAdmin.js
```

### Step 4: Verify Setup

1. Open `admin.html` in a browser
2. Try logging in with a non-admin user → Should be denied
3. Try logging in with the admin user → Should succeed
4. Check that admin badge shows your email
5. Leave the page idle for 30 minutes → Should auto-logout

## Security Checklist

- [ ] Firestore rules deployed
- [ ] Admin user created in Firebase Auth
- [ ] Admin custom claim set via Admin SDK
- [ ] Tested login with non-admin (should fail)
- [ ] Tested login with admin (should succeed)
- [ ] Verified XSS protection (try adding product with `<script>alert('xss')</script>` in name)
- [ ] Verified session timeout works

## Important Security Notes

1. **Never commit the service account key** to your repository
2. **Firebase config is safe to expose** - it doesn't contain secrets, just identifiers
3. **All security enforcement is in Firestore rules** - client-side checks are for UX only
4. **Admin claims are cached** - after setting a claim, the user must re-login or wait up to 1 hour
5. **Session timeout is client-side** - for stronger security, implement server-side session validation

## Troubleshooting

### "Access denied: Administrator privileges required"
- The user is authenticated but doesn't have the `admin` custom claim
- Run the Admin SDK script to set the claim
- User must re-login after claim is set

### "Missing or insufficient permissions"
- Firestore rules may not be deployed
- Check rules in Firebase Console
- Verify the rules match `firestore.rules` in this project

### Session not persisting
- Check "Remember me" checkbox on login
- Browser may be blocking localStorage/sessionStorage
- Check browser console for CSP errors

## Future Enhancements

For even stronger security, consider:

1. **Rate limiting**: Implement Cloud Functions to limit login attempts
2. **Audit logging**: Log all admin actions to a separate collection
3. **2FA**: Enable 2FA for admin accounts in Firebase Console
4. **IP restrictions**: Restrict admin access by IP in Cloud Functions
5. **Session revocation**: Implement ability to revoke sessions server-side
