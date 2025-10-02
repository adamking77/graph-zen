# Subdomain Migration Summary

## Changes Made

### 1. Directory Restructure
- Moved chart maker app from `/app/page.tsx` to `/app/app/page.tsx`
- Landing page remains at `/app/landing/page.tsx`
- Charts showcase utility remains at `/app/charts-showcase/page.tsx`

### 2. Middleware Routing (`middleware.ts`)
Added hostname-based routing logic:
- `graph-zen.app` → Serves `/landing` routes
- `charts.graph-zen.app` → Serves `/app` routes
- Localhost → Serves both routes with path-based routing
- Preserves existing embed mode functionality

### 3. Navigation Updates
Updated all navigation links in landing page components:
- `components/landing/hero.tsx`
- `components/landing/interactive-demo.tsx`
- `components/landing/call-to-action.tsx`

### 4. Utility Functions (`lib/utils.ts`)
Added helper functions for cross-domain navigation:
- `getAppUrl()`: Returns correct chart maker URL based on environment
- `getLandingUrl()`: Returns correct landing page URL based on environment

### 5. Documentation
Created comprehensive deployment guide: `DEPLOYMENT.md`

## How It Works

### Production
- User visits `graph-zen.app` → Middleware rewrites to `/landing` → Shows landing page
- User clicks "Start Creating" → Redirects to `charts.graph-zen.app` → Shows chart maker
- URLs stay clean: No `/landing` or `/app` visible in browser

### Development
- `http://localhost:8080/landing` → Landing page
- `http://localhost:8080/app` → Chart maker
- Middleware detects localhost and allows direct path access

## Testing Locally

1. Start the dev server:
   ```bash
   npm run dev:8080
   ```

2. Test routes:
   - Landing: http://localhost:8080/landing
   - App: http://localhost:8080/app

3. Test navigation:
   - Click "Start Creating" on landing page
   - Should navigate to `/app` route

## Deployment Steps

1. **DNS Configuration**:
   - Add A/CNAME record for `graph-zen.app`
   - Add CNAME record for `charts.graph-zen.app`

2. **Hosting Platform**:
   - Add both domains to your hosting platform (Vercel/Netlify/etc.)
   - Platform will auto-provision SSL certificates

3. **Deploy**:
   ```bash
   npm run build
   npm run start
   ```

4. **Verify**:
   - Visit `https://graph-zen.app` → Should show landing page
   - Visit `https://charts.graph-zen.app` → Should show chart maker
   - Test navigation between domains

## Benefits

✅ **SEO**: Separate domains for marketing vs. app
✅ **Performance**: Can independently optimize/cache each domain
✅ **Flexibility**: Easy to split into separate apps later if needed
✅ **Clean URLs**: No `/landing` or `/app` in production URLs
✅ **Single Codebase**: No code duplication, shared components
✅ **Easy Deployment**: One build, one deployment

## Rollback Plan

If issues occur, simply:
1. Remove middleware routing logic
2. Revert to original routing
3. Point both domains to same content

The changes are isolated to:
- `middleware.ts` (routing)
- `lib/utils.ts` (helper functions)
- Landing page components (links)
- Directory structure (`/app/app/` location)
