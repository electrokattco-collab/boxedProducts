# Coolify Deployment Guide - Boxed Sneakers

Complete guide for deploying the Boxed Sneakers e-commerce site to [Coolify](https://coolify.io/).

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Coolify Setup](#coolify-setup)
4. [Deployment Methods](#deployment-methods)
5. [Environment Variables](#environment-variables)
6. [Domain Configuration](#domain-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This project is configured for deployment on Coolify using Docker. The deployment uses:

- **Multi-stage Docker build** for optimized image size
- **Nginx** as the web server for serving static files
- **Gzip compression** for faster loading
- **Security headers** for protection
- **Health checks** for monitoring

---

## Prerequisites

### Server Requirements

- A VPS/server with Coolify installed
- Minimum specs: 1 CPU, 1GB RAM, 10GB storage
- Ubuntu 20.04+ recommended

### Project Requirements

- Git repository (GitHub, GitLab, or self-hosted)
- All code pushed to your repository
- Firebase project configured (for auth/database)

---

## Coolify Setup

### Step 1: Access Coolify Dashboard

1. Log in to your Coolify instance at `https://your-coolify-domain.com`
2. Create a new Project (e.g., "Boxed Sneakers")
3. Add a new Environment (e.g., "Production")

### Step 2: Create New Resource

1. Click **"+ New Resource"**
2. Select **"Application"**
3. Choose your Git source:
   - **GitHub**: Connect your GitHub account and select the repository
   - **GitLab**: Connect your GitLab account
   - **Self-hosted**: Enter your repository URL

### Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| Build Pack | `Dockerfile` |
| Base Directory | `/` (root) |
| Dockerfile Path | `Dockerfile` |
| Port | `80` |

### Step 4: Configure Environment Variables

Add these environment variables in Coolify:

```
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Node Environment
NODE_ENV=production
```

> **Note**: All `VITE_` prefixed variables are embedded at build time, so they must be set BEFORE deploying.

---

## Deployment Methods

### Method 1: Git-based Auto-Deploy (Recommended)

1. In Coolify, enable **"Auto Deploy"**
2. Select the branch to deploy (e.g., `main` or `production`)
3. Coolify will automatically deploy when you push to that branch

### Method 2: Manual Deploy

1. In Coolify dashboard, click **"Deploy"** button
2. Or use the Coolify CLI:
   ```bash
   coolify deploy --resource=boxed-sneakers
   ```

### Method 3: Webhook Deploy

1. Get the webhook URL from Coolify resource settings
2. Add it to your Git repository webhooks
3. Deploys trigger automatically on push

---

## Domain Configuration

### Custom Domain Setup

1. In Coolify, go to your application settings
2. Navigate to **"Domains"**
3. Add your domain: `boxedsneakers.com`
4. Add www redirect: `www.boxedsneakers.com`

### DNS Configuration

Point your domain to your Coolify server:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

Or use Coolify's built-in SSL/TLS proxy with:

```
Type: CNAME
Name: @
Value: your-coolify-domain.com
```

---

## SSL/HTTPS Setup

Coolify can automatically provision SSL certificates:

1. Go to your application in Coolify
2. Navigate to **"Settings" > "SSL/TLS"**
3. Enable **"Automatic HTTPS"**
4. Select your domain
5. Coolify will use Let's Encrypt to generate certificates

Alternatively, manually upload certificates:
1. Go to **"SSL/TLS" > "Custom Certificates"**
2. Upload your certificate and private key

---

## Post-Deployment

### Verify Deployment

1. Visit your domain: `https://boxedsneakers.com`
2. Check that:
   - Homepage loads correctly
   - Product images display
   - Firebase Auth works (login/logout)
   - Cart functionality works
   - Admin panel accessible (for admin users)

### Health Check

The deployment includes a health check endpoint. Verify it's working:

```bash
curl -f http://your-domain/ || echo "Health check failed"
```

### Monitoring

Set up monitoring in Coolify:

1. Go to **"Monitoring"** tab
2. Enable resource monitoring
3. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Container restarts

---

## Troubleshooting

### Build Failures

**Issue**: Docker build fails

**Solutions**:
```bash
# Check build logs in Coolify dashboard
# Verify all files are committed to git
git status

# Test build locally
docker build -t boxed-sneakers:test .
docker run -p 8080:80 boxed-sneakers:test
```

### 404 Errors on Page Refresh

**Issue**: Refreshing a page shows 404

**Solution**: This is already handled by the Nginx configuration with `try_files`. If still occurring:
1. Check that `nginx.conf` is properly copied in the Dockerfile
2. Verify the build includes all HTML files

### Firebase Connection Issues

**Issue**: Firebase not connecting

**Solutions**:
1. Verify all `VITE_FIREBASE_*` environment variables are set in Coolify
2. Check Firebase console for API key restrictions
3. Add your Coolify domain to Firebase authorized domains:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add: `boxedsneakers.com`
   - Add: `www.boxedsneakers.com`

### Static Assets Not Loading

**Issue**: Images/CSS/JS not loading

**Solutions**:
1. Check browser console for 404 errors
2. Verify assets are in the `dist` folder after build
3. Check Nginx logs in Coolify:
   ```bash
   docker logs <container_id>
   ```

### Slow Performance

**Issue**: Site loads slowly

**Solutions**:
1. Enable gzip compression (already enabled in nginx.conf)
2. Use a CDN for images (Cloudflare, etc.)
3. Optimize images in the `assets` folder
4. Enable browser caching

---

## Useful Commands

### Local Docker Testing

```bash
# Build the image
docker build -t boxed-sneakers .

# Run the container
docker run -p 8080:80 boxed-sneakers

# Access at http://localhost:8080
```

### Coolify CLI Commands

```bash
# Deploy
coolify deploy --resource=boxed-sneakers

# View logs
coolify logs --resource=boxed-sneakers

# Restart
coolify restart --resource=boxed-sneakers
```

---

## File Structure Reference

```
boxedProducts/
├── Dockerfile              # Docker build configuration
├── nginx.conf              # Nginx server configuration
├── coolify.yaml            # Coolify compose file
├── .dockerignore           # Files to exclude from Docker build
├── COOLIFY_DEPLOYMENT_GUIDE.md  # This guide
├── index.html              # Main entry point
├── admin.html              # Admin panel
├── boxed*.html             # Site pages
├── pages/                  # Additional pages
├── assets/                 # Images and static files
├── src/                    # JavaScript source files
└── data/                   # Data files
```

---

## Next Steps

1. ✅ Set up your Coolify instance
2. ✅ Configure environment variables
3. ✅ Deploy the application
4. ✅ Configure custom domain
5. ✅ Set up SSL certificates
6. ✅ Verify all functionality
7. 🔄 Set up CI/CD pipeline for automatic deployments
8. 🔄 Configure monitoring and alerts

---

## Support

- **Coolify Docs**: https://coolify.io/docs/
- **Coolify Discord**: https://discord.gg/coolify
- **Project Issues**: Create an issue in your Git repository

---

*Last updated: 2026-07-14*
