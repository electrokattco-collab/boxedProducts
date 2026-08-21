# Coolify Static Site Deployment Guide

## Deployment Configuration

### Step 1: Create Resource
1. In Coolify Dashboard → Projects → Boxed Sneakers
2. Click **"+ Add Resource"**
3. Select **"Application"**
4. Choose your Git repository

### Step 2: Build Settings
| Setting | Value |
|---------|-------|
| **Build Pack** | `Static` |
| **Install Command** | `npm ci --omit=dev --no-audit --no-fund` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Publish Directory** | `dist` |

### Step 3: Environment Variables
```
NODE_ENV=production
```

### Step 4: Advanced Settings (Optional)
If you need custom nginx configuration, add to **Custom Nginx Configuration**:

```nginx
# Custom routing for multi-page site
location = /admin {
    try_files /admin.html =404;
}

location = /cart {
    try_files /boxedCart.html =404;
}

location = /about {
    try_files /boxedAboutUs.html =404;
}

location = /contact {
    try_files /boxedContacts.html =404;
}

# Enhanced caching for assets
location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Step 5: Deploy
Click **"Deploy"** button

---

## Performance Comparison

| Metric | Static Site | Docker |
|--------|-------------|--------|
| **Build Time** | ~30s | ~90s |
| **Memory Usage** | ~5-10 MB | ~15-20 MB |
| **Startup Time** | <1s | 2-3s |
| **CPU Usage** | Minimal | Low |

---

## Rollback Plan

### If Static Site Doesn't Work
1. Delete the Static Site resource
2. Create new Application resource
3. Select **Dockerfile** build pack
4. Use the existing `Dockerfile`

---

## Troubleshooting

### Issue: Pages show 404 on refresh
**Solution**: Add SPA routing to Custom Nginx Config:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: Assets not loading
**Solution**: Verify build output includes all files:
```bash
npm run build
ls -la dist/
```

### Issue: Firebase not connecting
**Solution**: Add domain to Firebase Console → Auth → Authorized Domains
