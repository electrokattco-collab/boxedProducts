# BoxedSneakers - Cloud Cost Analysis

**Date:** 2026-07-16  
**Analyst:** Google Cloud Solutions Architect

---

## Executive Summary

For the BoxedSneakers static website, **Firebase Hosting is the most cost-effective solution** across all traffic levels.

| Traffic Level | Firebase Hosting | Cloud Run | Cloud Storage + CDN | Recommendation |
|---------------|------------------|-----------|---------------------|----------------|
| **100 users/day** | $0 | $0 | ~$0.50 | Firebase Hosting |
| **1,000 users/day** | $0 | $0 | ~$1-2 | Firebase Hosting |
| **10,000 users/day** | $0-5 | $2-5 | ~$5-15 | Firebase Hosting |
| **100,000 users/day** | ~$10-20 | ~$30-50 | ~$50-100 | Firebase Hosting |

---

## Detailed Cost Breakdown

### 1. Firebase Hosting (RECOMMENDED)

#### Pricing Tiers

| Resource | Free Tier | Paid Tier (Spark/Blaze) |
|----------|-----------|-------------------------|
| **Storage** | 10 GB | $0.026/GB/month |
| **Transfer** | 10 GB/month | $0.15/GB |
| **Custom Domain** | Included | Included |
| **SSL** | Included | Included |
| **CDN** | Global | Global |

#### Cost Scenarios

| Users/Day | Avg Page Size | Monthly Transfer | Storage | **Total Cost** |
|-----------|---------------|------------------|---------|----------------|
| **100** | 2 MB | ~6 GB | 13 MB | **$0/month** |
| **500** | 2 MB | ~30 GB | 13 MB | **$0/month** |
| **1,000** | 2 MB | ~60 GB | 13 MB | **$0/month** |
| **10,000** | 2 MB | ~600 GB | 13 MB | **~$5/month** |
| **100,000** | 2 MB | ~6,000 GB | 13 MB | **~$20/month** |

**Notes:**
- Free tier: 10GB storage + 10GB/month transfer
- 1000 users/day × 2MB × 30 days = 60GB (within free tier)
- Costs scale linearly after free tier

---

### 2. Cloud Run

#### Pricing Structure

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Requests** | 2 million/month | $0.40/million |
| **CPU** | 180,000 vCPU-seconds/month | $0.00002400/vCPU-second |
| **Memory** | 360,000 GiB-seconds/month | $0.00000250/GiB-second |
| **Egress** | 1 GB/month | $0.12-0.23/GB |

#### Assumptions
- 256 MiB memory allocation
- 1 vCPU
- Average request time: 50ms (static files)
- Container always allocated during requests

#### Cost Scenarios

| Users/Day | Requests/Month | CPU Cost | Memory Cost | Request Cost | Egress | **Total** |
|-----------|----------------|----------|-------------|--------------|--------|-----------|
| **100** | 3,000 | $0 | $0 | $0 | $0 | **$0/month** |
| **500** | 15,000 | $0 | $0 | $0 | $0 | **$0/month** |
| **1,000** | 30,000 | $0 | $0 | $0 | $0 | **$0/month** |
| **10,000** | 300,000 | ~$1.44 | ~$0.18 | $0 | ~$3 | **~$5/month** |
| **100,000** | 3,000,000 | ~$25 | ~$3 | $0.40 | ~$30 | **~$60/month** |

**Notes:**
- Free tier covers up to ~180,000 vCPU-seconds
- Cold starts don't incur cost (no CPU allocated)
- Minimum instances would add base cost (~$10/month for 1 instance)

---

### 3. Cloud Storage + Cloud CDN

#### Pricing Structure

| Resource | Cost |
|----------|------|
| **Storage** | $0.026/GB/month |
| **Class A Operations** | $0.005/10,000 operations |
| **Class B Operations** | $0.0004/10,000 operations |
| **CDN Egress** | $0.08-0.20/GB |
| **CDN Cache Fill** | $0.01-0.20/GB |

#### Cost Scenarios

| Users/Day | Storage | Operations | CDN Egress | **Total Cost** |
|-----------|---------|------------|------------|----------------|
| **100** | $0.0003 | ~$0.01 | ~$0.48 | **~$0.50/month** |
| **500** | $0.0003 | ~$0.05 | ~$2.40 | **~$2.50/month** |
| **1,000** | $0.0003 | ~$0.10 | ~$4.80 | **~$5/month** |
| **10,000** | $0.0003 | ~$1.00 | ~$48 | **~$50/month** |
| **100,000** | $0.0003 | ~$10 | ~$480 | **~$500/month** |

