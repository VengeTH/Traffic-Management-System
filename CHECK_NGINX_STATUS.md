# 🔍 Check Nginx Status and Network

## Run These Commands on Your Server

```bash
# 1. Check if Nginx config exists
ls -la /etc/nginx/sites-available/ | grep traffic

# 2. Check if it's enabled
ls -la /etc/nginx/sites-enabled/ | grep traffic

# 3. Check what Nginx sites are currently enabled
ls -la /etc/nginx/sites-enabled/

# 4. Check Nginx is listening on port 80
sudo ss -tulpn | grep :80

# 5. Check firewall allows port 80
sudo ufw status | grep -E "80|HTTP"

# 6. Test Nginx from server
curl -I http://localhost/

# 7. Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log
```

## If Nginx Config Doesn't Exist

Create it:

```bash
sudo nano /etc/nginx/sites-available/traffic-api
```

Paste:

```nginx
server {
    listen 80;
    server_name 112.207.191.27 _;

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Then:
```bash
sudo ln -s /etc/nginx/sites-available/traffic-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Check Network Access

Since Windows can't connect, test from an online tool:
- Visit: https://www.yougetsignal.com/tools/open-ports/
- IP: `112.207.191.27`
- Port: `80`
- Click "Check"

This will tell you if port 80 is accessible from the internet.

