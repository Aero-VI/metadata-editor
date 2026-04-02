# Deployment Instructions

## GitHub Repository
✅ **Created:** https://github.com/Aero-VI/metadata-editor

## GitHub Pages
✅ **Enabled:** Building at https://aero-vi.github.io/metadata-editor/
- **Status:** Building (may take 2-5 minutes)
- **Branch:** main
- **Path:** / (root)

## Cloudflare DNS Setup

To set up `metadata.aeroverra.com`:

### Option 1: Via Cloudflare Dashboard (Recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select the `aeroverra.com` zone
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Configure:
   - **Type:** CNAME
   - **Name:** metadata
   - **Target:** aero-vi.github.io
   - **Proxy status:** ✅ Proxied (orange cloud)
   - **TTL:** Auto
6. Click **Save**

### Option 2: Via Cloudflare API

```bash
# Set your Cloudflare credentials
CLOUDFLARE_API_TOKEN="your_api_token_here"
CLOUDFLARE_ZONE_ID="your_zone_id_here"  # Get from Cloudflare dashboard

# Create CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "metadata",
    "content": "aero-vi.github.io",
    "ttl": 1,
    "proxied": true
  }'
```

## GitHub Pages Custom Domain Setup

After DNS is configured:

1. Go to https://github.com/Aero-VI/metadata-editor/settings/pages
2. Under "Custom domain", enter: `metadata.aeroverra.com`
3. Click **Save**
4. Wait for DNS check to pass (may take a few minutes)
5. ✅ Enable "Enforce HTTPS" once DNS is verified

## Verification

Once deployed, test:
- https://metadata.aeroverra.com (custom domain)
- https://aero-vi.github.io/metadata-editor/ (GitHub Pages URL)

Both should load the same site.

## Post-Deployment

The site is fully client-side and requires no server maintenance. All image processing happens in the browser using piexifjs.

Privacy guarantee: No images are uploaded to any server. Everything runs locally in the user's browser.
