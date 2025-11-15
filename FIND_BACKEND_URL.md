# 🔍 How to Find Your Backend Server URL

Since you're running your backend on your own Ubuntu server, here's how to find and configure your backend API URL.

## Step 1: Find Your Server's IP Address

### Option A: Public IP Address (If accessible from internet)

**On your Ubuntu server, run:**
```bash
# Get your public IP address
curl ifconfig.me
# or
curl ipinfo.io/ip
# or
wget -qO- ifconfig.me
```

This will show your public IP address (e.g., `123.45.67.89`)

### Option B: Local Network IP (If only accessible on local network)

**On your Ubuntu server, run:**
```bash
# Get your local network IP
hostname -I
# or
ip addr show
# or
ifconfig
```

This will show your local IP (e.g., `192.168.1.100`)

## Step 2: Check Your Server Port

Your backend is configured to run on port 5000 by default (check your `.env` file or `server.js`).

**Check if your server is running:**
```bash
# On your Ubuntu server
sudo netstat -tulpn | grep :5000
# or
sudo ss -tulpn | grep :5000
```

## Step 3: Determine Your Backend URL

### Scenario 1: Server has a Domain Name

If you have a domain name pointing to your server:
```
https://api.yourdomain.com
# or
https://yourdomain.com
```

### Scenario 2: Server has Public IP (No Domain)

If your server has a public IP and is accessible from the internet:
```
http://YOUR_PUBLIC_IP:5000
# Example: http://123.45.67.89:5000
```

**⚠️ Important**: For production, you should:
- Use HTTPS (set up SSL certificate with Let's Encrypt)
- Use a domain name instead of IP address
- Configure firewall properly

### Scenario 3: Server Only on Local Network

If your server is only accessible on your local network:
- **This won't work for GitHub Pages** - GitHub Pages needs to access your API from the internet
- You need to either:
  1. Make your server accessible from the internet (port forwarding, public IP)
  2. Use a tunneling service (ngrok, Cloudflare Tunnel, etc.)
  3. Deploy backend to a cloud service (Heroku, Railway, Render, etc.)

## Step 4: Test Your Backend URL

### Test if your backend is accessible:

**From your local machine:**
```bash
# Test if backend is running
curl http://YOUR_SERVER_IP:5000/health

# Test from browser
# Open: http://YOUR_SERVER_IP:5000/health
```

**From the internet (if you have public IP):**
```bash
# Test from a different network or use online tool
# Visit: http://YOUR_PUBLIC_IP:5000/health
```

### Expected Response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

## Step 5: Configure for Production

### On Your Ubuntu Server:

1. **Check your `.env` file:**
```bash
cd /path/to/your/backend
cat .env | grep -E "PORT|APP_URL|CORS_ORIGIN"
```

2. **Update your `.env` file:**
```env
PORT=5000
NODE_ENV=production
APP_URL=http://YOUR_PUBLIC_IP:5000
# or if you have a domain:
APP_URL=https://api.yourdomain.com

# Important: Allow GitHub Pages to access your API
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
```

3. **Make sure your firewall allows connections:**
```bash
# Allow port 5000 (if using UFW)
sudo ufw allow 5000/tcp

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

4. **If behind a router, configure port forwarding:**
   - Forward external port 5000 → your server's internal IP:5000
   - Or use a reverse proxy (nginx) on port 80/443

## Step 6: Set Up HTTPS (Recommended for Production)

### Using Let's Encrypt (Free SSL):

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Get certificate (if you have a domain)
sudo certbot certonly --standalone -d api.yourdomain.com

# Configure your server to use HTTPS
# Update your .env:
APP_URL=https://api.yourdomain.com
FORCE_HTTPS=true
```

### Using Nginx as Reverse Proxy:

```nginx
# /etc/nginx/sites-available/your-api
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 7: Build Frontend with Your Backend URL

Once you know your backend URL, rebuild your frontend:

**If your backend is at `http://123.45.67.89:5000`:**
```powershell
cd frontend
$env:REACT_APP_API_URL="http://123.45.67.89:5000"
npm run build
npm run deploy
```

**If your backend is at `https://api.yourdomain.com`:**
```powershell
cd frontend
$env:REACT_APP_API_URL="https://api.yourdomain.com"
npm run build
npm run deploy
```

## Common Issues & Solutions

### Issue: "Connection refused" from GitHub Pages
**Cause**: Your server is not accessible from the internet

**Solutions**:
1. Check firewall rules
2. Configure port forwarding on your router
3. Verify your public IP is correct
4. Test from external network

### Issue: CORS errors
**Cause**: Backend CORS not configured for GitHub Pages domain

**Solution**: Update your backend `.env`:
```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
```

### Issue: Mixed content (HTTP/HTTPS)
**Cause**: GitHub Pages uses HTTPS, but your API uses HTTP

**Solution**: 
- Set up HTTPS for your backend (Let's Encrypt)
- Or use a tunneling service that provides HTTPS

## Quick Checklist

- [ ] Found your server's public IP or domain
- [ ] Backend is running on port 5000
- [ ] Firewall allows port 5000
- [ ] Port forwarding configured (if behind router)
- [ ] Backend accessible from internet (test with `curl` or browser)
- [ ] CORS configured for `https://vengeth.github.io`
- [ ] Rebuilt frontend with `REACT_APP_API_URL` set
- [ ] Tested login from GitHub Pages deployment

## Need Help?

If you're not sure about your setup, check:
1. **Server logs**: `tail -f logs/combined.log` or `pm2 logs`
2. **Network connectivity**: `netstat -tulpn | grep :5000`
3. **Firewall status**: `sudo ufw status`
4. **Process status**: `ps aux | grep node`

