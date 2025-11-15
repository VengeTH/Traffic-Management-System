# 🚨 CRITICAL: Sync CSRF Fix to Ubuntu Server

## Problem
The CSRF middleware fix is in your Windows workspace, but the backend is running on Ubuntu server. The server is still using the old code!

## Solution: Copy Updated File to Server

### Option 1: Using SCP (from Windows PowerShell)

```powershell
# From your Windows machine, in PowerShell:
scp "D:\Programming\Projects\VS Code\Traffic Management System\middleware\csrf.js" venge@112.207.191.27:~/Traffic-Management-System/middleware/csrf.js
```

### Option 2: Using Git (if you have git repo)

**On Ubuntu server:**
```bash
cd ~/Traffic-Management-System
git pull
# or
git fetch
git checkout origin/main -- middleware/csrf.js
```

### Option 3: Manual Copy (if you have file access)

1. Open the file on Windows: `middleware/csrf.js`
2. Copy all contents
3. SSH to Ubuntu server
4. Edit the file:
   ```bash
   cd ~/Traffic-Management-System
   nano middleware/csrf.js
   ```
5. Paste the new contents
6. Save (Ctrl+X, then Y, then Enter)

### Option 4: Direct Edit on Server (Quick Fix)

**SSH to your Ubuntu server and run:**

```bash
cd ~/Traffic-Management-System
nano middleware/csrf.js
```

**Find the `csrfProtection` function (around line 68) and replace it with:**

```javascript
const csrfProtection = (req, res, next) => {
  // * Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next()
  }
  
  // * NUCLEAR OPTION: Get EVERY possible path string and check for login/auth keywords
  const pathString = JSON.stringify({
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    route: req.route?.path
  })
  
  // * If ANY path representation contains login/auth keywords, bypass CSRF
  const hasLogin = pathString.toLowerCase().includes('login')
  const hasRegister = pathString.toLowerCase().includes('register')
  const hasAuth = pathString.toLowerCase().includes('/auth/')
  const hasForgotPassword = pathString.toLowerCase().includes('forgot')
  const hasResetPassword = pathString.toLowerCase().includes('reset')
  const hasVerifyEmail = pathString.toLowerCase().includes('verify')
  const hasRefresh = pathString.toLowerCase().includes('refresh')
  const hasHealth = pathString.toLowerCase().includes('health')
  const hasViolationsSearch = pathString.toLowerCase().includes('violations/search')
  
  const isPublicEndpoint = hasLogin || hasRegister || hasAuth || hasForgotPassword || 
                          hasResetPassword || hasVerifyEmail || hasRefresh || 
                          hasHealth || hasViolationsSearch
  
  // * FORCE LOG - this MUST show up
  console.log('='.repeat(80))
  console.log('🔵 CSRF MIDDLEWARE CALLED')
  console.log('Method:', req.method)
  console.log('Path:', req.path)
  console.log('URL:', req.url)
  console.log('OriginalURL:', req.originalUrl)
  console.log('BaseURL:', req.baseUrl)
  console.log('PathString:', pathString)
  console.log('IsPublicEndpoint:', isPublicEndpoint)
  console.log('='.repeat(80))
  
  if (isPublicEndpoint) {
    console.log('✅✅✅ CSRF BYPASSED - PUBLIC ENDPOINT ✅✅✅')
    return next()
  }
  
  console.log('❌❌❌ CSRF NOT BYPASSED - CHECKING TOKEN ❌❌❌')

  // * Get CSRF token from header
  const csrfToken = req.get("X-CSRF-Token") || req.body._csrf
  // ... rest of the function stays the same
```

## After Updating File

**Restart the backend:**
```bash
# Stop server (Ctrl+C)
# Then restart:
cd ~/Traffic-Management-System
node server.js
```

## Verify It Worked

**Try login from frontend, then check backend console. You should see:**
```
================================================================================
🔵 CSRF MIDDLEWARE CALLED
Method: POST
Path: /v1/auth/login
URL: /v1/auth/login
OriginalURL: /api/v1/auth/login
...
IsPublicEndpoint: true
================================================================================
✅✅✅ CSRF BYPASSED - PUBLIC ENDPOINT ✅✅✅
```

**If you see this, login should work!**

## If Still Not Working

**Check:**
1. Did you save the file on the server?
2. Did you restart the backend?
3. Are you looking at the right terminal (the one running `node server.js`)?

