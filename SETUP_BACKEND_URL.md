# 🔧 Setting Up Your Backend URL

You got an IPv6 address: `2001:4450:4f2b:9000:1adb:f2ff:fe51:c2d6`

## Step 1: Get Your IPv4 Address (Preferred)

Try to get your IPv4 address:

```bash
# Get IPv4 address specifically
curl -4 ifconfig.me
# or
curl ipv4.icanhazip.com
# or
curl -4 icanhazip.com
```

**Why IPv4?** 
- Most browsers and services work better with IPv4
- Easier to configure
- More compatible with GitHub Pages

## Step 2: Check Your Server Configuration

### Check if your backend is running:

```bash
# Check if Node.js/backend is running
ps aux | grep node

# Check if port 5000 is listening
sudo netstat -tulpn | grep :5000
# or
sudo ss -tulpn | grep :5000
```

### Check your backend .env file:

```bash
# Navigate to your backend directory
cd /path/to/your/backend

# Check current configuration
cat .env | grep -E "PORT|APP_URL|CORS_ORIGIN"
```

## Step 3: Test Your Backend

### Test locally on the server:

```bash
# Test health endpoint locally
curl http://localhost:5000/health

# Should return JSON like:
# {"success": true, "message": "Server is healthy", ...}
```

### Test from your local machine (Windows):

Open PowerShell and test:

```powershell
# If you have IPv4 (replace with your IPv4)
curl http://YOUR_IPv4_ADDRESS:5000/health

# If only IPv6 (use brackets for IPv6)
curl http://[2001:4450:4f2b:9000:1adb:f2ff:fe51:c2d6]:5000/health
```

## Step 4: Configure Your Backend for Production

### Update your backend `.env` file:

```bash
# Edit your .env file
nano .env
# or
vim .env
```

**Update these settings:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Your backend URL (use IPv4 if available, or IPv6)
# For IPv4:
APP_URL=http://YOUR_IPv4_ADDRESS:5000

# For IPv6 (use brackets):
APP_URL=http://[2001:4450:4f2b:9000:1adb:f2ff:fe51:c2d6]:5000

# IMPORTANT: Allow GitHub Pages to access your API
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000

# Frontend URL
FRONTEND_URL=https://vengeth.github.io/Traffic-Management-System
```

### Restart your backend:

```bash
# If using PM2:
pm2 restart all
# or
pm2 restart your-app-name

# If using systemd:
sudo systemctl restart your-backend-service

# If running directly:
# Stop current process (Ctrl+C) and restart:
npm start
# or
node server.js
```

## Step 5: Configure Firewall

Make sure port 5000 is open:

```bash
# Check firewall status
sudo ufw status

# Allow port 5000
sudo ufw allow 5000/tcp

# If you have IPv6, also allow it:
sudo ufw allow 5000/tcp comment 'Backend API'
```

## Step 6: Test External Access

### Test from a different network or use online tools:

1. **From your phone (on mobile data, not WiFi):**
   - Open browser
   - Go to: `http://YOUR_IP:5000/health`

2. **Use online tools:**
   - Visit: https://www.yougetsignal.com/tools/open-ports/
   - Enter your IP and port 5000
   - Check if port is open

3. **From another computer:**
   ```bash
   curl http://YOUR_IP:5000/health
   ```

## Step 7: Build Frontend with Your Backend URL

Once you've confirmed your backend is accessible, build your frontend:

### If you have IPv4:

```powershell
cd frontend
$env:REACT_APP_API_URL="http://YOUR_IPv4_ADDRESS:5000"
npm run build
npm run deploy
```

### If you only have IPv6:

**⚠️ Important**: GitHub Pages and most browsers have issues with IPv6 in URLs. You have two options:

**Option 1: Use a Domain Name (Recommended)**
- Get a free domain or use a dynamic DNS service
- Point it to your IPv6 address
- Use the domain in your frontend

**Option 2: Use IPv6 with brackets (may not work in all browsers)**
```powershell
cd frontend
$env:REACT_APP_API_URL="http://[2001:4450:4f2b:9000:1adb:f2ff:fe51:c2d6]:5000"
npm run build
npm run deploy
```

## Step 8: Verify Everything Works

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check backend is accessible from internet:**
   - Test from your phone or another network
   - Should return JSON response

3. **Check CORS is configured:**
   - Backend should allow `https://vengeth.github.io`

4. **Test frontend:**
   - Deploy frontend to GitHub Pages
   - Try to login
   - Check browser console for errors

## Troubleshooting

### Issue: "Connection refused" from external networks
**Solution:**
- Check firewall: `sudo ufw status`
- Check port forwarding on router (if behind NAT)
- Verify backend is listening on `0.0.0.0` not just `127.0.0.1`

### Issue: CORS errors
**Solution:**
- Update `.env`: `CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000`
- Restart backend

### Issue: IPv6 not working in browser
**Solution:**
- Get a domain name (free from Freenom, No-IP, etc.)
- Set up dynamic DNS
- Use domain instead of IP

## Next Steps

1. ✅ Get your IPv4 address (if available)
2. ✅ Test backend is running locally
3. ✅ Configure firewall
4. ✅ Test external access
5. ✅ Update backend `.env` with CORS settings
6. ✅ Restart backend
7. ✅ Build frontend with your backend URL
8. ✅ Deploy and test

