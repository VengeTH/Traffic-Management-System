# 🧪 Quick Test - Localhost Login

## Immediate Checks

### 1. Is Backend Running?

**Check backend terminal:**
- Should see: `Server running on port 5000` or similar
- No error messages

**Or test with curl:**
```bash
curl http://localhost:5000/health
```

**Expected**: JSON response with `"status":"OK"`

### 2. Is Frontend Running?

**Check frontend terminal:**
- Should see: `webpack compiled successfully` or similar
- Running on `http://localhost:3000`

### 3. Test Login API Directly

**In a new terminal (Windows PowerShell):**
```powershell
# Test login endpoint
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

**What response do you get?**
- `{"success":false,"message":"Invalid email or password"}` → API works, wrong credentials
- `{"success":false,"message":"CSRF token missing"}` → Shouldn't happen (login is exempt)
- `Connection refused` → Backend not running
- `404 Not Found` → Wrong endpoint URL
- `CORS error` → CORS not configured

### 4. Check Browser Console

**Open browser (F12) and check:**

1. **Console tab** - Any red errors?
2. **Network tab**:
   - Filter by "XHR" or "Fetch"
   - Try to login
   - Click on the login request
   - Check:
     - **Status**: What code? (200, 400, 401, 403, 500?)
     - **Response**: What does it say?
     - **Request URL**: Should be `http://localhost:5000/api/v1/auth/login`

### 5. Check API Base URL

**In browser console (F12), run:**
```javascript
// Check what API URL is being used
console.log('Current hostname:', window.location.hostname);

// The API should auto-detect to http://localhost:5000
// Check Network tab to see actual request URL
```

## Most Common Issues

### Issue: "Connection Refused" or Network Error

**Cause**: Backend not running or wrong port

**Fix**:
```bash
# Start backend
cd backend
npm run dev
# or
node server.js
```

### Issue: CORS Error

**Cause**: Backend CORS not allowing localhost:3000

**Fix**:
```env
# In backend .env file
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

Then restart backend.

### Issue: "Invalid email or password"

**Cause**: User doesn't exist or wrong password

**Fix**:
1. Register a new user first: `http://localhost:3000/register`
2. Or check database for existing users
3. Make sure email is verified (if email verification is required)

### Issue: "Account is locked"

**Cause**: Too many failed login attempts

**Fix**:
- Wait 15-30 minutes
- Or reset in database
- Or create new account

### Issue: Status 403 "CSRF token missing"

**This shouldn't happen for login** - login is exempt from CSRF.

**If it does happen:**
- Check backend logs
- Verify request is going to `/api/v1/auth/login` (not `/api/auth/login`)
- Check middleware order in server.js

## Quick Diagnostic Commands

**Copy and paste these into PowerShell:**

```powershell
# 1. Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
curl http://localhost:5000/health
Write-Host ""

# 2. Test login endpoint
Write-Host "Testing login endpoint..." -ForegroundColor Yellow
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'
Write-Host ""

# 3. Check if port 5000 is listening
Write-Host "Checking port 5000..." -ForegroundColor Yellow
netstat -ano | findstr :5000
```

## What Information Do I Need?

If login still doesn't work, please provide:

1. **Backend terminal output** when you try to login
2. **Browser console errors** (screenshot or copy text)
3. **Network tab details**:
   - Request URL
   - Status code  
   - Response body
4. **Result of health check**: `curl http://localhost:5000/health`
5. **Result of login test**: `curl -X POST http://localhost:5000/api/v1/auth/login ...`

## Expected Working Flow

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ User enters email and password
4. ✅ Frontend sends POST to `http://localhost:5000/api/v1/auth/login`
5. ✅ Backend validates and returns tokens
6. ✅ Frontend stores tokens and redirects to dashboard

**If any step fails, check the error and follow the troubleshooting steps.**

