# Staging Environment Setup for Boxed Sneakers

## Overview
Staging environment allows testing deployments before production.

## Coolify Configuration

### Step 1: Create Staging Environment in Coolify

1. Go to Coolify Dashboard → Projects → Boxed Sneakers
2. Click **"+ New Environment"**
3. Name it `staging`

### Step 2: Create Staging Application

1. Click **"+ Add Resource"**
2. Select **Application**
3. Use same Git repository
4. Set **Branch** to `main` (or `staging` if you have a staging branch)

### Step 3: Staging Build Settings

| Setting | Staging Value |
|---------|---------------|
| **Build Pack** | `Static` |
| **Install Command** | `npm ci --omit=dev` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Domain** | `staging.boxedsneakers.com` |

### Step 4: Environment Variables

```
NODE_ENV=staging
# Firebase uses same config (hardcoded)
# Or use staging Firebase project if available
```

---

## Git Branch Strategy

```
main        → Staging deployments
production  → Production deployments
```

### Workflow

1. **Develop** on feature branches
2. **Merge** to `main` → Auto-deploys to Staging
3. **Test** on staging environment
4. **Merge** `main` → `production` → Auto-deploys to Production

---

## DNS Configuration

Add DNS record for staging:

```
Type: A
Name: staging
Value: <YOUR_COOLIFY_SERVER_IP>
```

Or use Coolify's subdomain:
```
Type: CNAME
Name: staging
Value: dome.webmiro.co.za
```

---

## Staging vs Production

| Aspect | Staging | Production |
|--------|---------|------------|
| **URL** | staging.boxedsneakers.com | boxedsneakers.com |
| **Branch** | main | production |
| **Firebase** | Same project | Same project |
| **Auto-deploy** | Yes | Yes (after testing) |
| **SSL** | Yes | Yes |

---

## Testing Checklist (Before Production)

- [ ] Homepage loads correctly
- [ ] All product images display
- [ ] Firebase Auth works (login/logout)
- [ ] Cart functionality works
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Page navigation works
- [ ] Search functionality works

Run automated health check:
```bash
node monitoring/health-check.js https://staging.boxedsneakers.com
```
