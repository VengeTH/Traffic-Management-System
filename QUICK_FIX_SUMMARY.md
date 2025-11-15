# ⚡ Quick Fix Summary - Login Timeout Error

## Main Problem
**Error**: `POST https://112.207.191.27/api/v1/auth/login net::ERR_CONNECTION_TIMED_OUT`

**Cause**: Frontend uses HTTPS, but backend only has HTTP configured. Port 443 (HTTPS) is not accessible.

## Solution (3 Steps)

### 1️⃣ Set Up HTTPS on Backend (Ubuntu Server)

**Run these commands on your Ubuntu server:**

```bash
# Generate SSL certificate
sudo mkdir -p /etc/ssl/private /etc/ssl/certs
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/traffic-api-selfsigned.key \
  -out /etc/ssl/certs/traffic-api-selfsigned.crt \
  -subj "/CN=112.207.191.27/O=Traffic Management System/C=PH"
sudo chmod 600 /etc/ssl/private/traffic-api-selfsigned.key
sudo chmod 644 /etc/ssl/certs/traffic-api-selfsigned.crt

# Update NGINX config
sudo nano /etc/nginx/sites-available/traffic-api
```

**Paste this NGINX configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name 112.207.191.27;
    ssl_certificate /etc/ssl/certs/traffic-api-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/traffic-api-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "https://vengeth.github.io" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
}

server {
    listen 80;
    server_name 112.207.191.27;
    return 301 https://$server_name$request_uri;
}
```

**Then:**
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow 443/tcp
```

### 2️⃣ Update Backend CORS (Ubuntu Server)

**Edit your backend `.env` file:**
```bash
nano /path/to/backend/.env
```

**Add/update:**
```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
ALLOW_GITHUB_PAGES=true
APP_URL=https://112.207.191.27
```

**Restart backend:**
```bash
pm2 restart all
# or
sudo systemctl restart your-backend-service
```

### 3️⃣ Rebuild Frontend (Windows)

**Run in PowerShell:**
```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build
npm run deploy
```

## Test

**From Windows PowerShell:**
```powershell
curl -k https://112.207.191.27/health
```

**In Browser:**
1. Clear cache (Ctrl+Shift+Delete)
2. Visit: `https://vengeth.github.io/Traffic-Management-System`
3. If certificate warning appears, click "Advanced" → "Proceed anyway"
4. Try logging in

## Minor Issue: Favicon 404

The `favicon.ico` file is missing. This is cosmetic and doesn't affect functionality.

**To fix (optional):**
- The app already uses `favicon.svg` which works fine
- Or create a simple `favicon.ico` in `frontend/public/`

## Full Documentation

See `FIX_LOGIN_TIMEOUT_ERROR.md` for detailed troubleshooting steps.

