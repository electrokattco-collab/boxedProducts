# 🚀 Deploy BoxedSneakers to Firebase Hosting NOW

## Quick Deploy (3 Commands)

```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase (if not already logged in)
firebase login

# 3. Deploy
firebase deploy --only hosting
```

**Done!** Your site will be live at:
- https://boxedsneakers.web.app
- https://boxedsneakers.firebaseapp.com

---

## ⚡ Even Faster (Using Our Script)

```bash
# One command does everything
./deploy-firebase.sh
```

---

## ⚠️ CRITICAL: After First Deployment

**Firebase Auth will NOT work until you do this:**

1. Go to: https://console.firebase.google.com/project/boxedsneakers/authentication
2. Click **Settings** (gear icon) → **Authorized domains**
3. Click **Add domain**
4. Add: `boxedsneakers.web.app`
5. Add: `boxedsneakers.firebaseapp.com`

---

## What Was Set Up For You

### Configuration Files Created:
- ✅ `firebase.json` - Hosting configuration with caching & security headers
- ✅ `.firebaserc` - Project selection (boxedsneakers)
- ✅ `.github/workflows/firebase-hosting.yml` - Auto-deployment on push

### Features Configured:
- ✅ **URL Rewrites**: `/admin` → `/admin.html`, `/cart` → `/boxedCart.html`
- ✅ **Caching**: 1 year for images, 1 week for CSS/JS
- ✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- ✅ **CDN**: Firebase's global CDN (200+ edge locations)
- ✅ **SSL**: Automatic HTTPS certificates

---

## Deployment Options

### Option 1: Manual Deploy
```bash
npm run build
firebase deploy --only hosting
```

### Option 2: Auto-deploy Script
```bash
./deploy-firebase.sh
```

### Option 3: GitHub Actions (Auto-deploy on push)
Already configured in `.github/workflows/firebase-hosting.yml`

Just push to GitHub:
```bash
git add .
git commit -m "Deploy to Firebase"
git push origin main
```

---

## Verification Checklist

After deployment, verify:

- [ ] https://boxedsneakers.web.app loads
- [ ] https://boxedsneakers.web.app/admin.html works
- [ ] Images display correctly
- [ ] Firebase Auth works (test login)
- [ ] No console errors

Run automated check:
```bash
node monitoring/health-check.js https://boxedsneakers.web.app
```

---

## Your Site URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://boxedsneakers.web.app |
| **Fallback** | https://boxedsneakers.firebaseapp.com |
| **Custom Domain** | https://boxedsneakers.com (after setup) |

---

## Cost

**$0/month** for typical traffic (within Firebase free tier)

---

## Ready?

**Run this now:**
```bash
firebase deploy --only hosting
```

Then add the domains to Firebase Auth authorized domains!
