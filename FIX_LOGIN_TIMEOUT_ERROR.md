# 🔧 Fix Login Timeout Error (ERR_CONNECTION_TIMED_OUT)

## Problem Analysis

You're getting this error:
```
POST https://112.207.191.27/api/v1/auth/login net::ERR_CONNECTION_TIMED_OUT
```

**Root Causes:**
1. ✅ Frontend is using **HTTPS** (`https://112.207.191.27`)
2. ❌ Backend likely only has **HTTP** configured (port 80)
3. ❌ Port **443** (HTTPS) is probably not open or not configured
4. ⚠️ GitHub Pages requires HTTPS for API calls (Mixed Content Policy)

## Solution: Set Up HTTPS on Backend

### Step 1: Check Current NGINX Configuration

**On your Ubuntu server, run:**
```bash
# Check if NGINX is configured for HTTPS
sudo cat /etc/nginx/sites-available/traffic-api | grep -E "listen|ssl"

# Check if port 443 is open
sudo ss -tulpn | grep :443

# Check firewall status
sudo ufw status | grep 443
```

### Step 2: Generate SSL Certificate (Self-Signed)

**On your Ubuntu server:**
```bash
# Create SSL directories
sudo mkdir -p /etc/ssl/private /etc/ssl/certs

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/traffic-api-selfsigned.key \
  -out /etc/ssl/certs/traffic-api-selfsigned.crt \
  -subj "/CN=112.207.191.27/O=Traffic Management System/C=PH"

# Set proper permissions
sudo chmod 600 /etc/ssl/private/traffic-api-selfsigned.key
sudo chmod 644 /etc/ssl/certs/traffic-api-selfsigned.crt
```

### Step 3: Update NGINX Configuration for HTTPS

**On your Ubuntu server:**
```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

**Replace the entire file with this configuration:**
```nginx
# * HTTPS server (port 443)
server {
    listen 443 ssl http2;
    server_name 112.207.191.27;

    # * SSL certificate configuration
    ssl_certificate /etc/ssl/certs/traffic-api-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/traffic-api-selfsigned.key;
    
    # * SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # * Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # * API endpoints
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # * CORS headers (important for GitHub Pages)
        add_header Access-Control-Allow-Origin "https://vengeth.github.io" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-CSRF-Token" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # * Handle preflight OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://vengeth.github.io";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-CSRF-Token";
            add_header Access-Control-Allow-Credentials "true";
            add_header Access-Control-Max-Age 3600;
            add_header Content-Length 0;
            add_header Content-Type 'text/plain';
            return 204;
        }
    }
}

# * Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 112.207.191.27;
    return 301 https://$server_name$request_uri;
}
```

### Step 4: Test and Reload NGINX

**On your Ubuntu server:**
```bash
# Test NGINX configuration
sudo nginx -t

# If test passes, reload NGINX
sudo systemctl reload nginx

# Check NGINX status
sudo systemctl status nginx
```

### Step 5: Open Port 443 in Firewall

**On your Ubuntu server:**
```bash
# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Verify firewall rules
sudo ufw status | grep 443

# If UFW is not enabled, enable it first:
# sudo ufw enable
```

### Step 6: Update Backend CORS Configuration

**On your Ubuntu server, update your `.env` file:**
```bash
cd /path/to/your/backend
nano .env
```

**Add or update these lines:**
```env
# * Allow GitHub Pages origin
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000

# * Or use the ALLOW_GITHUB_PAGES flag
ALLOW_GITHUB_PAGES=true

# * Update app URL to HTTPS
APP_URL=https://112.207.191.27
```

**Restart your backend server:**
```bash
# If using PM2
pm2 restart all

# Or if using systemd
sudo systemctl restart your-backend-service

# Or manually
# Stop current process (Ctrl+C) and restart
node server.js
```

### Step 7: Test HTTPS from Windows

**From your Windows machine (PowerShell):**
```powershell
# Test health endpoint (ignore certificate warning with -k)
curl -k https://112.207.191.27/health

# Test API login endpoint
curl -k https://112.207.191.27/api/v1/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"your-email@example.com","password":"your-password"}'
```

**Expected Response:**
- Health endpoint should return: `{"success":true,"message":"Server is healthy",...}`
- Login endpoint should return authentication response or error message (not timeout)

### Step 8: Rebuild Frontend with HTTPS URL

**On your Windows machine:**
```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"

# Set environment variable and build
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Step 9: Test in Browser

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Visit your GitHub Pages site**: `https://vengeth.github.io/Traffic-Management-System`
4. **Try to login**
5. **If you see a certificate warning**:
   - Click "Advanced"
   - Click "Proceed to 112.207.191.27 (unsafe)"
   - This is normal for self-signed certificates

## Troubleshooting

### Issue: Still Getting Timeout

**Check 1: Verify HTTPS is working**
```bash
# On Ubuntu server
curl -k https://localhost/health
curl -k https://localhost/api/v1/health
```

**Check 2: Verify port 443 is listening**
```bash
# On Ubuntu server
sudo ss -tulpn | grep :443
# Should show nginx listening on port 443
```

**Check 3: Check NGINX error logs**
```bash
# On Ubuntu server
sudo tail -f /var/log/nginx/error.log
```

**Check 4: Verify backend is running**
```bash
# On Ubuntu server
curl http://localhost:5000/health
# Should return health check response
```

**Check 5: Check firewall from external network**
```powershell
# From Windows
Test-NetConnection -ComputerName 112.207.191.27 -Port 443
# Should show TcpTestSucceeded: True
```

### Issue: CORS Error

**Solution: Update backend `.env`**
```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
ALLOW_GITHUB_PAGES=true
```

**Then restart backend server.**

### Issue: Certificate Warning in Browser

**This is expected** with self-signed certificates. Users need to:
1. Click "Advanced"
2. Click "Proceed anyway"

**For production**, use Let's Encrypt with a domain name (see below).

## Production: Use Let's Encrypt (Recommended)

When you have a domain name pointing to your server:

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get free SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Certbot will automatically:
# - Get certificate from Let's Encrypt
# - Configure NGINX for HTTPS
# - Set up auto-renewal
```

Then rebuild frontend with your domain:
```powershell
$env:REACT_APP_API_URL="https://api.yourdomain.com"
npm run build
npm run deploy
```

## Quick Checklist

- [ ] Generated SSL certificate on server
- [ ] Updated NGINX config for HTTPS (port 443)
- [ ] Tested NGINX configuration (`sudo nginx -t`)
- [ ] Reloaded NGINX (`sudo systemctl reload nginx`)
- [ ] Opened port 443 in firewall (`sudo ufw allow 443/tcp`)
- [ ] Updated backend `.env` with CORS_ORIGIN
- [ ] Restarted backend server
- [ ] Tested HTTPS from Windows (`curl -k https://112.207.191.27/health`)
- [ ] Rebuilt frontend with HTTPS URL
- [ ] Deployed frontend to GitHub Pages
- [ ] Tested login in browser

## Summary

The error occurs because:
1. ✅ Frontend (GitHub Pages) uses HTTPS
2. ❌ Backend was only configured for HTTP
3. ❌ Browsers block HTTP requests from HTTPS pages

**Solution**: Configure NGINX to serve HTTPS on port 443, then rebuild frontend with the HTTPS URL.

