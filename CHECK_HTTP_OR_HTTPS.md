# 🔍 How to Check if Your Backend Uses HTTP or HTTPS

## Method 1: Check Your NGINX Configuration (Most Reliable)

**SSH to your Ubuntu server and run:**

```bash
sudo cat /etc/nginx/sites-available/traffic-api | grep -E "listen|ssl"
```

**If you see:**
- `listen 443 ssl` → **HTTPS** ✅
- `listen 80` only → **HTTP** ❌

## Method 2: Check Your .env File

**On your Ubuntu server:**

```bash
cd ~/Traffic-Management-System
cat .env | grep APP_URL
```

**If you see:**
- `APP_URL=https://112.207.191.27` → **HTTPS** ✅
- `APP_URL=http://112.207.191.27` → **HTTP** ❌

## Method 3: Test in Browser

**Open in browser:**
- `https://112.207.191.27/health` → If it works (even with SSL warning), it's **HTTPS** ✅
- `http://112.207.191.27/health` → If it works, it's **HTTP** ❌

## Method 4: Check NGINX Status

**On your Ubuntu server:**

```bash
sudo nginx -t
sudo systemctl status nginx
```

**Then check if port 443 is open:**

```bash
sudo ss -tulpn | grep :443
```

**If port 443 is listening → HTTPS** ✅

## Based on Your Previous Setup

From earlier, you set up HTTPS with NGINX and self-signed certificates. So you're likely using **HTTPS**.

**Use this for rebuilding:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build
cd ..
npm run deploy
```

## If You're Not Sure

**Try HTTPS first** (most likely based on your NGINX setup). If it doesn't work, try HTTP:

```powershell
# Try HTTPS first
cd frontend
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build
cd ..
npm run deploy
```

**If HTTPS doesn't work, try HTTP:**

```powershell
cd frontend
$env:REACT_APP_API_URL="http://112.207.191.27"
npm run build
cd ..
npm run deploy
```

