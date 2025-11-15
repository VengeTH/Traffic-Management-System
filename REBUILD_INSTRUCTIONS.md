# 🔧 How to Fix "localhost:5000 Connection Refused" Error

## Problem

Your frontend is trying to connect to `localhost:5000` in production because it was built without the `REACT_APP_API_URL` environment variable set.

## Solution: Rebuild with Production API URL

You need to rebuild the frontend with your production API server URL.

### Step 1: Find Your Production API URL

First, determine where your backend API is hosted. Common options:
- Heroku: `https://your-app-name.herokuapp.com`
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`
- Vercel: `https://your-app-name.vercel.app`
- Custom domain: `https://api.yourdomain.com`

### Step 2: Rebuild the Frontend

**On Windows PowerShell:**
```powershell
cd frontend
$env:REACT_APP_API_URL="https://your-actual-api-url.com"
npm run build
npm run deploy
```

**On Windows CMD:**
```cmd
cd frontend
set REACT_APP_API_URL=https://your-actual-api-url.com
npm run build
npm run deploy
```

**On Linux/Mac:**
```bash
cd frontend
REACT_APP_API_URL=https://your-actual-api-url.com npm run build
npm run deploy
```

### Step 3: Verify

After rebuilding and deploying:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try logging in again
4. Check the browser console - you should see API calls going to your production API URL, not localhost

## Example

If your API is hosted at `https://traffic-api.herokuapp.com`:

```powershell
cd frontend
$env:REACT_APP_API_URL="https://traffic-api.herokuapp.com"
npm run build
npm run deploy
```

## Important Notes

- ⚠️ **Replace the placeholder URL** with your actual API server URL
- ⚠️ **Include the protocol** (https:// or http://)
- ⚠️ **Don't include a trailing slash** at the end
- ⚠️ **Rebuild is required** - you cannot change the API URL without rebuilding
- ✅ The API URL is embedded at build time, not runtime

## Still Having Issues?

1. **Check your backend CORS settings** - Make sure your backend allows requests from `https://vengeth.github.io`
2. **Verify your API is running** - Test your API URL directly in a browser or with curl
3. **Check browser console** - Look for CORS errors or other API errors
4. **Verify the build** - Check `frontend/build/static/js/main.*.js` and search for your API URL to confirm it was embedded correctly

