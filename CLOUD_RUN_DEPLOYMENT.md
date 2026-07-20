# BoxedSneakers - Cloud Run Deployment Guide

**⚠️ ARCHITECT WARNING:** Cloud Run is NOT the optimal deployment target for this static website. This guide is provided for cases where Cloud Run is specifically required (corporate policy, specific compliance needs, or future SSR plans).

**Recommended alternative:** Firebase Hosting (see FIREBASE_HOSTING_DEPLOYMENT.md)

---

## Table of Contents

1. [Cloud Run Readiness](#phase-2--cloud-run-readiness)
2. [Containerization](#phase-3--containerization)
3. [Google Cloud Configuration](#phase-4--google-cloud-configuration)
4. [Firebase Integration](#phase-5--firebase-integration)
5. [Deployment Commands](#phase-6--deployment-commands)
6. [Verification](#phase-7--verification)
7. [Cost Analysis](#phase-8--cost-analysis)
8. [Optimization](#phase-9--optimization)

---

# Phase 2 — Cloud Run Readiness

## 2.1 Server Requirements Analysis

Since this is a **static website**, we need a static file server. Options:

| Server | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Nginx** | Fast, proven, small image | Extra layer | ✅ **Use this** |
| **Node.js + serve** | JavaScript ecosystem | Slower, larger image | ❌ Not needed |
| **Caddy** | Easy config, automatic HTTPS | Not needed in Cloud Run | ❌ Overkill |
| **Python http.server** | Simple | Not production-ready | ❌ Unacceptable |

### Decision: Nginx

**Reasoning:**
- Fastest static file serving
- Smallest container image (Alpine-based)
- Industry standard
- Easy configuration
- Built-in gzip compression

## 2.2 Production Configuration

| Setting | Value | Reasoning |
|---------|-------|-----------|
| **Port** | `8080` | Cloud Run requires port 8080 |
| **Startup Command** | `nginx -g 'daemon off;'` | Run Nginx in foreground |
| **Build Command** | `npm run build` | Generate static files |
| **Health Check** | `/health` | Custom endpoint for Cloud Run |

### Environment Variables

```bash
# Optional - for future environment-specific configs
NODE_ENV=production
PORT=8080
```

### Container Requirements

| Resource | Minimum | Recommended | Maximum |
|----------|---------|-------------|---------|
| **Memory** | 128 MiB | 256 MiB | 512 MiB |
| **CPU** | 1 | 1 | 2 |
| **Concurrency** | 80 | 1000 | 1000 |
| **Timeout** | 300s | 300s | 300s |

---

# Phase 3 — Containerization

## 3.1 Production Dockerfile

```dockerfile
# ============================================================================
# Boxed Sneakers - Cloud Run Production Dockerfile
# Multi-stage build with Nginx for static file serving
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------------------------------
FROM node:18.20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache dumb-init

# Copy package files for layer caching
COPY package*.json ./

# Install dependencies (development only for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN test -f dist/index.html || (echo "Build failed: index.html not found" && exit 1)

# Optional: Run optimization (gzip/brotli compression)
RUN npm run optimize 2>/dev/null || echo "Optimization skipped"

# ----------------------------------------------------------------------------
# Stage 2: Production Stage with Nginx
# ----------------------------------------------------------------------------
FROM nginx:1.25-alpine

# Add metadata labels
LABEL maintainer="Boxed Sneakers Team"
LABEL description="Boxed Sneakers E-commerce Platform - Cloud Run"
LABEL version="1.0.0"

# Install required packages
RUN apk add --no-cache --update curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1000 -S nginx-group && \
    adduser -S nginx-user -u 1000 -G nginx-group

# Copy custom nginx configuration for Cloud Run
COPY nginx-cloud-run.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder --chown=nginx-user:nginx-group /app/dist /usr/share/nginx/html

# Create health check endpoint
RUN echo "healthy" > /usr/share/nginx/html/health

# Set correct permissions
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Cloud Run requires port 8080
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 3.2 Nginx Configuration for Cloud Run

```nginx
# nginx-cloud-run.conf
# Optimized for Google Cloud Run

server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        font/woff2
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Cache static assets (1 year for images/fonts)
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        access_log off;
    }

    # Cache CSS/JS (1 week)
    location ~* \.(css|js)$ {
        expires 1w;
        add_header Cache-Control "public, must-revalidate";
        access_log off;
    }

    # Health check endpoint for Cloud Run
    location = /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Main application - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

## 3.3 .dockerignore

```gitignore
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist
build

# Testing
coverage
.nyc_output

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# CI/CD
.github

# Documentation
*.md
!README.md

# Logs
logs
*.log

# Firebase
.firebaserc
firebase-debug.log
.firebase/

# Playwright
test-results/
playwright-report/

# Misc
.cache
.temp
.tmp

# Scripts
scripts/node_modules/
scripts/serviceAccountKey.json

# React migration starter
react-migration-starter/

# Monitoring (not needed in container)
monitoring/
```

---

# Phase 4 — Google Cloud Configuration

## 4.1 cloudbuild.yaml

```yaml
# Cloud Build configuration for BoxedSneakers
# Builds container and deploys to Cloud Run

steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:$COMMIT_SHA'
      - '-t'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:latest'
      - '.'
    timeout: 600s

  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:$COMMIT_SHA'
    timeout: 300s

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:latest'
    timeout: 300s

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'boxed-sneakers'
      - '--image=${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:$COMMIT_SHA'
      - '--region=${_REGION}'
      - '--platform=managed'
      - '--port=8080'
      - '--memory=256Mi'
      - '--cpu=1'
      - '--concurrency=1000'
      - '--max-instances=100'
      - '--min-instances=0'
      - '--timeout=300'
      - '--ingress=all'
      - '--allow-unauthenticated'
      - '--service-account=${_SERVICE_ACCOUNT}'
      - '--set-env-vars=NODE_ENV=production'
      - '--health-check-path=/health'
    timeout: 300s

substitutions:
  _REGION: us-central1
  _REPOSITORY: boxed-sneakers-repo
  _SERVICE_ACCOUNT: boxed-sneakers-sa@$PROJECT_ID.iam.gserviceaccount.com

images:
  - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:$COMMIT_SHA'
  - '${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPOSITORY}/boxed-sneakers:latest'

options:
  logging: CLOUD_LOGGING_ONLY
  
timeout: 1800s
```

## 4.2 .gcloudignore

```gitignore
# This file specifies files that are *not* uploaded to Google Cloud

# Git
.git
.gitignore

# Node.js
node_modules

# Build outputs (will be generated in container)
dist

# Testing
coverage
.nyc_output
test-results/
playwright-report/
tests/

# Environment
.env
.env.*

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs

# Documentation
*.md
!README.md

# Local scripts not needed for deployment
scripts/serviceAccountKey.json

# Misc
.cache
.temp
.tmp
```

## 4.3 Terraform Configuration (Optional)

```hcl
# main.tf - Infrastructure as Code for Cloud Run deployment

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com"
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "boxed-sneakers-repo"
  description   = "Boxed Sneakers container images"
  format        = "DOCKER"
  
  depends_on = [google_project_service.apis["artifactregistry.googleapis.com"]]
}

# Create service account
resource "google_service_account" "cloud_run_sa" {
  account_id   = "boxed-sneakers-sa"
  display_name = "Boxed Sneakers Cloud Run Service Account"
}

# Deploy Cloud Run service
resource "google_cloud_run_service" "boxed_sneakers" {
  name     = "boxed-sneakers"
  location = var.region

  template {
    spec {
      container_concurrency = 1000
      timeout_seconds       = 300
      service_account_name  = google_service_account.cloud_run_sa.email
      
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/boxed-sneakers-repo/boxed-sneakers:latest"
        
        ports {
          container_port = 8080
        }
        
        resources {
          limits = {
            cpu    = "1"
            memory = "256Mi"
          }
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        startup_probe {
          initial_delay_seconds = 5
          period_seconds       = 5
          timeout_seconds      = 3
          failure_threshold    = 3
          
          http_get {
            path = "/health"
            port = 8080
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "100"
        "run.googleapis.com/ingress"       = "all"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.apis["run.googleapis.com"]]
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.boxed_sneakers.name
  location = google_cloud_run_service.boxed_sneakers.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output service URL
output "service_url" {
  value = google_cloud_run_service.boxed_sneakers.status[0].url
}
```

---

# Phase 5 — Firebase Integration

## 5.1 Firebase Configuration for Cloud Run

### No Changes Required to Firebase Code

The Firebase SDK is client-side and works identically regardless of hosting platform. However, you MUST add your Cloud Run domain to Firebase authorized domains.

### Required Actions

#### 1. Add Cloud Run Domain to Firebase Auth

```bash
# After deployment, get your Cloud Run URL
export SERVICE_URL=$(gcloud run services describe boxed-sneakers --region=us-central1 --format='value(status.url)')
echo "Service URL: $SERVICE_URL"

# Extract domain (e.g., boxed-sneakers-xyz-uc.a.run.app)
export DOMAIN=$(echo $SERVICE_URL | sed 's|https://||')

# Add to Firebase authorized domains via Console
# Go to: Firebase Console → Authentication → Settings → Authorized domains
# Add: $DOMAIN
```

#### 2. Firebase Security Rules

Your existing Firestore and Storage security rules remain unchanged. They work the same on Cloud Run.

#### 3. CORS Configuration (if needed)

If you encounter CORS issues, ensure your Cloud Run domain is allowed:

```javascript
// firebaseConfig.js - Already configured correctly
// The connect-src CSP already includes all Firebase domains
```

---

# Phase 6 — Deployment Commands

## 6.1 Prerequisites

```bash
# Install and authenticate gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    firestore.googleapis.com \
    identitytoolkit.googleapis.com
```

## 6.2 Create Artifact Registry

```bash
# Set variables
export REGION=us-central1
export PROJECT_ID=$(gcloud config get-value project)
export REPOSITORY=boxed-sneakers-repo

# Create Artifact Registry repository
gcloud artifacts repositories create $REPOSITORY \
    --repository-format=docker \
    --location=$REGION \
    --description="Boxed Sneakers container images"

# Configure Docker authentication
gcloud auth configure-docker $REGION-docker.pkg.dev
```

## 6.3 Create Service Account

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create boxed-sneakers-sa \
    --display-name="Boxed Sneakers Cloud Run SA"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:boxed-sneakers-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:boxed-sneakers-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"
```

## 6.4 Build and Deploy

### Option A: Using Cloud Build (Recommended)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

### Option B: Local Build and Deploy

```bash
# Set variables
export REGION=us-central1
export PROJECT_ID=$(gcloud config get-value project)
export IMAGE_NAME=$REGION-docker.pkg.dev/$PROJECT_ID/boxed-sneakers-repo/boxed-sneakers

# Build container
docker build -t $IMAGE_NAME:latest .

# Push to Artifact Registry
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy boxed-sneakers \
    --image=$IMAGE_NAME:latest \
    --region=$REGION \
    --platform=managed \
    --port=8080 \
    --memory=256Mi \
    --cpu=1 \
    --concurrency=1000 \
    --max-instances=100 \
    --min-instances=0 \
    --timeout=300 \
    --ingress=all \
    --allow-unauthenticated \
    --service-account=boxed-sneakers-sa@$PROJECT_ID.iam.gserviceaccount.com \
    --set-env-vars=NODE_ENV=production \
    --health-check-path=/health
```

## 6.5 Custom Domain Mapping

```bash
# Map custom domain
gcloud run domain-mappings create \
    --service=boxed-sneakers \
    --domain=boxedsneakers.com \
    --region=$REGION

# Get DNS records to configure
gcloud run domain-mappings describe \
    --domain=boxedsneakers.com \
    --region=$REGION

# Configure SSL (automatic)
# Cloud Run provisions SSL certificates automatically
```

## 6.6 Configure Cloud Run Settings

```bash
# Update scaling settings
gcloud run services update boxed-sneakers \
    --region=$REGION \
    --min-instances=1 \
    --max-instances=100 \
    --concurrency=1000

# Update memory
gcloud run services update boxed-sneakers \
    --region=$REGION \
    --memory=256Mi

# Update timeout
gcloud run services update boxed-sneakers \
    --region=$REGION \
    --timeout=300
```

---

# Phase 7 — Verification

## 7.1 Post-Deployment Verification Checklist

```bash
# Get service URL
export SERVICE_URL=$(gcloud run services describe boxed-sneakers --region=us-central1 --format='value(status.url)')
echo "Service URL: $SERVICE_URL"

# 1. Application loads
curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL
# Expected: 200

# 2. Health check passes
curl $SERVICE_URL/health
# Expected: "healthy"

# 3. All pages load
for page in "/" "/admin.html" "/boxedCart.html" "/boxedAboutUs.html"; do
    echo -n "Checking $page: "
    curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL$page"
    echo ""
done
# Expected: All 200

# 4. Static assets load
curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/assets/back.jpg"
# Expected: 200

# 5. Check security headers
curl -I $SERVICE_URL | grep -E "X-Frame-Options|X-Content-Type-Options"
# Expected: Headers present
```

## 7.2 Browser Testing

After deployment, manually verify:

| Browser | Test URL | Actions |
|---------|----------|---------|
| Chrome | $SERVICE_URL | Navigate all pages, test login |
| Firefox | $SERVICE_URL | Navigate all pages, test login |
| Edge | $SERVICE_URL | Navigate all pages, test login |
| Safari (iOS) | $SERVICE_URL | Test mobile responsiveness |
| Chrome (Android) | $SERVICE_URL | Test mobile responsiveness |

## 7.3 Cloud Run Logs

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=boxed-sneakers" --limit=50

# Stream logs
gcloud alpha logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=boxed-sneakers"

# View in Cloud Console
echo "https://console.cloud.google.com/run/detail/us-central1/boxed-sneakers/logs"
```

## 7.4 Performance Testing

```bash
# Test latency
curl -w "@curl-format.txt" -o /dev/null -s $SERVICE_URL

# Load test (using Apache Bench)
ab -n 1000 -c 100 $SERVICE_URL/
```

---

# Phase 8 — Cost Analysis

## 8.1 Cloud Run Pricing

| Metric | Free Tier | Paid Tier |
|--------|-----------|-----------|
| **Requests** | 2 million/month | $0.40/million |
| **CPU** | 180,000 vCPU-seconds/month | $0.00002400/vCPU-second |
| **Memory** | 360,000 GiB-seconds/month | $0.00000250/GiB-second |
| **Egress** | 1 GB/month | $0.12-0.23/GB |

## 8.2 Cost Estimates

### Cloud Run Costs

| Users/Day | Requests/Month | CPU Time | Memory Time | **Total Cost** |
|-----------|----------------|----------|-------------|----------------|
| **100** | 3,000 | Within free tier | Within free tier | **$0/month** |
| **500** | 15,000 | Within free tier | Within free tier | **$0/month** |
| **1,000** | 30,000 | Within free tier | Within free tier | **$0/month** |
| **10,000** | 300,000 | ~$1.44 | ~$0.18 | **~$2-5/month** |
| **100,000** | 3,000,000 | ~$25 | ~$3 | **~$30-50/month** |

*Note: Costs assume efficient caching and 256Mi memory allocation*

## 8.3 Comparison with Alternatives

| Platform | 100 users/day | 1,000 users/day | 10,000 users/day |
|----------|---------------|-----------------|------------------|
| **Cloud Run** | $0 | $0 | $2-5 |
| **Firebase Hosting** | $0 | $0 | $0-5 |
| **Cloud Storage + CDN** | $0.50 | $1-2 | $5-15 |
| **Cloudflare Pages** | $0 | $0 | $0 |
| **Vercel** | $0 | $0 | $20+ |
| **Netlify** | $0 | $0 | $19+ |

### Cost Breakdown Analysis

**At low traffic (0-10,000 users/day):**
- Cloud Run: Free tier covers everything
- Firebase Hosting: Free tier covers everything
- Winner: Tie (both free)

**At high traffic (100,000+ users/day):**
- Cloud Run: ~$30-50/month
- Firebase Hosting: ~$10-20/month
- Cloud Storage + CDN: ~$50-100/month
- Winner: Firebase Hosting

---

# Phase 9 — Optimization

## 9.1 Container Size Optimization

Current estimated size: ~25MB (Alpine + Nginx + static files)

Optimizations applied:
- ✅ Multi-stage build
- ✅ Alpine Linux base
- ✅ Only production files in final image
- ✅ Non-root user

## 9.2 Cold Start Optimization

| Strategy | Implementation | Impact |
|----------|----------------|--------|
| **Min instances** | Set `--min-instances=1` | Eliminates cold start, but costs more |
| **CPU allocation** | Use CPU throttling | Default is fine |
| **Image size** | Already optimized | Smaller = faster pull |

**Recommendation:** Keep `--min-instances=0` for cost savings, accept cold start latency.

## 9.3 Caching Strategy

Already configured in nginx-cloud-run.conf:
- ✅ Images: 1 year cache
- ✅ CSS/JS: 1 week cache
- ✅ HTML: No cache (dynamic)

## 9.4 Compression

Already enabled in nginx:
- ✅ Gzip compression for text assets
- ✅ Brotli pre-compressed files (if optimization script run)

## 9.5 Security Headers

Already configured:
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

## 9.6 Monitoring

```bash
# Set up Cloud Monitoring
gcloud monitoring dashboards create --config-json=dashboard.json

# Set up alerts
gcloud alpha monitoring policies create --policy=policy.json
```

---

# Summary

## Deliverables Created

1. **Dockerfile** - Multi-stage, optimized for Cloud Run
2. **nginx-cloud-run.conf** - Nginx configuration for port 8080
3. **cloudbuild.yaml** - CI/CD pipeline for Cloud Build
4. **.dockerignore** - Excludes unnecessary files
5. **.gcloudignore** - Excludes files from gcloud uploads
6. **main.tf** - Terraform infrastructure as code (optional)

## Next Steps

1. Review `CLOUD_RUN_ANALYSIS.md` for architecture recommendations
2. Choose deployment method (Firebase Hosting vs Cloud Run)
3. Run deployment commands in Phase 6
4. Verify deployment using Phase 7 checklist
5. Monitor costs using Phase 8 estimates

## ⚠️ Final Warning

**Cloud Run adds unnecessary complexity and cost for this static website.**

**Strongly recommend Firebase Hosting instead.**

See `FIREBASE_HOSTING_DEPLOYMENT.md` for the optimal deployment guide.

