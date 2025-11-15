# 🌐 Setting Up Nginx Reverse Proxy for Backend API

## Why Nginx?
- Your server can't reach itself via public IP (NAT/routing issue)
- Nginx is already running and accessible
- Standard ports (80/443) are more reliable than custom ports
- Better for production deployment

## Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 112.207.191.27;

    # * API endpoints
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # * CORS headers (if needed)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # * Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## Step 2: Enable the Site

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/traffic-api /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 3: Test the Setup

### From Windows:
```powershell
# Test health endpoint
curl http://112.207.191.27/health

# Test API endpoint
curl http://112.207.191.27/api/v1/health
```

### From Server:
```bash
# Test via Nginx
curl http://localhost/health
curl http://localhost/api/v1/health
```

## Step 4: Update Frontend Build

Once Nginx is working, rebuild your frontend:

```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"
$env:REACT_APP_API_URL="http://112.207.191.27"
npm run build
npm run deploy
```

**Note**: No port number needed since Nginx is on port 80 (default HTTP port)

## Step 5: Update Backend CORS

Make sure your backend `.env` allows the frontend domain:

```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
```

## Troubleshooting

### If Nginx test fails:
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### If still not accessible:
1. Check Nginx is listening on port 80:
   ```bash
   sudo ss -tulpn | grep :80
   ```

2. Check firewall allows port 80:
   ```bash
   sudo ufw status | grep 80
   ```

3. Test Nginx directly:
   ```bash
   curl http://localhost/
   ```

## Alternative: Use Existing Nginx Site

If you already have an Nginx site configured, you can add the API location to it:

```bash
# Find your existing Nginx config
ls /etc/nginx/sites-enabled/

# Edit the existing config
sudo nano /etc/nginx/sites-available/your-existing-site

# Add the /api/ location block (see above)
# Then reload: sudo systemctl reload nginx
```

