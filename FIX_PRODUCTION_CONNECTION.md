# 🔧 Fix Production Connection Timeout

## Problem
Frontend is trying to connect to `https://112.207.191.27/api/v1/auth/login` but getting `ERR_CONNECTION_TIMED_OUT`.

## Possible Causes

1. **Backend server not running**
2. **NGINX not proxying correctly**
3. **Firewall blocking port 443**
4. **Backend only listening on localhost**

## Step 1: Check Backend is Running

**SSH to your Ubuntu server:**

```bash
cd ~/Traffic-Management-System
ps aux | grep node
```

**Should see `node server.js` running. If not:**

```bash
cd ~/Traffic-Management-System
node server.js
```

## Step 2: Check NGINX Configuration

**Verify NGINX is proxying correctly:**

```bash
sudo cat /etc/nginx/sites-available/traffic-api
```

**Look for this in the `/api/` location block:**

```nginx
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
}
```

## Step 3: Test Backend Locally on Server

**On your Ubuntu server, test if backend responds:**

```bash
curl http://localhost:5000/health
```

**Should return JSON. If not, backend isn't running.**

## Step 4: Test NGINX Proxy

**On your Ubuntu server:**

```bash
curl -k https://localhost/api/v1/health
```

**Should return JSON. If not, NGINX isn't proxying correctly.**

## Step 5: Check Firewall

**Verify port 443 is open:**

```bash
sudo ufw status
```

**Should show:**
```
443/tcp                    ALLOW       Anywhere
```

**If not, open it:**

```bash
sudo ufw allow 443/tcp
sudo ufw reload
```

## Step 6: Test from External Network

**From your Windows machine, test if server is accessible:**

```powershell
# Test HTTPS
try {
    $response = Invoke-WebRequest -Uri "https://112.207.191.27/health" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "HTTPS WORKS - Status: $($response.StatusCode)"
} catch {
    Write-Host "HTTPS FAILED: $($_.Exception.Message)"
}
```

## Step 7: Check NGINX is Running

```bash
sudo systemctl status nginx
```

**Should be "active (running)". If not:**

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 8: Check NGINX Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

**Try to login from production, then check logs for errors.**

## Most Likely Issue

The backend server (`node server.js`) is probably not running on your Ubuntu server. 

**Start it:**

```bash
cd ~/Traffic-Management-System
node server.js
```

**Or use PM2 to keep it running:**

```bash
npm install -g pm2
cd ~/Traffic-Management-System
pm2 start server.js
pm2 save
pm2 startup
```

## Quick Checklist

- [ ] Backend server is running (`ps aux | grep node`)
- [ ] NGINX is running (`sudo systemctl status nginx`)
- [ ] Port 443 is open (`sudo ufw status`)
- [ ] NGINX config has correct proxy_pass
- [ ] Can access `https://localhost/api/v1/health` on server
- [ ] Can access `https://112.207.191.27/health` from external network

