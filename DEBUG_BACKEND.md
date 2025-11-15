# 🔍 Debugging Backend Connection Issues

## Issue Detected:
- Port 5000 is not listening
- `curl http://localhost:5000/health` hangs (connection timeout)

## Step 1: Check What Ports Node.js is Using

```bash
# Check all ports Node.js is listening on
sudo ss -tulpn | grep node

# Or check all listening ports
sudo ss -tulpn | grep LISTEN
```

## Step 2: Check if Backend Process is Actually Running

```bash
# Check nodemon and node processes
ps aux | grep -E "node|nodemon"

# Check the actual process details
ps aux | grep 348840
```

## Step 3: Check Backend Logs

```bash
# Navigate to your backend directory
cd ~/Traffic-Management-System

# Check if there are log files
ls -la logs/

# View recent logs
tail -f logs/combined.log
# or
tail -f logs/error.log
```

## Step 4: Check Server Configuration

```bash
# Check your .env file
cat .env | grep PORT

# Check server.js to see how it's configured
grep -n "app.listen\|PORT" server.js
```

## Step 5: Check if Server is Listening on Correct Interface

The server might be listening only on `127.0.0.1` (localhost) instead of `0.0.0.0` (all interfaces).

**Check server.js:**
```bash
grep -A 5 "app.listen" server.js
```

**The server should listen on `0.0.0.0` to accept external connections:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

## Step 6: Try Starting Backend Manually

```bash
# Navigate to backend directory
cd ~/Traffic-Management-System

# Stop any running processes first
# Find and kill the nodemon process
pkill -f nodemon

# Start backend manually to see errors
npm start
# or
node server.js
```

Watch for any error messages in the output.

## Step 7: Check Database Connection

The backend might be hanging because it can't connect to the database:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or check if database connection is the issue
# Look for database errors in logs
grep -i "database\|sequelize\|postgres" logs/error.log
```

## Step 8: Test with a Simple Server

To verify the port works, test with a simple Node.js server:

```bash
# Create a test file
cat > /tmp/test-server.js << 'EOF'
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({message: 'Test server works'}));
});
server.listen(5000, '0.0.0.0', () => {
  console.log('Test server listening on port 5000');
});
EOF

# Run test server
node /tmp/test-server.js

# In another terminal, test it:
curl http://localhost:5000

# If this works, the port is fine - the issue is with your backend
```

## Common Issues & Solutions

### Issue 1: Server Not Listening on 0.0.0.0

**Solution**: Update `server.js` to listen on all interfaces:

```javascript
// Change from:
app.listen(PORT, () => {

// To:
app.listen(PORT, '0.0.0.0', () => {
```

### Issue 2: Database Connection Hanging

**Solution**: 
- Check database is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Test database connection separately

### Issue 3: Port Already in Use

**Solution**:
```bash
# Find what's using port 5000
sudo lsof -i :5000
# or
sudo fuser 5000/tcp

# Kill the process if needed
sudo kill -9 <PID>
```

### Issue 4: Firewall Blocking

**Solution**:
```bash
# Check firewall
sudo ufw status

# Allow port 5000
sudo ufw allow 5000/tcp
```

## Quick Diagnostic Commands

Run these and share the output:

```bash
# 1. Check all Node.js processes
ps aux | grep node

# 2. Check all listening ports
sudo ss -tulpn | grep LISTEN

# 3. Check backend directory
cd ~/Traffic-Management-System && pwd && ls -la

# 4. Check .env for PORT
cat .env | grep PORT

# 5. Check server.js listen configuration
grep -A 3 "app.listen" server.js

# 6. Check recent logs
tail -20 logs/combined.log 2>/dev/null || echo "No logs found"
```

