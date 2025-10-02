# GraphZen Deployment Guide

## Domain Architecture

GraphZen uses a multi-domain architecture:

- **Main Domain**: `graph-zen.app` - Landing page
- **App Subdomain**: `charts.graph-zen.app` - Chart maker application

## DNS Configuration

### Required DNS Records

Configure the following DNS records in your domain registrar (e.g., Cloudflare, Route 53, etc.):

#### 1. Main Domain (graph-zen.app)

```
Type: A
Name: @
Value: <Your-Hosting-IP-Address>
TTL: Auto or 3600
```

Or if using a CDN/hosting platform:

```
Type: CNAME
Name: @
Value: <Your-Hosting-Platform-URL>
TTL: Auto or 3600
```

#### 2. Charts Subdomain (charts.graph-zen.app)

```
Type: CNAME
Name: charts
Value: graph-zen.app
TTL: Auto or 3600
```

Or point directly to hosting:

```
Type: A
Name: charts
Value: <Your-Hosting-IP-Address>
TTL: Auto or 3600
```

### Platform-Specific Setup

#### Vercel Deployment

1. **Add Domains in Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add `graph-zen.app`
   - Add `charts.graph-zen.app`

2. **DNS Configuration**:
   Vercel will provide specific CNAME/A records. Typically:
   ```
   graph-zen.app → CNAME → cname.vercel-dns.com
   charts.graph-zen.app → CNAME → cname.vercel-dns.com
   ```

3. **SSL Certificates**:
   - Vercel automatically provisions SSL certificates for both domains
   - Wait 24-48 hours for DNS propagation

#### Netlify Deployment

1. **Add Domains in Netlify Dashboard**:
   - Go to Site Settings → Domain Management
   - Add `graph-zen.app` as primary domain
   - Add `charts.graph-zen.app` as domain alias

2. **DNS Configuration**:
   ```
   graph-zen.app → A → 75.2.60.5
   charts.graph-zen.app → CNAME → <your-site>.netlify.app
   ```

#### Custom Server/VPS

1. **Configure Web Server** (Nginx example):

```nginx
# Main domain - Landing page
server {
    listen 80;
    listen [::]:80;
    server_name graph-zen.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Charts subdomain - App
server {
    listen 80;
    listen [::]:80;
    server_name charts.graph-zen.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **SSL with Let's Encrypt**:
```bash
sudo certbot --nginx -d graph-zen.app -d charts.graph-zen.app
```

## Application Configuration

### Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://charts.graph-zen.app
NEXT_PUBLIC_LANDING_URL=https://graph-zen.app
```

### Build Configuration

The application uses Next.js middleware for routing:

- **Middleware** (`middleware.ts`): Routes requests based on hostname
  - `graph-zen.app` → `/landing` routes
  - `charts.graph-zen.app` → `/app` routes

- **Utility Functions** (`lib/utils.ts`):
  - `getAppUrl()`: Returns correct app URL based on environment
  - `getLandingUrl()`: Returns correct landing URL based on environment

### Local Development

For local development, both routes are accessible:

- Landing page: `http://localhost:8080/landing`
- Chart maker: `http://localhost:8080/app`

The middleware automatically detects localhost and serves both routes.

## Deployment Checklist

- [ ] Configure DNS records for `graph-zen.app`
- [ ] Configure DNS records for `charts.graph-zen.app`
- [ ] Add both domains to hosting platform
- [ ] Wait for SSL certificate provisioning
- [ ] Test landing page at `https://graph-zen.app`
- [ ] Test app at `https://charts.graph-zen.app`
- [ ] Verify cross-domain navigation works correctly
- [ ] Check that embed functionality works (if applicable)
- [ ] Monitor DNS propagation (use https://dnschecker.org)

## Troubleshooting

### DNS Not Propagating
- DNS changes can take 24-48 hours to fully propagate
- Use `dig` or `nslookup` to verify DNS records
- Clear browser cache and DNS cache

### SSL Certificate Issues
- Ensure CAA records allow certificate issuance
- Check hosting platform SSL status
- Verify both domains are added to hosting configuration

### Routing Issues
- Check middleware logic in `middleware.ts`
- Verify hostname detection in browser DevTools (Network tab)
- Check server logs for routing errors

### CORS/Embed Issues
- Verify middleware headers for embed mode
- Check `next.config.mjs` header configuration
- Test embed URLs with `?embed=true` parameter

## Monitoring

After deployment, monitor:
- DNS propagation status
- SSL certificate expiration
- Application error logs
- Performance metrics for both domains
