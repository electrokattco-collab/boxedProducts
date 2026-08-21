# BoxedSneakers - Firebase Hosting Deployment Guide

**Project:** boxedsneakers  
**Project ID:** boxedsneakers  
**Project Number:** 26958229184  
**Date:** 2026-07-16

---

## Quick Start (3 Steps)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login and select project
firebase login
firebase use boxedsneakers

# 3. Deploy
firebase deploy --only hosting
```

**Your site will be live at:** `https://boxedsneakers.web.app`

---

## Prerequisites

### 1. Install Firebase CLI

```bash
# Using npm
npm install -g firebase-tools

# Or using standalone binary
curl -sL firebase.tools | bash

# Verify installation
firebase --version
# Expected: 13.x.x or higher
```

### 2. Authenticate with Firebase

```bash
# Login to Firebase
firebase login

# This will open a browser window for authentication
# Use the same Google account that owns the boxedsneakers project
```

### 3. Initialize Project (First Time Only)

```bash
# Navigate to your project directory
cd /path/to/boxedProducts

# Initialize Firebase Hosting
firebase init hosting

# Select these options:
# ? Select a default Firebase project for this directory: boxedsneakers (boxedsneakers)
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app (rewrite all urls to /index.html)? No
# ? Set up automatic builds and deploys with GitHub? No (optional)
```

---

## Configuration

### firebase.json

Create this file in your project root:

```json
{
  "hosting": {
    "site": "boxedsneakers",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/admin",
        "destination": "/admin.html"
      },
      {
        "source": "/cart",
        "destination": "/boxedCart.html"
      },
      {
        "source": "/about",
        "destination": "/boxedAboutUs.html"
      },
      {
        "source": "/contact",
        "destination": "/boxedContacts.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(css|js)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=604800, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          },
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
}
```

### .firebaserc

Create this file in your project root:

```json
{
  "projects": {
    "default": "boxedsneakers"
  }
}
```

---

## Deployment Commands

### Standard Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or shorthand
firebase deploy
```

### Deploy with Message

```bash
firebase deploy --only hosting -m "Deploying version 1.0.0"
```

### Deploy Specific Site (if using multi-site)

```bash
firebase deploy --only hosting:boxedsneakers
```

### Preview Before Deploy

```bash
# Serve locally for testing
firebase serve

# Or with specific port
firebase serve --port 5000
```

---

## Post-Deployment Configuration

### 1. Add Custom Domain (Optional)

```bash
# Add custom domain
firebase hosting:channel:deploy production

# Or via Firebase Console:
# 1. Go to https://console.firebase.google.com/project/boxedsneakers/hosting
# 2. Click "Add custom domain"
# 3. Enter: boxedsneakers.com
# 4. Follow DNS verification steps
```

### 2. Configure Firebase Auth Authorized Domains

**CRITICAL:** Firebase Auth will not work until you add your hosting domain!

```bash
# Get your Firebase Hosting URL
# Default: https://boxedsneakers.web.app
# Custom: https://boxedsneakers.com (if configured)
```

**Via Firebase Console:**
1. Go to: https://console.firebase.google.com/project/boxedsneakers/authentication
2. Click "Settings" (gear icon)
3. Go to "Authorized domains" tab
4. Click "Add domain"
5. Add these domains:
   - `boxedsneakers.web.app` (default)
   - `boxedsneakers.firebaseapp.com` (default)
   - `boxedsneakers.com` (if using custom domain)
   - `www.boxedsneakers.com` (if using www)

### 3. Enable Firebase Hosting in Console

1. Go to: https://console.firebase.google.com/project/boxedsneakers/hosting
2. Click "Get started"
3. Follow the initialization wizard
4. Or run: `firebase init hosting` in CLI

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci --no-audit --no-fund
        
      - name: Run tests
        run: npm test
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_BOXEDSNEAKERS }}'
          channelId: live
          projectId: boxedsneakers
```

**Setup GitHub Secrets:**

1. Go to GitHub → Repository → Settings → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT_BOXEDSNEAKERS`:
   ```bash
   # Generate service account key
   firebase init hosting:github
   ```

---

## Preview Channels (Staging)

### Create Preview Channel

```bash
# Deploy to preview channel (temporary URL)
firebase hosting:channel:deploy staging --expires 7d

