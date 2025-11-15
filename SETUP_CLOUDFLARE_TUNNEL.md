# 🌐 Setup Cloudflare Tunnel (No Router Access Needed!)

## Why This Works
Cloudflare Tunnel creates a secure connection from your server to Cloudflare, bypassing the need for port forwarding.

## Step 1: Install Cloudflared

**On your Ubuntu server:**

```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

## Step 2: Login to Cloudflare

```bash
cloudflared tunnel login
```

**This will open a browser - you'll need to:**
1. Have access to a browser (can be on your Windows machine)
2. Login to Cloudflare account (free account works)
3. Select your domain (or create one)

## Step 3: Create Tunnel

```bash
cloudflared tunnel create traffic-api
```

## Step 4: Configure Tunnel

```bash
cloudflared tunnel route dns traffic-api api.yourdomain.com
```

**Or if you don't have a domain, use a random subdomain:**

```bash
cloudflared tunnel --url http://localhost:5000
```

**This will give you a URL like:** `https://random-name.trycloudflare.com`

## Step 5: Run Tunnel

**For testing (temporary URL):**
```bash
cloudflared tunnel --url http://localhost:5000
```

**For production (with domain):**
```bash
# Create config file
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**Add:**
```yaml
tunnel: <tunnel-id>
credentials-file: /home/venge/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

**Run as service:**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## Step 6: Update Frontend

**Rebuild frontend with the Cloudflare URL:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://api.yourdomain.com"
# or
$env:REACT_APP_API_URL="https://random-name.trycloudflare.com"
npm run build
cd ..
npm run deploy
```

## Alternative: Use ngrok (Easier, but has limitations)

**On Ubuntu server:**

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Get auth token from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start tunnel
ngrok http 5000
```

**This gives you a URL like:** `https://abc123.ngrok.io`

**Update frontend:**
```powershell
cd frontend
$env:REACT_APP_API_URL="https://abc123.ngrok.io"
npm run build
cd ..
npm run deploy
```

