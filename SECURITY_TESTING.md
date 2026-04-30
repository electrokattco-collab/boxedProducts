# Security Testing Protocol

## System Implementation Blueprint (Auth + Role + Security)

This document outlines the complete security testing protocol for the Boxed Sneakers authentication and role-based access control system.

---

## 1. Core System Overview

### 1.1 Architecture

```
[ Login Page ]
      ↓
[ Firebase Authentication ]
      ↓
[ Token Claims (admin / user) ]
      ↓
[ Role-Based Redirect ]
      ↓
 ┌───────────────┬───────────────┐
 │               │               │
Admin Panel   Storefront     (Future: User Dashboard)
(admin.html)  (index.html)
```

### 1.2 File Structure

```
/src
  ├── auth/
  │     ├── login.js          # Email/password auth
  │     ├── googleAuth.js     # Google OAuth
  │     ├── authGuard.js      # Route protection
  │     └── customerAuth.js   # Customer UI auth
  │
  ├── services/
  │     ├── firebaseConfig.js # Firebase initialization
  │     └── userService.js    # User profile management
  │
  ├── ui/
  │     └── passwordToggle.js # Password visibility toggle
  │
/firestore.rules              # Firestore security rules
/firebase.json                # Firebase configuration
/firestore.indexes.json       # Firestore indexes
```

---

## 2. Pre-Testing Setup

### 2.1 Required Accounts

Create these test accounts in Firebase Console:

| Account Type | Email | Password | Admin Claim |
|--------------|-------|----------|-------------|
| Admin | admin@test.com | Test123! | ✅ `admin: true` |
| Regular User | user@test.com | Test123! | ❌ None |
| No Account | - | - | - |

### 2.2 Set Admin Claim

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies (first time)
npm install

