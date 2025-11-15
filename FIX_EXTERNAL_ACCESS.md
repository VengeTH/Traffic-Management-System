# 🔧 Fix External Access to Backend Server

## Problem
Server is running and accessible locally, but not accessible from the internet via `http://112.207.191.27:5000`

## Step 1: Verify Server is Listening on All Interfaces

On your Ubuntu server, check:

```bash
sudo ss -tulpn | grep :5000
```

You should see:
```
tcp   LISTEN 0  511  0.0.0.0:5000  0.0.0.0:*   users:(("node",pid=XXXXX,fd=XX))
```

**Important**: It should show `0.0.0.0:5000` (all interfaces), NOT `127.0.0.1:5000` (localhost only)

## Step 2: Check Firewall on Ubuntu Server

```bash
# Check firewall status
sudo ufw status

# If firewall is active, allow port 5000
sudo ufw allow 5000/tcp

# Verify it was added
sudo ufw status | grep 5000
```

## Step 3: Check if Server is Behind a Router/NAT

If your server is behind a router, you need to configure port forwarding:

1. **Find your server's local IP:**
   ```bash
   hostname -I
   # or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. **Configure port forwarding on your router:**
   - External Port: `5000`
   - Internal IP: Your server's local IP (e.g., `192.168.1.100`)
   - Internal Port: `5000`
   - Protocol: TCP

## Step 4: Test from Server Itself

```bash
# Test using the public IP from the server
curl http://112.207.191.27:5000/health

# If this works, the server is configured correctly
# If this doesn't work, check firewall
```

## Step 5: Check if Port is Open from Internet

Use an online tool to test:
- Visit: https://www.yougetsignal.com/tools/open-ports/
- Enter IP: `112.207.191.27`
- Enter Port: `5000`
- Click "Check"

Or use `nc` (netcat) from another machine:
```bash
nc -zv 112.207.191.27 5000
```

## Step 6: Alternative - Use Your Server's Hostname

If your server has a hostname configured, try using that instead:

```bash
# On server, check hostname
hostname

# Try accessing via hostname
curl http://heedful-dev:5000/health
```

## Step 7: Check Server Logs

```bash
# Check if requests are reaching the server
tail -f logs/combined.log

# Try accessing from Windows, and see if any logs appear
```

## Common Issues & Solutions

### Issue 1: Firewall Blocking
**Solution**: 
```bash
sudo ufw allow 5000/tcp
sudo ufw reload
```

### Issue 2: Router Port Forwarding Not Configured
**Solution**: 
- Access your router admin panel (usually `192.168.1.1` or `192.168.0.1`)
- Set up port forwarding for port 5000
- Forward to your server's local IP

### Issue 3: ISP Blocking Incoming Connections
**Solution**: 
- Some ISPs block incoming connections on residential connections
- You may need a business connection or use a VPN/tunneling service

### Issue 4: Server Only Listening on Localhost
**Solution**: 
- We already fixed this in `server.js` to listen on `0.0.0.0`
- Restart server to apply changes

## Quick Diagnostic Commands

Run these on your Ubuntu server:

```bash
# 1. Check if port is listening on all interfaces
sudo ss -tulpn | grep :5000

# 2. Check firewall
sudo ufw status

# 3. Check server's local IP
hostname -I

# 4. Test locally with public IP
curl http://112.207.191.27:5000/health

# 5. Check if any process is blocking
sudo iptables -L -n | grep 5000
```

## Temporary Workaround: Use Tunneling Service

If you can't configure port forwarding, use a tunneling service:

### Option 1: Cloudflare Tunnel (Free)
```bash
# Install cloudflared
# Create tunnel and expose port 5000
```

### Option 2: ngrok (Free tier available)
```bash
# Install ngrok
# Run: ngrok http 5000
# Use the provided URL in your frontend
```

## After Fixing External Access

Once external access works:

1. **Test from Windows:**
   ```powershell
   curl http://112.207.191.27:5000/health
   ```

2. **Build frontend:**
   ```powershell
   cd frontend
   $env:REACT_APP_API_URL="http://112.207.191.27:5000"
   npm run build
   npm run deploy
   ```

