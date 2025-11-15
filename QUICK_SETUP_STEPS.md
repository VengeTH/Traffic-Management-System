# ✅ Quick Setup Steps - Your Backend URL

## Your Backend Information:
- **IPv4 Address**: `112.207.191.27`
- **Port**: `5000`
- **Backend URL**: `http://112.207.191.27:5000`
- **Status**: ✅ Backend is running (nodemon detected)

## Step 1: Check if Port 5000 is Listening

Since `netstat` is not installed, use `ss` instead:

```bash
sudo ss -tulpn | grep :5000
```

This will show if port 5000 is listening and accepting connections.

## Step 2: Test Backend Locally

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  ...
}
```

## Step 3: Configure Firewall

```bash
# Allow port 5000
sudo ufw allow 5000/tcp

# Check firewall status
sudo ufw status
```

## Step 4: Update Backend .env File

```bash
# Navigate to your backend directory
cd ~/Traffic-Management-System

# Edit .env file
nano .env
```

**Update these settings:**

```env
NODE_ENV=production
APP_URL=http://112.207.191.27:5000
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
FRONTEND_URL=https://vengeth.github.io/Traffic-Management-System
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Restart Backend

Since you're using nodemon, it should auto-restart. But to be sure:

```bash
# Find the process
ps aux | grep nodemon

# If needed, restart manually:
# Press Ctrl+C in the terminal where nodemon is running
# Then restart:
cd ~/Traffic-Management-System
npm run dev
# or
nodemon server.js
```

## Step 6: Test External Access

From your Windows machine, open PowerShell and test:

```powershell
# Test if backend is accessible from internet
curl http://112.207.191.27:5000/health
```

Or open in browser:
```
http://112.207.191.27:5000/health
```

You should see JSON response with server health status.

## Step 7: Build Frontend with Your Backend URL

On your Windows machine:

```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"

# Set the backend URL
$env:REACT_APP_API_URL="http://112.207.191.27:5000"

# Build
npm run build

# Deploy
npm run deploy
```

## Step 8: Verify Everything

1. ✅ Backend running: `curl http://localhost:5000/health` (on server)
2. ✅ Port open: `sudo ss -tulpn | grep :5000` (on server)
3. ✅ Firewall configured: `sudo ufw status` (on server)
4. ✅ External access: `curl http://112.207.191.27:5000/health` (from Windows)
5. ✅ CORS configured: Check `.env` has `CORS_ORIGIN=https://vengeth.github.io`
6. ✅ Frontend built: Check `frontend/build/index.html` has correct API URL
7. ✅ Test login: Try logging in from GitHub Pages

## Troubleshooting

### If port 5000 is not listening:
```bash
# Check what port the server is actually using
sudo ss -tulpn | grep node
```

### If external access doesn't work:
1. Check firewall: `sudo ufw status`
2. Check if server is listening on all interfaces (0.0.0.0) not just localhost
3. Check router port forwarding (if behind NAT)

### If CORS errors occur:
- Make sure `.env` has: `CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000`
- Restart backend after changing `.env`

## Your Final Backend URL

**Use this in your frontend build:**
```
http://112.207.191.27:5000
```

