# ✅ Final Nginx Configuration

## Current Status
- ✅ Nginx working locally (`curl http://localhost/health` works)
- ❌ Not accessible from Windows (network/firewall issue)

## Step 1: Verify Nginx Config Exists

```bash
# Check if config file exists
ls -la /etc/nginx/sites-available/traffic-api

# Check if it's enabled
ls -la /etc/nginx/sites-enabled/ | grep traffic-api

# View current config
cat /etc/nginx/sites-available/traffic-api
```

## Step 2: Create/Update Nginx Config

If the file doesn't exist or needs updating:

```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

Use this configuration:

```nginx
server {
    listen 80;
    server_name 112.207.191.27 _;

    # * Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # * API endpoints - proxy to backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # * CORS headers for API
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            add_header Access-Control-Max-Age 3600;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}
```

## Step 3: Enable and Test

```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/traffic-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

## Step 4: Test from Server

```bash
# Test health
curl http://localhost/health

# Test API
curl http://localhost/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'
```

## Step 5: Check Network Access

Since it's not accessible from Windows, check:

```bash
# Check if port 80 is listening
sudo ss -tulpn | grep :80

# Check firewall for port 80
sudo ufw status | grep 80

# Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log

# Check Nginx access logs (while testing from Windows)
sudo tail -f /var/log/nginx/access.log
```

## Step 6: Test from Windows

Once Nginx is configured:

```powershell
# Test health endpoint
curl http://112.207.191.27/health

# Test API endpoint (should return error, but connection should work)
curl http://112.207.191.27/api/v1/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}'
```

## If Still Not Accessible from Windows

The issue might be:
1. **ISP blocking incoming connections** - Common with residential connections
2. **Router not forwarding** - Need to configure port forwarding
3. **Cloudflare Tunnel interference** - Check cloudflared config

### Solution: Use Cloudflare Tunnel

Since you have `cloudflared` running, you can use it:

```bash
# Check cloudflared config
cat ~/.cloudflared/config.yml

# Or check running tunnel
ps aux | grep cloudflared
```

You can expose port 5000 through Cloudflare Tunnel and get a public HTTPS URL.

## Alternative: Check Existing Nginx Sites

You might already have an Nginx site configured. Check:

```bash
# List all enabled sites
ls -la /etc/nginx/sites-enabled/

# Check default site
cat /etc/nginx/sites-enabled/default

# You can add the API location to an existing site instead
```