# Output example:
# ✔ Deploy complete!
# Project Console: https://console.firebase.google.com/project/boxedsneakers/overview
# Hosting URL: https://boxedsneakers--staging-abc123.web.app
```

### Clone Production to Preview

```bash
firebase hosting:clone boxedsneakers:live boxedsneakers:staging
```

---

## Rollback

### View Deployment History

```bash
firebase hosting:releases:list
```

### Rollback to Previous Version

```bash
# List releases
firebase hosting:releases:list

# Rollback to specific release
firebase hosting:releases:rollback RELEASE_ID

# Or rollback to previous
firebase hosting:releases:rollback
```

---

## Monitoring & Analytics

### View Hosting Metrics

```bash
# Open Firebase Console Hosting section
firebase open hosting

# Direct URL:
# https://console.firebase.google.com/project/boxedsneakers/hosting
```

### Enable Hosting Analytics

Already enabled via Google Analytics (gtag.js in index.html).

View analytics at: https://console.firebase.google.com/project/boxedsneakers/analytics

---

## Troubleshooting

### Issue: "Firebase project not found"

```bash
# Select correct project
firebase use boxedsneakers

# Or list available projects
firebase projects:list
```

### Issue: "Permission denied"

```bash
# Check login
firebase login:list

# Re-login if needed
firebase logout
firebase login
```

### Issue: Firebase Auth not working

**Cause:** Domain not authorized

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your Firebase Hosting domain:
   - `boxedsneakers.web.app`
   - `boxedsneakers.firebaseapp.com`

### Issue: 404 on page refresh

**Cause:** Missing rewrites in firebase.json

**Solution:** Add rewrites to firebase.json (already provided above)

### Issue: Assets not loading

**Check:**
```bash
# Verify files in dist/
ls -la dist/

# Check build succeeded
npm run build
```

---

## Performance Optimization

### Current Optimizations (Already Applied)

✅ **Build optimization:** `npm run optimize` (gzip/brotli)  
✅ **Caching headers:** 1 year for images, 1 week for CSS/JS  
✅ **CDN:** Firebase's global CDN (200+ edge locations)  
✅ **HTTP/2:** Enabled by default  
✅ **SSL:** Automatic certificates  

### Additional Optimizations

```bash
# Optimize images before build
# (Add to build process if needed)
npm run optimize
```

---

## Cost Analysis

### Firebase Hosting Pricing

| Resource | Free Tier | Your Usage | Cost |
|----------|-----------|------------|------|
| **Storage** | 10 GB | ~13 MB | $0 |
| **Transfer** | 10 GB/month | ~2-60 GB | $0 |
| **Custom Domain** | Included | 1 domain | $0 |
| **SSL** | Included | 1 cert | $0 |
| **Total** | - | - | **$0/month** |

**Your site will be FREE for typical traffic levels.**

---

## Deployment Checklist

Before first deployment:

- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged in (`firebase login`)
- [ ] Project selected (`firebase use boxedsneakers`)
- [ ] `firebase.json` created
- [ ] `.firebaserc` created
- [ ] Build succeeds (`npm run build`)
- [ ] Firebase Hosting initialized
- [ ] Firebase Auth domains configured
- [ ] GitHub Actions (optional)

After deployment:

- [ ] Site loads at `https://boxedsneakers.web.app`
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] Firebase Auth works
- [ ] Firestore connects
- [ ] No console errors
- [ ] Custom domain configured (optional)

---

## Commands Summary

```bash
# Install
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time)
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting

# Preview locally
firebase serve

# Staging deploy
firebase hosting:channel:deploy staging

# View releases
firebase hosting:releases:list

# Rollback
firebase hosting:releases:rollback

# Open console
firebase open hosting
```

---

## Support

- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting
- **Firebase CLI Reference:** https://firebase.google.com/docs/cli
- **Console:** https://console.firebase.google.com/project/boxedsneakers/hosting

---

**Ready to deploy! Run: `firebase deploy --only hosting`**
