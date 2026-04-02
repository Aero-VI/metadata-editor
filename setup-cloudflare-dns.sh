#!/bin/bash

# Cloudflare DNS Setup Script for metadata.aeroverra.com
# This script creates a CNAME record pointing to GitHub Pages

set -e

echo "🔧 Cloudflare DNS Setup for metadata.aeroverra.com"
echo "=================================================="
echo ""

# Check for required tools
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is required but not installed"
    exit 1
fi

# Get credentials
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "📝 Enter your Cloudflare API Token:"
    echo "   (Get it from: https://dash.cloudflare.com/profile/api-tokens)"
    read -s CLOUDFLARE_API_TOKEN
    echo ""
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "📝 Enter your Cloudflare Zone ID for aeroverra.com:"
    echo "   (Find it in the Overview tab of your domain in Cloudflare Dashboard)"
    read CLOUDFLARE_ZONE_ID
    echo ""
fi

echo "🔍 Checking if DNS record already exists..."

# Check existing records
EXISTING=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=CNAME&name=metadata.aeroverra.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

RECORD_COUNT=$(echo "$EXISTING" | python3 -c "import sys, json; print(json.load(sys.stdin)['result_info']['count'])" 2>/dev/null || echo "0")

if [ "$RECORD_COUNT" -gt 0 ]; then
    echo "⚠️  DNS record already exists!"
    echo "$EXISTING" | python3 -m json.tool
    echo ""
    echo "Do you want to delete and recreate it? (y/N)"
    read -r RESPONSE
    if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
        RECORD_ID=$(echo "$EXISTING" | python3 -c "import sys, json; print(json.load(sys.stdin)['result'][0]['id'])")
        echo "🗑️  Deleting existing record..."
        curl -s -X DELETE \
          "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
          -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    else
        echo "✅ Keeping existing record. Exiting."
        exit 0
    fi
fi

echo "🚀 Creating CNAME record for metadata.aeroverra.com -> aero-vi.github.io..."

RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "metadata",
    "content": "aero-vi.github.io",
    "ttl": 1,
    "proxied": true,
    "comment": "GitHub Pages for metadata editor"
  }')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "False")

if [ "$SUCCESS" = "True" ]; then
    echo ""
    echo "✅ DNS record created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Wait 1-5 minutes for DNS propagation"
    echo "2. Go to: https://github.com/Aero-VI/metadata-editor/settings/pages"
    echo "3. Enter custom domain: metadata.aeroverra.com"
    echo "4. Wait for DNS verification (green checkmark)"
    echo "5. Enable 'Enforce HTTPS'"
    echo ""
    echo "Test with: curl -I https://metadata.aeroverra.com"
    echo ""
else
    echo ""
    echo "❌ Failed to create DNS record!"
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool
    exit 1
fi
