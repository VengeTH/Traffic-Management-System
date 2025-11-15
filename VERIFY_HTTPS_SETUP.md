# ✅ Verify HTTPS Setup - Next Steps

## Current Status ✅

Your server has HTTPS configured:
- ✅ NGINX listening on port 443
- ✅ SSL certificates configured
- ✅ Firewall allows port 443

## Step 1: Test HTTPS from Server

**On your Ubuntu server, run:**
```bash
# Test HTTPS health endpoint
curl -k https://localhost/health

# Test HTTPS API endpoint
curl -k https://localhost/api/v1/health
```

**Expected**: Should return JSON response, not timeout.

## Step 2: Test HTTPS from Windows

**From your Windows PowerShell:**
```powershell
# Test HTTPS health endpoint (ignore certificate warning)
curl -k https://112.207.191.27/health

# Test HTTPS API endpoint
curl -k https://112.207.191.27/api/v1/health
```

**Expected**: Should return JSON response.

## Step 3: Verify Backend CORS Configuration

**On your Ubuntu server:**
```bash
# Check your backend .env file
cd ~/Traffic-Management-System
cat .env | grep -E "CORS_ORIGIN|ALLOW_GITHUB_PAGES|APP_URL"
```

**Required settings:**
```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
ALLOW_GITHUB_PAGES=true
APP_URL=https://112.207.191.27
```

**If not set, update:**
```bash
nano .env
```

Add/update these lines:
```env
CORS_ORIGIN=https://vengeth.github.io,http://localhost:3000
ALLOW_GITHUB_PAGES=true
APP_URL=https://112.207.191.27
NODE_ENV=production
```

**Save and restart backend:**
```bash
# If using PM2
pm2 restart all

# If using nodemon, it should auto-restart
# Or manually restart
```

## Step 4: Test Backend CORS

**From Windows PowerShell, test CORS:**
```powershell
# Test OPTIONS preflight request
curl -k -X OPTIONS https://112.207.191.27/api/v1/auth/login `
  -H "Origin: https://vengeth.github.io" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: Content-Type" `
  -v

# Should return 204 with CORS headers
```

## Step 5: Rebuild Frontend with HTTPS URL

**On your Windows machine:**
```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"

# Set HTTPS API URL
$env:REACT_APP_API_URL="https://112.207.191.27"

# Build
npm run build

# Deploy
npm run deploy
```

## Step 6: Test in Browser

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Visit**: `https://vengeth.github.io/Traffic-Management-System`
4. **If certificate warning appears**:
   - Click "Advanced"
   - Click "Proceed to 112.207.191.27 (unsafe)"
   - This is normal for self-signed certificates
5. **Open browser console** (F12)
6. **Try to login**
7. **Check console** - should see API calls to `https://112.207.191.27`

## Troubleshooting

### If HTTPS test fails from server:
```bash
# Check NGINX error logs
sudo tail -20 /var/log/nginx/error.log

# Check if backend is running
curl http://localhost:5000/health

# Check NGINX config
sudo nginx -t
```

### If HTTPS test fails from Windows:
```powershell
# Test if port 443 is reachable
Test-NetConnection -ComputerName 112.207.191.27 -Port 443

# Should show: TcpTestSucceeded: True
```

### If CORS error appears:
1. Verify `.env` has `CORS_ORIGIN=https://vengeth.github.io`
2. Verify `.env` has `ALLOW_GITHUB_PAGES=true`
3. Restart backend server
4. Check backend logs for CORS warnings

### If still getting timeout:
1. Check NGINX access logs: `sudo tail -f /var/log/nginx/access.log`
2. Check if requests are reaching NGINX
3. Verify backend is running: `curl http://localhost:5000/health`
4. Check NGINX proxy_pass is correct in config

## Quick Checklist

- [ ] HTTPS works from server (`curl -k https://localhost/health`)
- [ ] HTTPS works from Windows (`curl -k https://112.207.191.27/health`)
- [ ] Backend `.env` has `CORS_ORIGIN=https://vengeth.github.io`
- [ ] Backend `.env` has `ALLOW_GITHUB_PAGES=true`
- [ ] Backend `.env` has `APP_URL=https://112.207.191.27`
- [ ] Backend server restarted after `.env` changes
- [ ] Frontend rebuilt with `REACT_APP_API_URL="https://112.207.191.27"`
- [ ] Frontend deployed to GitHub Pages
- [ ] Browser cache cleared
- [ ] Tested login in browser

## Expected Result

After completing all steps:
- ✅ Login should work
- ✅ No timeout errors
- ✅ API calls should go to `https://112.207.191.27`
- ✅ Browser console shows successful API requests

