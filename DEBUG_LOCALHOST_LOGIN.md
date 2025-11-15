# 🔍 Debug Localhost Login Issue

## Step 1: Check Browser Console

1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Try to login**
4. **Look for errors** - copy any error messages

## Step 2: Check Network Tab

1. **Open Network tab** (F12 → Network)
2. **Try to login**
3. **Find the login request** (should be `POST /api/v1/auth/login`)
4. **Click on it** to see details:
   - **Request URL**: Should be `http://localhost:5000/api/v1/auth/login`
   - **Request Method**: Should be `POST`
   - **Status Code**: What is it? (200, 400, 401, 403, 500?)
   - **Request Headers**: Check if `Content-Type: application/json` is present
   - **Request Payload**: Should show `{"email":"...","password":"..."}`
   - **Response**: What does it say?

## Step 3: Test Backend Directly

**Open a new terminal and test the backend:**

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login endpoint directly
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

**Expected responses:**
- Health: `{"status":"OK",...}`
- Login: Either success response or error message (not "CSRF token missing" - login is exempt)

## Step 4: Check Backend is Running

**Verify backend is running on port 5000:**

```bash
# On Windows PowerShell
netstat -ano | findstr :5000

# Should show Node.js process listening on port 5000
```

**Or check backend terminal:**
- Is the backend server running?
- Any error messages in the backend console?

## Step 5: Check Frontend API Configuration

**Open browser console and check:**

```javascript
// In browser console (F12), run:
console.log('API Base URL:', process.env.REACT_APP_API_URL);
```

**Expected for localhost:**
- Should be `undefined` (auto-detects to `http://localhost:5000`)
- Or if set: `http://localhost:5000`

**Check the actual API call:**
```javascript
// In browser console, check what URL is being used
// Look at Network tab - the request URL should be:
// http://localhost:5000/api/v1/auth/login
```

## Step 6: Check CORS Configuration

**Backend `.env` should have:**
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**If CORS error appears:**
- Check backend `.env` file
- Restart backend after changing `.env`

## Step 7: Check User Credentials

**Do you have a user account?**

1. **Check if you registered a user:**
   - Try registering first: `http://localhost:3000/register`
   - Or check database for existing users

2. **Verify credentials:**
   - Email format: `user@example.com`
   - Password: Check if it meets requirements

## Step 8: Check Backend Logs

**Look at backend terminal output when you try to login:**

- Any error messages?
- Any warnings?
- What status code is returned?

## Common Issues & Solutions

### Issue 1: "CSRF token missing" Error

**If you see this in browser console:**
- This shouldn't happen for login (login is exempt from CSRF)
- Check if the request is going to the right endpoint: `/api/v1/auth/login`
- Check backend middleware order

**Solution:**
- Login endpoint should be exempt (it is in the code)
- If still happening, check backend logs

### Issue 2: "Network Error" or "Connection Refused"

**Cause**: Backend not running or wrong port

**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# If not running, start it:
cd backend
npm run dev
# or
node server.js
```

### Issue 3: "CORS Error"

**Cause**: Backend CORS not configured for localhost:3000

**Solution:**
```env
# In backend .env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

Then restart backend.

### Issue 4: "Invalid email or password"

**Cause**: Wrong credentials or user doesn't exist

**Solution:**
1. Register a new user first
2. Or check database for existing users
3. Verify email and password are correct

### Issue 5: "Account is locked"

**Cause**: Too many failed login attempts

**Solution:**
- Wait 15-30 minutes
- Or reset login attempts in database
- Or create a new account

### Issue 6: "Account is deactivated"

**Cause**: User account is inactive

**Solution:**
- Check database: `isActive` should be `true`
- Or contact admin to activate account

## Quick Test Script

**Run this in browser console (F12) to test API:**

```javascript
// Test API connection
fetch('http://localhost:5000/api/v1/health')
  .then(r => r.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Health check failed:', err));

// Test login endpoint
fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  })
})
  .then(r => r.json())
  .then(data => console.log('Login response:', data))
  .catch(err => console.error('Login failed:', err));
```

## What to Report

If login still doesn't work, provide:

1. **Browser console errors** (screenshot or copy text)
2. **Network tab details**:
   - Request URL
   - Status code
   - Response body
3. **Backend terminal output** (any errors or warnings)
4. **Result of health check**: `curl http://localhost:5000/health`
5. **Result of direct login test**: `curl -X POST http://localhost:5000/api/v1/auth/login ...`

## Expected Behavior

**When login works correctly:**
1. User enters email and password
2. Frontend sends POST to `http://localhost:5000/api/v1/auth/login`
3. Backend validates credentials
4. Backend returns: `{"success":true,"data":{"user":{...},"token":"...","refreshToken":"..."}}`
5. Frontend stores token and redirects to dashboard
6. User sees dashboard

**If any step fails, check the error message and follow the troubleshooting steps above.**

