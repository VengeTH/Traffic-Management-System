# 🔒 Set Up HTTPS for Backend API

## Problem
- Frontend: HTTPS (`https://vengeth.github.io`)
- Backend: HTTP (`http://112.207.191.27`)
- Browsers block HTTP from HTTPS pages

## Solution: Add HTTPS to Nginx

### Step 1: Generate Self-Signed Certificate

```bash
# Create SSL directory if it doesn't exist
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

### Step 2: Update Nginx Config for HTTPS

```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

Replace with this configuration:

```nginx
# * HTTPS server
server {
    listen 443 ssl http2;
    server_name 112.207.191.27;

    # * SSL configuration
    ssl_certificate /etc/ssl/certs/traffic-api-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/traffic-api-selfsigned.key;
    
    # * SSL settings
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # * CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        # * Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
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

### Step 3: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### Step 4: Allow HTTPS Port in Firewall

```bash
# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Verify
sudo ufw status | grep 443
```

### Step 5: Test HTTPS

From Windows (ignore certificate warning):

```powershell
# Test with -k flag to ignore self-signed certificate warning
curl -k https://112.207.191.27/health

# Test API endpoint
curl -k https://112.207.191.27/api/v1/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}'
```

### Step 6: Build Frontend with HTTPS URL

```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build
npm run deploy
```

## Important Notes

⚠️ **Self-Signed Certificate Warning**: 
- Browsers will show a security warning
- Users need to click "Advanced" → "Proceed anyway"
- For production, use Let's Encrypt with a domain name

✅ **This will work** for your use case since:
- The frontend can make HTTPS requests
- Mixed Content error will be resolved
- API will be accessible

## For Production (Later)

When you have a domain name:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get Let's Encrypt certificate
sudo certbot --nginx -d api.yourdomain.com

# This will automatically configure Nginx with real SSL
```

