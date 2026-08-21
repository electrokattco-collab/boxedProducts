# Production Deployment Guide - Boxed Sneakers

Complete guide for deploying the Boxed Sneakers e-commerce site to production at **boxedsneakers.com**.

---

## Table of Contents

1. [Current Setup Analysis](#current-setup-analysis)
2. [Deployment Strategy](#deployment-strategy)
3. [Environment Setup](#environment-setup)
4. [Domain Configuration](#domain-configuration)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Production Checklist](#production-checklist)
7. [Rollback Plan](#rollback-plan)
8. [Post-Deployment](#post-deployment)

---

## Current Setup Analysis

### Existing Infrastructure
- **Current URL**: https://electrokattco-collab.github.io/boxedProducts/
- **Hosting**: GitHub Pages (free tier)
- **Auto-deploy**: From `main` branch
- **Repository**: electrokattco-collab/boxedProducts

### Limitations of Current Setup
1. URL contains GitHub username (not professional)
2. No server-side processing
3. Limited to static content
4. No environment variable support
5. No CI/CD customization

### Target Infrastructure
- **Production URL**: https://boxedsneakers.com
- **Staging URL**: https://dev.boxedsneakers.com (or preview deploys)
- **Hosting Options**:
  - Firebase Hosting (recommended - integrates with existing Firebase)
  - Vercel (excellent for React apps)
  - Netlify (great for static sites)
  - AWS S3 + CloudFront (enterprise-grade)

---

## Deployment Strategy

### Branch Strategy (Git Flow)

```
main (production)
  ↑
development (staging/integration)
  ↑
feature/react-migration
feature/bug-fixes
feature/new-features
```

### Workflow

1. **Development Phase**
   - Work on `development` branch
   - Preview deployments for each PR
   - Test thoroughly before merging

2. **Staging Phase**
   - Merge to `development` triggers staging deploy
   - QA testing on staging environment
   - Client approval

3. **Production Phase**
   - Merge `development` → `main`
   - Auto-deploy to production
   - Monitor and verify

---

## Environment Setup

### Required Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Local | Any | localhost:3000 | Development |
| Preview | PR branches | Auto-generated | PR testing |
| Staging | development | dev.boxedsneakers.com | QA/Testing |
| Production | main | boxedsneakers.com | Live site |

### Environment Variables

Create separate `.env` files for each environment:

```bash
# .env.development (staging)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=boxed-sneakers-staging
VITE_FIREBASE_AUTH_DOMAIN=boxed-sneakers-staging.firebaseapp.com

# .env.production (live)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=boxed-sneakers-prod
VITE_FIREBASE_AUTH_DOMAIN=boxed-sneakers-prod.firebaseapp.com
```

---

## Domain Configuration

### Option 1: Firebase Hosting (Recommended)

**Why Firebase Hosting?**
- Integrates seamlessly with existing Firebase (Auth, Firestore)
- Free SSL certificates
- Global CDN
- Easy rollbacks
- Custom domain support

**Steps:**

1. **Purchase Domain**
   ```bash
   # Purchase boxedsneakers.com from:
   # - Namecheap
   # - Google Domains
   # - Cloudflare
   ```

2. **Configure Firebase Hosting**
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize hosting in your project
   firebase init hosting
   
   # Set build directory to 'dist' (Vite output)
   # Configure as single-page app: Yes
   ```

3. **Update firebase.json**
   ```json
   {
     "hosting": {
       "site": "boxedsneakers",
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "/assets/**",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Connect Custom Domain**
   ```bash
   # In Firebase Console > Hosting > Add custom domain
   # Enter: boxedsneakers.com
   # Follow DNS configuration steps
   ```

5. **DNS Configuration**
   ```
   # Add these A records in your domain registrar:
   Type: A
   Name: @
   Value: 199.36.158.100
   
   Type: A
   Name: www
   Value: 199.36.158.100
   
   # Or use CNAME for www subdomain:
   Type: CNAME
   Name: www
   Value: boxedsneakers.web.app
   ```

### Option 2: Vercel (Alternative)

**Why Vercel?**
- Excellent React support
- Automatic preview deployments
- Edge network
- Analytics included

**Steps:**

1. **Import Project**
   ```bash
   # Connect GitHub repo to Vercel
   # Select: electrokattco-collab/boxedProducts
   # Framework: Vite
   # Build command: npm run build
   # Output directory: dist
   ```

2. **Configure Custom Domain**
   ```
   # In Vercel Dashboard > Project Settings > Domains
   # Add: boxedsneakers.com
   # Add: www.boxedsneakers.com (redirect to apex)
   ```

3. **Update DNS**
   ```
   # Add Vercel nameservers or CNAME record
   # Vercel will provide specific instructions
   ```

### Option 3: Netlify (Alternative)

**Why Netlify?**
- Great for static sites
- Form handling
- Branch previews
- Split testing

**Steps:**

1. **Connect Repository**
   ```bash
   # In Netlify Dashboard > Add new site > Import from Git
   # Select GitHub repository
   # Build settings will auto-detect
   ```

2. **Configure Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Add Custom Domain**
   ```
   # Domain Settings > Add custom domain
   # Enter: boxedsneakers.com
   # Configure DNS as instructed
   ```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

env:
  NODE_VERSION: '18'
  
jobs:
  # Build and test
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
      
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/

  # Deploy to Staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/development'
    environment:
      name: staging
      url: https://dev.boxedsneakers.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to Firebase (Staging)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}
          channelId: live
          projectId: boxed-sneakers-staging

  # Deploy to Production
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://boxedsneakers.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to Firebase (Production)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}
          channelId: live
          projectId: boxed-sneakers-prod
```

### Required GitHub Secrets

Add these in GitHub Repository Settings > Secrets and variables > Actions:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PROD
```

---

## Production Checklist

### Pre-Deployment

- [ ] All features tested on staging
- [ ] Performance optimized (lazy loading, code splitting)
- [ ] SEO meta tags configured (React Helmet)
- [ ] Analytics tracking implemented
- [ ] Error tracking (Sentry recommended)
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Database backups verified
- [ ] Rollback plan documented

### Deployment Steps

1. **Prepare Release**
   ```bash
   # Ensure development branch is up to date
   git checkout development
   git pull origin development
   
   # Test locally
   npm run build
   npm run preview
   ```

2. **Create Pull Request**
   ```bash
   # From development to main
   git checkout main
   git pull origin main
   git merge development
   git push origin main
   ```

3. **Deploy**
   - CI/CD automatically deploys on merge to main
   - Monitor deployment progress in GitHub Actions

4. **Verify Production**
   ```bash
   # Check site is live
   curl -I https://boxedsneakers.com
   
   # Test critical paths:
   # - Homepage loads
   # - Products display
   # - Add to cart works
   # - Checkout flow
   # - Login/logout
   # - Admin panel (admin users)
   ```

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Performance metrics acceptable
- [ ] No console errors
- [ ] Analytics receiving data
- [ ] Notify stakeholders
- [ ] Monitor for 24 hours

---

## Rollback Plan

### Quick Rollback

**Firebase Hosting:**
```bash
# List previous releases
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:clone SOURCE_SITE:SOURCE_CHANNEL TARGET_SITE:live
```

**Git Revert:**
```bash
# Revert last commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

### Database Rollback

```bash
# Export current data before major changes
firebase firestore:export ./backups/$(date +%Y%m%d)

# Import previous backup if needed
firebase firestore:import ./backups/20240101
```

---

## Post-Deployment Monitoring

### Tools to Set Up

1. **Google Analytics 4**
   ```javascript
   // Already in index.html, verify tracking ID
   gtag('config', 'G-DHSVYH1PT0');
   ```

2. **Search Console**
   - Add property: boxedsneakers.com
   - Submit sitemap
   - Monitor indexing

3. **Uptime Monitoring**
   - UptimeRobot (free tier)
   - Pingdom
   - Firebase Performance Monitoring

4. **Error Tracking**
   ```bash
   npm install @sentry/react
   ```

### Key Metrics to Monitor

- Page load time (< 3s target)
- Core Web Vitals (LCP, FID, CLS)
- Conversion rate
- Cart abandonment rate
- Error rates
- Firebase read/write counts

---

## Cost Estimates

### Monthly Costs (Estimated)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Domain | .com | $10-15/year |
| Firebase Hosting | Spark (free) | $0 |
| Firebase Firestore | Spark (free) | $0 |
| Firebase Auth | Spark (free) | $0 |
| Firebase Storage | Spark (free) | $0 |
| **Total** | | **~$1-2/month** |

### When to Upgrade (Pay-as-you-go)

- > 10GB hosting transfer/month
- > 50K Firestore reads/day
- > 10GB storage
- Need phone auth

---

## Migration Timeline

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| **Planning** | 1-2 days | Domain purchase, environment setup |
| **Development** | 10-15 days | React migration on `development` branch |
| **Testing** | 3-5 days | QA on staging environment |
| **Launch** | 1 day | Production deployment |
| **Monitoring** | 7 days | Post-launch support |

**Total: 3-4 weeks**

---

## Support Contacts

| Service | Support URL |
|---------|-------------|
| Firebase | https://firebase.google.com/support |
| GitHub | https://support.github.com |
| Domain Registrar | (depends on choice) |

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Firebase
firebase login           # Authenticate
firebase init            # Initialize project
firebase deploy          # Deploy manually
firebase hosting:clone   # Rollback

# Git
git checkout development # Switch to dev branch
git checkout -b feature/x # Create feature branch
git merge development    # Merge to main
```

---

*Last updated: 2026-05-18*
*Next review: Post-deployment*