---

### 4. Cloudflare Pages

| Resource | Cost |
|----------|------|
| **Builds** | 500/month free |
| **Bandwidth** | Unlimited free |
| **Requests** | Unlimited free |
| **Custom Domain** | Free |
| **SSL** | Free |

#### Cost Scenarios

| Users/Day | **Total Cost** |
|-----------|----------------|
| **100** | **$0/month** |
| **500** | **$0/month** |
| **1,000** | **$0/month** |
| **10,000** | **$0/month** |
| **100,000** | **$0/month** |
| **1,000,000** | **$0/month** |

**Notes:**
- Cloudflare Pages is free for unlimited traffic
- Best performance (300+ edge locations)
- Requires Cloudflare DNS

---

## Cross-Platform Comparison

### At 1,000 Users/Day

| Platform | Monthly Cost | Performance | Complexity |
|----------|--------------|-------------|------------|
| **Firebase Hosting** | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cloud Run** | $0 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cloud Storage + CDN** | ~$5 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cloudflare Pages** | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Vercel** | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Netlify** | $0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### At 100,000 Users/Day

| Platform | Monthly Cost | Performance | Complexity |
|----------|--------------|-------------|------------|
| **Firebase Hosting** | ~$20 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cloud Run** | ~$60 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cloud Storage + CDN** | ~$500 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cloudflare Pages** | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Vercel** | $20+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Netlify** | $19+ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Cost Optimization Strategies

### For Cloud Run (if you must use it)

1. **Set `--min-instances=0`**
   - Saves money during low traffic
   - Trade-off: Cold start latency

2. **Reduce memory to 128 MiB**
   - Static files don't need much memory
   - Saves 50% on memory costs

3. **Enable Cloud CDN**
   - Cache static assets at edge
   - Reduces origin requests

4. **Use Brotli/Gzip compression**
   - Reduces transfer size by 60-80%
   - Already configured in our Dockerfile

### For Firebase Hosting

1. **Enable caching headers**
   - Already configured
   - Reduces transfer costs

2. **Optimize images**
   - Use WebP format where possible
   - Reduces bandwidth by 30-50%

3. **Use Firebase Hosting preview channels**
   - Test before deploying to production
   - Avoid unnecessary redeploys

---

## When to Choose Each Platform

### Choose Firebase Hosting When:
- ✅ Already using Firebase (Auth, Firestore, Storage)
- ✅ Want simplest deployment (`firebase deploy`)
- ✅ Want lowest cost (free for most use cases)
- ✅ Want automatic SSL and CDN
- ✅ Want tight integration with Firebase services

### Choose Cloud Run When:
- ✅ Need server-side rendering (Next.js, Nuxt, etc.)
- ✅ Need custom server logic
- ✅ Need WebSocket support
- ✅ Corporate policy requires containers
- ✅ Need specific compliance certifications

### Choose Cloudflare Pages When:
- ✅ Want best global performance (300+ PoPs)
- ✅ Already using Cloudflare DNS
- ✅ Want unlimited free bandwidth
- ✅ Need advanced edge caching

### Choose Cloud Storage + CDN When:
- ✅ Need maximum control over caching
- ✅ Serving very large static assets
- ✅ Integrating with other GCP services
- ✅ Need signed URLs for private content

---

## Final Recommendation

**For BoxedSneakers:**

| Traffic | Recommended Platform | Monthly Cost |
|---------|---------------------|--------------|
| 0-10,000 users/day | **Firebase Hosting** | **$0** |
| 10,000-100,000 users/day | **Firebase Hosting** | **$5-20** |
| 100,000+ users/day | **Cloudflare Pages** | **$0** |

**Primary Recommendation: Firebase Hosting**

**Why:**
1. **Zero additional cost** for typical traffic
2. **Native Firebase integration** (Auth, Firestore already configured)
3. **Simplest deployment** (single command)
4. **Same global CDN** as Cloud Run
5. **No container overhead** (faster deployments)

**Alternative: Cloudflare Pages**
- If you want unlimited free traffic
- If you already use Cloudflare
- Slightly better global performance

---

## Cost Calculator

Use these calculators to estimate your specific costs:

- **Firebase Hosting:** https://firebase.google.com/pricing
- **Cloud Run:** https://cloud.google.com/products/calculator
- **Cloudflare Pages:** https://pages.cloudflare.com/ (free)
- **Cloud Storage:** https://cloud.google.com/products/calculator

---

*Last updated: 2026-07-16*
