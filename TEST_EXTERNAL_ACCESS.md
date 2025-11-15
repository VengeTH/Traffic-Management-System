# 🌐 Test External Access to Backend

## Problem
Getting `ERR_CONNECTION_TIMED_OUT` when frontend tries to connect to `https://112.207.191.27/api/v1/auth/login`.

## Quick Tests

### Test 1: Check if Server is Accessible from Internet

**From your Windows machine, open browser and go to:**
- `https://112.207.191.27/health`

**If it doesn't load:**
- Server might not be accessible from internet
- Router/firewall might be blocking
- NGINX might only be listening on localhost

### Test 2: Check NGINX Listen Address

**On your Ubuntu server:**

```bash
sudo cat /etc/nginx/sites-available/traffic-api | grep "listen"
```

**Should see:**
```nginx
listen 443 ssl http2;
listen 80;
```

**If you see `listen 127.0.0.1:443` or `listen localhost:443`, that's the problem!**

**It should be:**
```nginx
listen 443 ssl http2;  # Listens on all interfaces (0.0.0.0:443)
listen 80;             # Listens on all interfaces (0.0.0.0:80)
```

### Test 3: Check if Port 443 is Accessible

**On your Ubuntu server:**

```bash
sudo ss -tulpn | grep :443
```

**Should show:**
```
tcp LISTEN 0 511 0.0.0.0:443
```

**If it shows `127.0.0.1:443`, that's the problem - it's only listening locally.**

### Test 4: Check Router/ISP Firewall

**Your ISP or router might be blocking incoming connections on port 443.**

**Check if you have port forwarding set up:**
- Router should forward port 443 to your Ubuntu server's local IP

### Test 5: Check if IP is Public

**On your Ubuntu server:**

```bash
curl ifconfig.me
```

**Compare with `112.207.191.27` - should match if it's your public IP.**

## Most Likely Issues

1. **NGINX only listening on localhost** - Fix by removing `127.0.0.1` from listen directive
2. **Router not forwarding port 443** - Set up port forwarding in router
3. **ISP blocking port 443** - Contact ISP or use different port
4. **Firewall blocking** - Check `sudo ufw status`

## Quick Fix: Check NGINX Config

**On your Ubuntu server:**

```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

**Make sure the listen directives are:**
```nginx
listen 443 ssl http2;
listen 80;
```

**NOT:**
```nginx
listen 127.0.0.1:443 ssl http2;  # WRONG - only localhost
listen localhost:443 ssl http2;  # WRONG - only localhost
```

**After fixing:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