# Set admin claim for test admin
node setup-admin.js <ADMIN_USER_UID>
```

**Note:** The admin user must sign out and sign back in after the claim is set.

---

## 3. Test Cases

### 3.1 Authentication Tests

#### Test 3.1.1: Email/Password Login - Valid Credentials
**Steps:**
1. Navigate to `pages/login.html`
2. Enter valid admin email and password
3. Click "Sign In"

**Expected Result:**
- ✅ Redirected to `admin.html`
- ✅ Admin badge displayed showing email
- ✅ Can access all admin functions

#### Test 3.1.2: Email/Password Login - Invalid Credentials
**Steps:**
1. Navigate to `pages/login.html`
2. Enter invalid password
3. Click "Sign In"

**Expected Result:**
- ❌ Error message displayed: "Invalid email or password"
- ❌ No redirect occurs
- ✅ Login button enabled after error

#### Test 3.1.3: Email Validation
**Steps:**
1. Enter invalid email format (e.g., "notanemail")
2. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Please enter a valid email address"

#### Test 3.1.4: Password Validation
**Steps:**
1. Enter valid email
2. Enter password with < 6 characters
3. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Password must be at least 6 characters"

#### Test 3.1.5: Google Authentication
**Steps:**
1. Click "Continue with Google"
2. Select/enter Google account

**Expected Result:**
- ✅ Successfully authenticated
- ✅ Redirected based on role (admin → admin.html, user → index.html)

#### Test 3.1.6: Password Toggle
**Steps:**
1. Enter text in password field
2. Click eye icon to toggle visibility
3. Click again to hide

**Expected Result:**
- ✅ Password visible when eye clicked
- ✅ Password hidden when clicked again
- ✅ Icon changes appropriately
- ✅ `aria-label` updates for accessibility

---

### 3.2 Role-Based Routing Tests

#### Test 3.2.1: Admin Access - Admin User
**Steps:**
1. Login as admin
2. Navigate directly to `admin.html`

**Expected Result:**
- ✅ Admin dashboard loads
- ✅ All CRUD operations available
- ✅ Admin badge shown

#### Test 3.2.2: Admin Access - Regular User (CRITICAL)
**Steps:**
1. Login as regular user (no admin claim)
2. Try to access `admin.html` directly via URL

**Expected Result:**
- ❌ Access denied screen shown
- ❌ "Go to Login" and "Back to Store" buttons displayed
- ❌ Cannot access admin functions
- ✅ Redirected to `index.html` if clicking "Back to Store"

#### Test 3.2.3: Admin Access - Not Logged In (CRITICAL)
**Steps:**
1. Ensure not logged in (clear cookies/storage)
2. Try to access `admin.html`

**Expected Result:**
- ❌ Redirected to `pages/login.html`
- ✅ Current URL stored in sessionStorage for post-login redirect

#### Test 3.2.4: Login Page - Already Authenticated
**Steps:**
1. Login as any user
2. Try to access `pages/login.html`

**Expected Result:**
- ✅ Redirected away from login page
- ✅ Admin → `admin.html`
- ✅ Regular user → `index.html`

#### Test 3.2.5: Post-Login Redirect
**Steps:**
1. While logged out, try to access `admin.html`
2. Get redirected to login
3. Login as admin

**Expected Result:**
- ✅ After login, redirected back to `admin.html` (original destination)

---

### 3.3 Firestore Security Rules Tests

#### Test 3.3.1: Products - Public Read (CRITICAL)
**Steps:**
1. Ensure not logged in
2. Open browser console
3. Execute:

```javascript
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
const db = getFirestore();
const snapshot = await getDocs(collection(db, 'products'));
console.log(snapshot.docs.map(d => d.data()));
```

**Expected Result:**
- ✅ Can read all products (public access)

#### Test 3.3.2: Products - Non-Admin Write (CRITICAL)
**Steps:**
1. Login as regular user (no admin claim)
2. Open browser console
3. Execute:

```javascript
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
const db = getFirestore();
await addDoc(collection(db, 'products'), { name: 'Hacked Product', price: 0 });
```

**Expected Result:**
- ❌ Permission denied error
- ❌ No product created

#### Test 3.3.3: Products - Admin Write (CRITICAL)
**Steps:**
1. Login as admin
2. Open admin panel
3. Add a new product

**Expected Result:**
- ✅ Product created successfully
- ✅ Appears in product list

#### Test 3.3.4: Users - Self-Read
**Steps:**
1. Login as regular user
2. Execute in console:

```javascript
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
const db = getFirestore();
const user = auth.currentUser;
const snap = await getDoc(doc(db, 'users', user.uid));
console.log(snap.data());
```

**Expected Result:**
- ✅ Can read own user document

#### Test 3.3.5: Users - Read Other User (CRITICAL)
**Steps:**
1. Login as regular user
2. Try to read another user's document (replace `OTHER_UID`):

```javascript
const snap = await getDoc(doc(db, 'users', 'OTHER_UID'));
```

**Expected Result:**
- ❌ Permission denied (unless admin)

#### Test 3.3.6: Admin Logs - Admin Only
**Steps:**
1. Login as regular user
2. Try to read admin logs:

```javascript
const snapshot = await getDocs(collection(db, 'adminLogs'));
```

**Expected Result:**
- ❌ Permission denied

3. Login as admin and retry

**Expected Result:**
- ✅ Can read admin logs

---

### 3.4 Attack Simulation Tests

#### Test 3.4.1: Direct URL Access to Admin
**Steps:**
1. As regular user, directly navigate to:
   - `admin.html`
   - `admin.html?user=admin`
   - `admin.html#admin`

**Expected Result:**
- ❌ All attempts show access denied or redirect

#### Test 3.4.2: Console-Based DB Write (CRITICAL)
**Steps:**
1. Login as regular user
2. Open browser console
3. Attempt various write operations:

