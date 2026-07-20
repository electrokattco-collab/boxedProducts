# BoxedSneakers - Cloud Run Deployment Summary

## ⚠️ Architect's Warning

**Cloud Run is NOT the optimal deployment target for this static website.**

**Recommended:** Firebase Hosting (simpler, cheaper, faster)

**This guide is provided for cases where Cloud Run is specifically required.**

---

## Quick Start

### One-Command Deployment

```bash
./deploy-cloud-run.sh
```

### Manual Deployment

```bash
# 1. Set your project
export PROJECT_ID=your-project-id

# 2. Run deployment
./deploy-cloud-run.sh
```

---

## Files Created

| File | Purpose |
|------|---------|
| `Dockerfile.cloudrun` | Multi-stage container build |
| `nginx-cloud-run.conf` | Nginx config for port 8080 |
| `cloudbuild.yaml` | CI/CD pipeline |
| `.dockerignore` | Excludes files from Docker build |
| `.gcloudignore` | Excludes files from gcloud |
| `deploy-cloud-run.sh` | Automated deployment script |
| `CLOUD_RUN_ANALYSIS.md` | Detailed architecture analysis |
| `CLOUD_RUN_DEPLOYMENT.md` | Complete deployment guide |
| `COST_ANALYSIS.md` | Cost comparison across platforms |

---

## Architecture

```
User Request
     ↓
Cloud Run Load Balancer
     ↓
Cloud Run Container (Nginx)
     ↓
Static Files (dist/)
     ↓
Firebase SDK (CDN) → Firebase Services
```

---

## Configuration

### Cloud Run Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Port** | 8080 | Cloud Run requirement |
| **Memory** | 256 MiB | Sufficient for static files |
| **CPU** | 1 | Default, sufficient |
| **Min Instances** | 0 | Cost savings |
| **Max Instances** | 100 | Scale limit |
| **Concurrency** | 1000 | High throughput |
| **Timeout** | 300s | Generous for static |

### Nginx Configuration

- ✅ Serves static files on port 8080
- ✅ Gzip compression enabled
- ✅ Security headers configured
- ✅ Caching rules for assets
- ✅ Health check endpoint at `/health`

---

## Costs

| Traffic | Cloud Run Cost | Firebase Hosting Cost |
|---------|----------------|----------------------|
| 1,000 users/day | $0 | $0 |
| 10,000 users/day | ~$5/month | $0-5/month |
| 100,000 users/day | ~$60/month | ~$20/month |

**Firebase Hosting is 3x cheaper at scale.**

---

## Post-Deployment

### Required Actions

1. **Add domain to Firebase Auth:**
   ```
   https://console.firebase.google.com → Authentication → Settings → Authorized domains
   ```

2. **Verify deployment:**
   ```bash
   curl https://your-service-url/health
   # Expected: "healthy"
   ```

3. **Run health check:**
   ```bash
   node monitoring/health-check.js https://your-service-url
   ```

---

## Rollback

```bash
# List previous revisions
gcloud run revisions list --service=boxed-sneakers --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic boxed-sneakers \
    --to-revisions=PREVIOUS_REVISION=100 \
    --region=us-central1
```

---

## Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Stream logs
gcloud alpha logging tail "resource.type=cloud_run_revision"
```

---

## Recommendation

**Use Firebase Hosting instead.**

See `FIREBASE_HOSTING_DEPLOYMENT.md` for the optimal solution.

