# 🚀 Rebuild Frontend with HTTPS URL - Step by Step

## Why You Need to Rebuild

The frontend was built **without** the HTTPS API URL. React embeds the API URL at **build time**, not runtime. You **must** rebuild to update it.

## Step-by-Step Instructions

### Step 1: Open PowerShell on Windows

Open PowerShell in Administrator mode (right-click → Run as Administrator).

### Step 2: Navigate to Frontend Directory

```powershell
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"
```

### Step 3: Set the HTTPS API URL Environment Variable

```powershell
$env:REACT_APP_API_URL="https://112.207.191.27"
```

**Important**: 
- Use `https://` (not `http://`)
- No trailing slash
- No port number (NGINX handles that)

### Step 4: Verify the Environment Variable is Set

```powershell
echo $env:REACT_APP_API_URL
```

**Expected output**: `https://112.207.191.27`

### Step 5: Build the Frontend

```powershell
npm run build
```

This will take 1-2 minutes. Wait for it to complete.

**Look for**: `Compiled successfully!` at the end.

### Step 6: Verify the Build Contains the Correct API URL

**Check the built JavaScript file:**
```powershell
# Find the main JS file
Get-ChildItem build\static\js\main.*.js | Select-Object -First 1 | Get-Content | Select-String "112.207.191.27"
```

**Or check the build output:**
```powershell
# Check if the API URL is in the build
Select-String -Path "build\static\js\*.js" -Pattern "112.207.191.27" | Select-Object -First 1
```

**Expected**: Should find `https://112.207.191.27` in the built files.

### Step 7: Deploy to GitHub Pages

```powershell
npm run deploy
```

This will:
1. Push the build to the `gh-pages` branch
2. GitHub Pages will automatically update

**Wait for**: `Published` message at the end.

### Step 8: Wait for GitHub Pages to Update

GitHub Pages can take **1-5 minutes** to update after deployment.

### Step 9: Clear Browser Cache and Test

1. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard refresh**:
   - Press `Ctrl+Shift+R` (or `Ctrl+F5`)

3. **Open browser console** (F12):
   - Go to Network tab
   - Filter by "XHR" or "Fetch"

4. **Visit your site**:
   ```
   https://vengeth.github.io/Traffic-Management-System
   ```

5. **Try to login**:
   - Watch the Network tab
   - You should see a request to: `https://112.207.191.27/api/v1/auth/login`
   - **NOT** `localhost:5000` or `http://112.207.191.27`

### Step 10: Verify API Calls

**In browser console (F12), check:**

1. **Console tab** - Look for:
   - ✅ API calls to `https://112.207.191.27`
   - ❌ No calls to `localhost:5000`
   - ❌ No calls to `http://112.207.191.27`

2. **Network tab** - Look for:
   - Request URL: `https://112.207.191.27/api/v1/auth/login`
   - Status: Should be 200, 400, or 401 (not timeout)

## Complete Command Sequence

Copy and paste this entire block into PowerShell:

```powershell
# Navigate to frontend
cd "D:\Programming\Projects\VS Code\Traffic Management System\frontend"

# Set HTTPS API URL
$env:REACT_APP_API_URL="https://112.207.191.27"

# Verify it's set
echo "API URL: $env:REACT_APP_API_URL"

# Build
npm run build

# Deploy
npm run deploy

# Done! Wait 1-5 minutes for GitHub Pages to update
```

## Troubleshooting

### If build fails:
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
# Then try building again
```

### If deploy fails:
```powershell
# Check if gh-pages is installed
npm list gh-pages

# If not, install it
npm install --save-dev gh-pages

# Try deploy again
npm run deploy
```

### If login still fails after rebuild:

1. **Check browser console** (F12):
   - What URL is it trying to connect to?
   - Any error messages?

2. **Check Network tab**:
   - Is the request going to `https://112.207.191.27`?
   - What's the response status?

3. **Verify backend is running**:
   ```powershell
   # From Windows, test backend
   curl -k https://112.207.191.27/health
   ```

4. **Check certificate warning**:
   - Did you accept the certificate warning?
   - Browsers block requests if certificate is not accepted

### If you see "REACT_APP_API_URL not configured" in console:

This means the frontend was built without the environment variable. Make sure:
1. You set `$env:REACT_APP_API_URL` **before** running `npm run build`
2. The variable is set in the **same PowerShell session**
3. You didn't close PowerShell between setting the variable and building

## Quick Verification Checklist

After rebuilding and deploying:

- [ ] Build completed successfully
- [ ] Deploy completed successfully
- [ ] Waited 1-5 minutes for GitHub Pages update
- [ ] Cleared browser cache
- [ ] Hard refreshed (Ctrl+Shift+R)
- [ ] Opened browser console (F12)
- [ ] Checked Network tab - API calls go to `https://112.207.191.27`
- [ ] No calls to `localhost:5000`
- [ ] Tried logging in
- [ ] Checked console for errors

## Expected Result

After completing all steps:
- ✅ Login should work
- ✅ Browser console shows API calls to `https://112.207.191.27`
- ✅ No timeout errors
- ✅ No CORS errors (if backend CORS is configured)