```javascript
// Try to update product
await updateDoc(doc(db, 'products', 'PRODUCT_ID'), { price: 0 });

// Try to delete product
await deleteDoc(doc(db, 'products', 'PRODUCT_ID'));

// Try to create order for another user
await addDoc(collection(db, 'orders'), { userId: 'OTHER_USER_ID', items: [] });
```

**Expected Result:**
- ❌ All operations fail with "Missing or insufficient permissions"

#### Test 3.4.3: Token Manipulation
**Steps:**
1. Login as regular user
2. In browser console, try to modify token claims:

```javascript
// Attempt to set admin claim locally (will not work)
auth.currentUser.customClaims = { admin: true };
```

**Expected Result:**
- ❌ Local modification has no effect
- ❌ Firestore rules still reject admin operations

#### Test 3.4.4: Local Storage Tampering
**Steps:**
1. As regular user, open DevTools → Application → Local Storage
2. Try to inject fake admin data:

```javascript
localStorage.setItem('user', JSON.stringify({ admin: true }));
```

3. Refresh page and try to access admin

**Expected Result:**
- ❌ Access still denied (server-side token verification)

---

### 3.5 Content Security Policy Tests

#### Test 3.5.1: CSP Header Check
**Steps:**
1. Open DevTools → Network tab
2. Refresh any page
3. Check Response Headers for `Content-Security-Policy`

**Expected Result:**
- ✅ CSP header present with all required directives

#### Test 3.5.2: Inline Script Block
**Steps:**
1. In console, try to execute inline script injection:

```javascript
const script = document.createElement('script');
script.textContent = 'alert("XSS")';
document.body.appendChild(script);
```

**Expected Result:**
- ❌ Script blocked by CSP (if not nonce-based)

#### Test 3.5.3: External Resource Loading
**Steps:**
1. Check that all external resources load correctly:
   - Firebase SDK from `https://www.gstatic.com`
   - Fonts from `https://fonts.gstatic.com`
   - Font Awesome from `https://cdnjs.cloudflare.com`

**Expected Result:**
- ✅ All allowed resources load
- ❌ Blocked resources (not in CSP) fail

---

### 3.6 Session Management Tests

#### Test 3.6.1: Session Persistence - Remember Me
**Steps:**
1. Login with "Remember me" checked
2. Close browser
3. Reopen and navigate to site

**Expected Result:**
- ✅ Still logged in

#### Test 3.6.2: Session Persistence - No Remember Me
**Steps:**
1. Login without "Remember me"
2. Close browser completely
3. Reopen and navigate to site

**Expected Result:**
- ❌ Requires login again

#### Test 3.6.3: Session Timeout (Admin)
**Steps:**
1. Login as admin
2. Leave idle for 30 minutes

**Expected Result:**
- ⚠️ Warning shown at 25 minutes
- ❌ Auto-logout at 30 minutes
- ✅ Redirected to login

---

## 4. Automated Testing Script

Create `test-security.js`:

