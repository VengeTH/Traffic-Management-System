# 🔍 Testing External Access

## Current Status ✅
- ✅ Firewall allows port 5000
- ✅ Server listening on 0.0.0.0:5000 (all interfaces)
- ✅ Server accessible locally

## Next Steps to Diagnose

### Step 1: Test from Server Using Public IP

On your Ubuntu server, run:

```bash
# Test if server responds to public IP from itself
curl http://112.207.191.27:5000/health

# Also test with the server's hostname
curl http://localhost:5000/health
```

### Step 2: Check for Additional Firewall Rules (iptables)

```bash
# Check iptables rules (might have additional blocking)
sudo iptables -L -n -v | grep 5000

# Check if there are any DROP rules
sudo iptables -L -n | grep DROP
```

### Step 3: Check Router/Network Configuration

Since your server has a public IP (`112.207.191.27`), check:

1. **Is your server directly connected to the internet?**
   - If yes, it should work
   - If behind a router, you need port forwarding

2. **Find your server's local network IP:**
   ```bash
   hostname -I
   # or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

3. **If behind a router:**
   - Access router admin panel
   - Configure port forwarding: External 5000 → Your server's local IP:5000

### Step 4: Test Port from Internet

Use an online port checker:
- Visit: https://www.yougetsignal.com/tools/open-ports/
- IP: `112.207.191.27`
- Port: `5000`
- Click "Check"

This will tell you if the port is accessible from the internet.

### Step 5: Check Server Logs

```bash
# Monitor server logs while testing
tail -f logs/combined.log

# In another terminal, try accessing from Windows
# See if any requests appear in logs
```

If no requests appear in logs, the connection is being blocked before reaching your server.

## Common Issues

### Issue: ISP Blocking Incoming Connections
Some residential ISPs block incoming connections. Solutions:
- Use a tunneling service (Cloudflare Tunnel, ngrok)
- Contact ISP to open the port
- Use a VPS instead

### Issue: Router Not Forwarding
If behind a router, configure port forwarding.

### Issue: Cloudflare Tunnel Interference
You have `cloudflared` running. Check if it's interfering:
```bash
# Check cloudflared status
ps aux | grep cloudflared

# Check cloudflared config
cat ~/.cloudflared/config.yml 2>/dev/null || echo "No config found"
```

## Quick Test Commands

Run these on your server:

```bash
# 1. Test localhost
curl http://localhost:5000/health

# 2. Test with public IP from server
curl http://112.207.191.27:5000/health

# 3. Check local network IP
hostname -I

# 4. Check iptables
sudo iptables -L -n | head -20

# 5. Test with netcat (if installed)
nc -zv 112.207.191.27 5000
```

## Alternative Solutions

If port forwarding doesn't work:

### Option 1: Use Cloudflare Tunnel
Since you have cloudflared, you can expose port 5000:
```bash
# Check cloudflared config
# Add a tunnel for port 5000
```

### Option 2: Use ngrok
```bash
# Install ngrok
# Run: ngrok http 5000
# Use the provided URL in frontend
```

### Option 3: Use Nginx Reverse Proxy
Since you have Nginx running, you could:
- Expose via Nginx on port 80/443
- Configure reverse proxy to backend on 5000
- Access via HTTP/HTTPS on standard ports

