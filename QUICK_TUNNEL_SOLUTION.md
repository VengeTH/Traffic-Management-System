# 🚀 Quick Tunnel Solution (No Router Access Needed)

## Problem
You're remote and can't access your router to set up port forwarding. Server at `112.207.191.27` is not accessible from the internet.

## Solution: Use ngrok (Easiest)

### Step 1: Install ngrok on Ubuntu Server

```bash
# Download ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### Step 2: Get Free ngrok Account

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (free)
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Configure ngrok

**On your Ubuntu server:**

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Start Tunnel

**On your Ubuntu server:**

```bash
ngrok http 5000
```

**This will give you output like:**
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)**

### Step 5: Update Frontend

**On your Windows machine:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://abc123.ngrok-free.app"
npm run build
cd ..
npm run deploy
```

### Step 6: Keep ngrok Running

**To keep ngrok running in background on Ubuntu server:**

```bash
# Install screen or tmux
sudo apt install screen

# Start ngrok in screen
screen -S ngrok
ngrok http 5000

# Press Ctrl+A then D to detach
# To reattach: screen -r ngrok
```

**Or use systemd service (better):**

```bash
sudo nano /etc/systemd/system/ngrok.service
```

**Add:**
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
```

## Note About ngrok Free Tier

- **Free tier:** URL changes every time you restart (not good for production)
- **Paid tier:** Fixed domain (better for production)
- **Alternative:** Use Cloudflare Tunnel (free, fixed domain)

## For Production: Use Cloudflare Tunnel

See `SETUP_CLOUDFLARE_TUNNEL.md` for a more permanent solution.

