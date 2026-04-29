# Setup Scripts

This directory contains utility scripts for setting up and managing the BoxedProducts security configuration.

## Files

### `setup-admin.js`

Sets the admin custom claim for a Firebase Auth user, granting them access to the admin dashboard.

#### Prerequisites

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Select your project:
```bash
firebase use boxedsneakers
```

#### Usage

```bash
node scripts/setup-admin.js <USER_UID>
```

#### Getting the User UID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Authentication" → "Users"
4. Find the user you want to make admin
5. Copy the UID (it's a long string like: `abc123def456ghi789`)

#### Example

```bash
node scripts/setup-admin.js abc123def456ghi789
```

#### Output

```
✅ Admin claim set successfully!

User Details:
  UID: abc123def456ghi789
  Email: admin@example.com
  Admin: true

⚠️  Important:
  The user must re-login for the claim to take effect.
  Or they can wait up to 1 hour for the token to refresh.
```

## Troubleshooting

### "Error: Cannot find module 'firebase-admin'"

Install the dependency:
```bash
cd scripts
npm init -y
npm install firebase-admin
```

### "Insufficient permissions"

Make sure you have owner or editor access to the Firebase project.

### "User not found"

Double-check the UID. It should be the exact string from Firebase Console.

## Alternative: Using Firebase Console

If you can't run the script, you can also set claims using the Firebase Console's built-in functions or by deploying a Cloud Function.
