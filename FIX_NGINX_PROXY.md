# 🔧 Fix NGINX Proxy Configuration

## Problem
NGINX is returning "Route /api/v1/health not found" when it should proxy to the backend.

## Issue Found
When you test `curl -k https://localhost/api/v1/health`, NGINX is not correctly proxying to the backend.

## Solution: Check NGINX Configuration

**On your Ubuntu server, check the NGINX config:**

```bash
sudo cat /etc/nginx/sites-available/traffic-api
```

**Look for the `/api/` location block. It should be:**

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

## Test Backend Routes

**Test if backend has the route:**

```bash
curl http://localhost:5000/api/v1/health
```

**If this works, then NGINX proxy is the issue.**

## Fix NGINX Proxy

**The issue might be that NGINX is stripping `/api/` incorrectly. Try this config:**

```nginx
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
}
```

**Note:** `proxy_pass http://localhost:5000;` (without `/api/` at the end) will preserve the full path.

## After Fixing

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Then test again:**

```bash
curl -k https://localhost/api/v1/health
```

