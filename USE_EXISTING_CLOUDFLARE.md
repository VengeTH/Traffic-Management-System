# 🌐 Use Existing Cloudflare Tunnel

## You Already Have Cloudflare Tunnel!

Since you have an existing certificate, you can either:
1. **Use existing tunnel** (if you have one)
2. **Create a new tunnel** (for this app)
3. **Use ngrok instead** (simpler if you already use it)

## Option 1: Check Existing Tunnels

**On your Ubuntu server:**

```bash
cloudflared tunnel list
```

**This shows all your existing tunnels.**

## Option 2: Create New Tunnel (Recommended)

**You can have multiple tunnels. Create a new one for this app:**

```bash
# Create new tunnel
cloudflared tunnel create traffic-api

# This will give you a tunnel ID
```

**Then configure it:**

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create config file
sudo nano /etc/cloudflared/config.yml
```

**Add this config:**

```yaml
tunnel: <TUNNEL_ID_FROM_ABOVE>
credentials-file: /home/venge/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: traffic-api.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

**Replace:**
- `<TUNNEL_ID>` with the ID from `tunnel create` command
- `traffic-api.yourdomain.com` with your actual domain or subdomain

## Option 3: Quick Test with Existing Tunnel

**If you want to test quickly, you can run a temporary tunnel:**

```bash
# Backup existing cert
mv ~/.cloudflared/cert.pem ~/.cloudflared/cert.pem.backup

# Run temporary tunnel
cloudflared tunnel --url http://localhost:5000
```

**This gives you a temporary URL like:** `https://random-name.trycloudflare.com`

**After testing, restore the cert:**
```bash
mv ~/.cloudflared/cert.pem.backup ~/.cloudflared/cert.pem
```

## Option 4: Use ngrok (If You Prefer)

**Since you already use ngrok, this might be simpler:**

```bash
# Start ngrok tunnel
ngrok http 5000
```

**Copy the HTTPS URL and use it in frontend rebuild.**

## Recommended: Use ngrok for Quick Testing

**Since you already have ngrok, use it:**

```bash
# On Ubuntu server
ngrok http 5000
```

**Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)**

**Then rebuild frontend:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://abc123.ngrok-free.app"
npm run build
cd ..
npm run deploy
```

