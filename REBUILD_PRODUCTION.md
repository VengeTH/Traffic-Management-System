# 🚀 Rebuild Frontend for Production

## Problem
The frontend is trying to POST to GitHub Pages (`https://vengeth.github.io/api/v1/auth/login`) which can't handle API requests. It needs to point to your backend server.

## Solution: Rebuild with Backend URL

### Step 1: Set Backend URL

**Your backend is at:** `https://112.207.191.27` (or `http://112.207.191.27` if not using HTTPS)

### Step 2: Rebuild Frontend

**On Windows PowerShell:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://112.207.191.27"
npm run build
```

**Or if using HTTP (not HTTPS):**

```powershell
cd frontend
$env:REACT_APP_API_URL="http://112.207.191.27"
npm run build
```

### Step 3: Deploy

```powershell
cd ..
npm run deploy
```

## Alternative: One-Line Command

```powershell
cd frontend; $env:REACT_APP_API_URL="https://112.207.191.27"; npm run build; cd ..; npm run deploy
```

## Verify It Worked

After deploying, check the browser console. The API calls should go to:
- ✅ `https://112.207.191.27/api/v1/auth/login` (correct)
- ❌ `https://vengeth.github.io/api/v1/auth/login` (wrong - this is the error you're getting)

## For Local Testing

Local testing should still work fine - the code automatically detects `localhost` and uses `http://localhost:5000`.

## Important Notes

1. **HTTPS vs HTTP**: Use `https://` if your backend has SSL, `http://` if not
2. **No trailing slash**: Don't add `/` at the end of the URL
3. **Rebuild required**: Every time you change `REACT_APP_API_URL`, you must rebuild
4. **Environment variable**: `REACT_APP_API_URL` is embedded at **build time**, not runtime

