# 🌐 Fix Internet Access to Backend Server

## Problem
Connection timeout when trying to access `https://112.207.191.27` from the internet.

## NGINX Config is Correct ✅
Your NGINX is listening on all interfaces (`0.0.0.0:443`), which is correct.

## Most Likely Issues

### 1. Router Port Forwarding Not Set Up

**Your router needs to forward:**
- **External Port:** 443 (HTTPS)
- **Internal IP:** Your Ubuntu server's local IP (e.g., `192.168.1.100`)
- **Internal Port:** 443
- **Protocol:** TCP

**To find your server's local IP:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Then set up port forwarding in your router admin panel.**

### 2. ISP Blocking Port 443

Some ISPs block incoming connections on port 443. 

**Test with port 80 (HTTP) first:**
```bash
# Test if HTTP works
curl http://112.207.191.27/health
```

**If HTTP works but HTTPS doesn't, your ISP might be blocking 443.**

### 3. Check if Server is Behind NAT

**On your Ubuntu server, check your public IP:**
```bash
curl ifconfig.me
```

**Compare with `112.207.191.27` - if they don't match, you're behind NAT and need port forwarding.**

### 4. Test from Different Network

**Try accessing from your phone's mobile data (not WiFi):**
- Open `https://112.207.191.27/health` in mobile browser

**If it works from mobile but not from your computer, it's a local network issue.**

## Quick Test: Check if Port is Open

**From your Windows machine, test if port 443 is open:**

```powershell
Test-NetConnection -ComputerName 112.207.191.27 -Port 443
```

**If it says "TcpTestSucceeded : False", the port is not accessible from the internet.**

## Solution Steps

1. **Set up port forwarding in router** (most likely fix)
2. **Check ISP restrictions** (some block port 443)
3. **Use different port** (if 443 is blocked, use 8443 or similar)
4. **Check server firewall** (`sudo ufw status`)

## Alternative: Use HTTP Instead of HTTPS

**If HTTPS port 443 is blocked, you can use HTTP port 80:**

**Rebuild frontend with HTTP:**
```powershell
cd frontend
$env:REACT_APP_API_URL="http://112.207.191.27"
npm run build
cd ..
npm run deploy
```

**Then update NGINX to not redirect HTTP to HTTPS (temporarily for testing).**

