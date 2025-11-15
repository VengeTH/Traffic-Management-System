# ✅ Using Your ngrok Domain

## Your ngrok Setup is Correct!

Your command:
```bash
NGROK_AUTH_TOKEN=35WNrWlg1x7KjYRuk713Qg6kIA4_P3612t8ZyciZjdDsSY3S ngrok http --domain=conscientiously-oophoric-elvina.ngrok-free.dev 5000
```

**This is perfect because:**
- ✅ Using fixed domain (won't change)
- ✅ Using environment variable for auth token
- ✅ Pointing to port 5000 (your backend)

## Step 1: Start ngrok

**On your Ubuntu server, run:**

```bash
NGROK_AUTH_TOKEN=35WNrWlg1x7KjYRuk713Qg6kIA4_P3612t8ZyciZjdDsSY3S ngrok http --domain=conscientiously-oophoric-elvina.ngrok-free.dev 5000
```

**Keep this running!** The tunnel must stay active.

## Step 2: Test ngrok URL

**On your Ubuntu server, test if it works:**

```bash
curl https://conscientiously-oophoric-elvina.ngrok-free.dev/health
```

**Should return JSON with status "OK".**

## Step 3: Rebuild Frontend

**On your Windows machine:**

```powershell
cd frontend
$env:REACT_APP_API_URL="https://conscientiously-oophoric-elvina.ngrok-free.dev"
npm run build
cd ..
npm run deploy
```

## Step 4: Keep ngrok Running

**To keep ngrok running in background (so you can close SSH):**

**Option A: Use screen**
```bash
screen -S ngrok
NGROK_AUTH_TOKEN=35WNrWlg1x7KjYRuk713Qg6kIA4_P3612t8ZyciZjdDsSY3S ngrok http --domain=conscientiously-oophoric-elvina.ngrok-free.dev 5000
# Press Ctrl+A then D to detach
```

**Option B: Use systemd service**
```bash
sudo nano /etc/systemd/system/ngrok-traffic-api.service
```

**Add:**
```ini
[Unit]
Description=ngrok tunnel for traffic api
After=network.target

[Service]
Type=simple
User=venge
Environment="NGROK_AUTH_TOKEN=35WNrWlg1x7KjYRuk713Qg6kIA4_P3612t8ZyciZjdDsSY3S"
ExecStart=/usr/local/bin/ngrok http --domain=conscientiously-oophoric-elvina.ngrok-free.dev 5000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Then:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ngrok-traffic-api
sudo systemctl start ngrok-traffic-api
sudo systemctl status ngrok-traffic-api
```

## Your ngrok URL

**Use this URL in frontend rebuild:**
```
https://conscientiously-oophoric-elvina.ngrok-free.dev
```

## Note About Multiple ngrok Instances

**You can run multiple ngrok tunnels simultaneously!** Each one uses a different port or domain. Your current setup won't interfere with other ngrok tunnels you have running.

