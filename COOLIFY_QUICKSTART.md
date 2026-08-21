# Coolify Quick Start - Boxed Sneakers

Deploy this project to Coolify in 5 minutes.

## Prerequisites

- Coolify instance (self-hosted or cloud)
- Git repository with this project
- Firebase project configured

## Step-by-Step Deployment

### 1. Push Code to Repository

```bash
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 2. Create Resource in Coolify

1. Log in to your Coolify dashboard
2. Click **"+ New Resource"** → **"Application"**
3. Select your Git repository
4. Configure:
   - **Build Pack**: `Dockerfile`
   - **Port**: `80`

### 3. Set Environment Variables

In Coolify, add these required variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Deploy

Click **"Deploy"** button in Coolify.

Wait 2-3 minutes for the build to complete.

### 5. Configure Domain

1. Go to resource settings → **Domains**
2. Add your domain: `boxedsneakers.com`
3. Update DNS to point to your Coolify server IP
4. Enable SSL (Let's Encrypt)

### 6. Verify

Visit your domain and test:
- [ ] Homepage loads
- [ ] Product images display
- [ ] Login/Logout works
- [ ] Cart functionality works

## Files Added for Coolify

| File | Purpose |
|------|---------|
| `Dockerfile` | Docker build configuration |
| `nginx.conf` | Web server configuration |
| `coolify.yaml` | Coolify compose file |
| `.dockerignore` | Excludes unnecessary files |
| `scripts/build.js` | Cross-platform build script |

## Useful Commands

```bash
# Test build locally
node scripts/build.js

# View build output
ls -la dist/

# Check Coolify logs
coolify logs --resource=boxed-sneakers
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Coolify dashboard |
| 404 on refresh | Verify nginx.conf is copied in Dockerfile |
| Firebase errors | Add domain to Firebase authorized domains |
| Assets not loading | Check dist/ folder has all files |

## Need Help?

- Full guide: [COOLIFY_DEPLOYMENT_GUIDE.md](./COOLIFY_DEPLOYMENT_GUIDE.md)
- Coolify Docs: https://coolify.io/docs/
