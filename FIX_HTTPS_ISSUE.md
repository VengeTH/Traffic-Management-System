# 🔒 Fix HTTPS/Mixed Content Issue

## Problem
- Frontend is on HTTPS (GitHub Pages: `https://vengeth.github.io`)
- Backend is on HTTP (`http://112.207.191.27:5000`)
- Browsers block HTTP requests from HTTPS pages (Mixed Content error)

## Solution: Use HTTPS for Backend API

You have 3 options:

### Option 1: Use Cloudflare Tunnel (Recommended - You have cloudflared)

Since you have `cloudflared` running, expose your backend through it:

```bash
# Check your Cloudflare Tunnel config
cat ~/.cloudflared/config.yml

# Or check running tunnels
ps aux | grep cloudflared
```

If you have a Cloudflare Tunnel, add a public hostname:

```yaml
tunnel: your-tunnel-id
credentials-file: /home/venge/.cloudflared/your-tunnel-id.json

ingress:
  - hostname: api.yourdomain.com  # Your API subdomain
    service: http://localhost:5000
  - service: http_status:404
```

Then use `https://api.yourdomain.com` in your frontend.

### Option 2: Set Up SSL Certificate with Let's Encrypt

If you have a domain name pointing to your server:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate for your domain
sudo certbot --nginx -d api.yourdomain.com

# Or if using IP, you'll need a different approach
```

### Option 3: Use Nginx with Self-Signed Certificate (Temporary)

For testing, you can use a self-signed certificate:

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt \
  -subj "/CN=112.207.191.27"

# Update Nginx config to use HTTPS
sudo nano /etc/nginx/sites-available/traffic-api
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl;
    server_name 112.207.191.27;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 112.207.191.27;
    return 301 https://$server_name$request_uri;
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Note**: Self-signed certificates will show a browser warning, but will work for testing.

## Quick Fix: Check Cloudflare Tunnel First

Since you have cloudflared, this is the easiest:

```bash
# Check if you have a domain/subdomain you can use
cat ~/.cloudflared/config.yml

# If you have a Cloudflare account, you can:
# 1. Create a subdomain (e.g., api.yourdomain.com)
# 2. Point it to your Cloudflare Tunnel
# 3. Get free HTTPS automatically
```

## After Setting Up HTTPS

Rebuild your frontend with the HTTPS URL:

```powershell
cd frontend
$env:REACT_APP_API_URL="https://your-api-domain.com"
# or if using self-signed: https://112.207.191.27
npm run build
npm run deploy
```

## Test HTTPS

Once HTTPS is set up:

```powershell
# Test from Windows (ignore certificate warning for self-signed)
curl -k https://your-api-domain.com/health
```

