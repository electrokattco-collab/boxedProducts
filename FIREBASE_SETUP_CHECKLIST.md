# Firebase Hosting Setup Checklist

## Phase 1: Initial Setup

### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase --version
```

### Login to Firebase
```bash
firebase login
# Opens browser for authentication
```

### Verify Project Access
```bash
firebase projects:list
# Should show: boxedsneakers
```

## Phase 2: Project Configuration

### Initialize Firebase Hosting
```bash
firebase init hosting

# Answer these questions:
# ? Select a default Firebase project: boxedsneakers
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app? No
# ? Set up automatic builds with GitHub? No (optional)
```

### Verify Configuration Files
Check these files exist:
- [ ] `firebase.json` ✓ (created)
- [ ] `.firebaserc` ✓ (created)

## Phase 3: Pre-deployment

### Build Project
```bash
npm run build
```

### Verify Build Output
```bash
ls -la dist/
# Should see: index.html, admin.html, assets/, src/, data/
```

### Test Locally (Optional)
```bash
firebase serve
# Open http://localhost:5000
```

## Phase 4: Deploy

### Deploy to Firebase
```bash
firebase deploy --only hosting
```

### Or use deployment script
```bash
./deploy-firebase.sh
```

## Phase 5: Post-deployment (CRITICAL)

### Add Authorized Domains to Firebase Auth

**This step is REQUIRED for Firebase Auth to work!**

1. Go to: https://console.firebase.google.com/project/boxedsneakers/authentication
2. Click **Settings** (gear icon)
3. Go to **Authorized domains** tab
4. Click **Add domain**
5. Add these domains:
   - [ ] `boxedsneakers.web.app`
   - [ ] `boxedsneakers.firebaseapp.com`
   - [ ] `boxedsneakers.com` (if using custom domain)
   - [ ] `www.boxedsneakers.com` (if using www)

### Verify Deployment

- [ ] Site loads: https://boxedsneakers.web.app
- [ ] Admin page works: https://boxedsneakers.web.app/admin.html
- [ ] Cart page works: https://boxedsneakers.web.app/boxedCart.html
- [ ] Images load correctly
- [ ] Firebase Auth works (test login)
- [ ] Firestore connects (products load)
- [ ] No console errors

## Phase 6: Custom Domain (Optional)

### Add Custom Domain
1. Go to: https://console.firebase.google.com/project/boxedsneakers/hosting
2. Click **Add custom domain**
3. Enter: `boxedsneakers.com`
4. Follow DNS verification steps

### Configure DNS
At your domain registrar:
```
Type: TXT
Name: @
Value: [Firebase verification string]

Type: A
Name: @
Value: [Firebase IP addresses]
```

## Phase 7: CI/CD (Optional)

### Setup GitHub Actions
1. Go to GitHub repository → Settings → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT_BOXEDSNEAKERS`:
   ```bash
   firebase init hosting:github
   ```

### Verify Auto-deployment
- [ ] Push to `main` branch triggers preview deploy
- [ ] Push to `production` branch triggers production deploy

## Quick Reference Commands

```bash
# Deploy
firebase deploy --only hosting

# Preview locally
firebase serve

# View releases
firebase hosting:releases:list

# Rollback
firebase hosting:releases:rollback

# Staging deploy
firebase hosting:channel:deploy staging --expires 7d

# Open console
firebase open hosting
```

## Troubleshooting

### "Firebase project not found"
```bash
firebase use boxedsneakers
```

### "Permission denied"
```bash
firebase logout
firebase login
```

### "Firebase Auth not working"
- Verify domain is in authorized domains list
- Check browser console for CSP errors

### "404 on refresh"
- Check firebase.json rewrites configuration
- Ensure HTML files exist in dist/

## Support

- Firebase Hosting Docs: https://firebase.google.com/docs/hosting
- Console: https://console.firebase.google.com/project/boxedsneakers/hosting