```javascript
/**
 * Security Test Suite
 * Run in browser console after importing Firebase
 */

const SecurityTests = {
    results: [],
    
    async runAll() {
        console.log('🔒 Starting Security Tests...\n');
        
        await this.testPublicProductRead();
        await this.testUnauthorizedWrite();
        await this.testAdminClaimRequired();
        
        this.printSummary();
    },
    
    async testPublicProductRead() {
        try {
            const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
            const db = getFirestore();
            const snapshot = await getDocs(collection(db, 'products'));
            
            this.log('✅ Public Product Read', true, `Read ${snapshot.docs.length} products`);
        } catch (error) {
            this.log('❌ Public Product Read', false, error.message);
        }
    },
    
    async testUnauthorizedWrite() {
        try {
            const { getFirestore, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
            const db = getFirestore();
            await addDoc(collection(db, 'products'), { name: 'Test' });
            
            this.log('❌ Unauthorized Write', false, 'Write succeeded (SHOULD HAVE FAILED)');
        } catch (error) {
            if (error.code === 'permission-denied') {
                this.log('✅ Unauthorized Write Blocked', true, 'Permission denied as expected');
            } else {
                this.log('⚠️ Unauthorized Write', false, `Unexpected error: ${error.message}`);
            }
        }
    },
    
    async testAdminClaimRequired() {
        // Check if user has admin claim
        const user = auth.currentUser;
        if (!user) {
            this.log('⚠️ Admin Claim Check', null, 'No user logged in');
            return;
        }
        
        const token = await user.getIdTokenResult();
        const isAdmin = token.claims.admin === true;
        
        this.log('ℹ️ Admin Claim Check', true, `User is ${isAdmin ? 'ADMIN' : 'REGULAR USER'}`);
    },
    
    log(testName, passed, message) {
        this.results.push({ testName, passed, message });
        const icon = passed === true ? '✅' : passed === false ? '❌' : '⚠️';
        console.log(`${icon} ${testName}: ${message}`);
    },
    
    printSummary() {
        console.log('\n📊 Test Summary');
        console.log('================');
        const passed = this.results.filter(r => r.passed === true).length;
        const failed = this.results.filter(r => r.passed === false).length;
        const total = this.results.length;
        
        console.log(`Total: ${total}, Passed: ${passed}, Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => r.passed === false).forEach(r => {
                console.log(`  - ${r.testName}: ${r.message}`);
            });
        }
    }
};

// Export for use
window.SecurityTests = SecurityTests;
```

---

## 5. Security Checklist

### 5.1 Pre-Deployment Checklist

- [ ] Firestore rules deployed: `firebase deploy --only firestore:rules`
- [ ] CSP headers configured in `firebase.json`
- [ ] Admin claim setup script tested
- [ ] All test accounts created
- [ ] Authentication methods tested (email + Google)
- [ ] Role-based routing verified
- [ ] Firestore rules tested with simulator
- [ ] XSS protection verified
- [ ] Session timeout configured
- [ ] HTTPS enforced in production

### 5.2 Regular Security Audits

**Monthly:**
- [ ] Review Firestore rules for changes
- [ ] Check admin logs for suspicious activity
- [ ] Verify CSP headers are up to date
- [ ] Review authentication error logs

**Quarterly:**
- [ ] Full security test suite execution
- [ ] Penetration testing
- [ ] Dependency updates (Firebase SDK)
- [ ] Admin claim audit

---

## 6. Success Criteria

The system is considered **SECURE** when:

| # | Criteria | Status |
|---|----------|--------|
| 1 | Authentication works (email + Google) | ⬜ |
| 2 | Admin roles enforced via claims | ⬜ |
| 3 | Firestore rules block unauthorized writes | ⬜ |
| 4 | Admin routes protected | ⬜ |
| 5 | Customers cannot escalate privileges | ⬜ |
| 6 | CSP errors resolved | ⬜ |
| 7 | UI/UX polished (password toggle, feedback) | ⬜ |
| 8 | Session management working | ⬜ |
| 9 | Audit logging functional | ⬜ |
| 10 | XSS protection active | ⬜ |

---

## 7. Troubleshooting

### Issue: Admin claim not recognized
**Cause:** Token not refreshed after claim is set

**Solution:**
```javascript
// Force token refresh
await auth.currentUser.getIdToken(true);
```

### Issue: CSP blocking Firebase
**Cause:** Missing domain in CSP

**Solution:**
Add `https://www.gstatic.com` to `script-src` and `connect-src`

### Issue: Permission denied on valid operations
**Cause:** Rules too restrictive or auth state not ready

**Solution:**
1. Check Firestore rules simulator
2. Verify user is authenticated before operation
3. Check token has required claims

---

## 8. Contact & Support

For security issues or questions:
1. Check Firebase Console → Authentication → Users
2. Review Firestore rules in Firebase Console
3. Check browser console for detailed error messages
4. Review admin logs at `adminLogs` collection

---

*Last Updated: 2025-04-30*
*Version: 1.0*
