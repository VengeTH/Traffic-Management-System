# 🚀 Step-by-Step ngrok Setup

## Step 1: Check if ngrok is Installed

**On your Ubuntu server:**

```bash
which ngrok
```

**If it shows a path, ngrok is installed. If not, install it:**

```bash
# Download ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract
tar -xvzf ngrok-v3-stable-linux-amd64.tgz

# Move to system path
sudo mv ngrok /usr/local/bin/

# Verify installation
ngrok version
```

## Step 2: Get ngrok Auth Token

1. **Go to:** https://dashboard.ngrok.com/login (or sign up if you don't have account)
2. **After login, go to:** https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy your authtoken** (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

## Step 3: Configure ngrok

**On your Ubuntu server:**

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Replace `YOUR_AUTH_TOKEN_HERE` with the token from Step 2.**

## Step 4: Start ngrok Tunnel

**On your Ubuntu server (make sure backend is running on port 5000):**

```bash
ngrok http 5000
```

**You'll see output like:**

```
ngrok                                                                            

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`

## Step 5: Keep ngrok Running

**The ngrok window must stay open. To run it in background:**

**Option A: Use screen (recommended)**

```bash
# Install screen if not installed
sudo apt install screen

# Start screen session
screen -S ngrok

# Start ngrok
ngrok http 5000

# Detach: Press Ctrl+A then D
# To reattach later: screen -r ngrok
```

**Option B: Use systemd service (better for production)**

```bash
# Create service file
sudo nano /etc/systemd/system/ngrok.service
```

**Add this:**

```ini
[Unit]
Description=ngrok tunnel
After=network.target

[Service]
Type=simple
User=venge
ExecStart=/usr/local/bin/ngrok http 5000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Then:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable ngrok
sudo systemctl start ngrok

# Check status
sudo systemctl status ngrok

# View logs
sudo journalctl -u ngrok -f
```

## Step 6: Rebuild Frontend with ngrok URL

**On your Windows machine:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://abc123.ngrok-free.app"
npm run build
cd ..
npm run deploy
```

**Replace `abc123.ngrok-free.app` with YOUR actual ngrok URL from Step 4.**

## Step 7: Test Production

**After deploying, try logging in on GitHub Pages. It should work!**

## Important Notes

⚠️ **Free ngrok:**
- URL changes every time you restart ngrok
- Not ideal for production
- Good for testing

✅ **Paid ngrok:**
- Fixed domain (doesn't change)
- Better for production

🔄 **If ngrok URL changes:**
- You need to rebuild frontend with new URL
- Or use paid ngrok for fixed domain

## Troubleshooting

**If ngrok doesn't start:**
```bash
# Check if port 5000 is in use
sudo lsof -i :5000

# Check ngrok logs
ngrok http 5000 --log=stdout
```

**If connection fails:**
- Make sure backend is running: `ps aux | grep node`
- Make sure ngrok is running: `ps aux | grep ngrok`
- Check ngrok web interface: http://127.0.0.1:4040 (on server, use SSH tunnel to access)

