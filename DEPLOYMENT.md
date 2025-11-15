# 🚀 Deployment Guide

## Frontend Deployment (GitHub Pages)

### Building for Production

When building the frontend for production deployment, you **must** set the `REACT_APP_API_URL` environment variable to point to your production API server.

### Setting the API URL

The frontend automatically detects the environment and uses the appropriate API URL:

1. **Development (localhost)**: Automatically uses `http://localhost:5000`
2. **Production**: Requires `REACT_APP_API_URL` to be set during build

### Build Command with API URL

```bash
# Set the API URL and build
REACT_APP_API_URL=https://your-api-domain.com npm run build

# Or on Windows PowerShell:
$env:REACT_APP_API_URL="https://your-api-domain.com"; npm run build

# Or on Windows CMD:
set REACT_APP_API_URL=https://your-api-domain.com && npm run build
```

### Example: Deploying to GitHub Pages

If your API is hosted at `https://api.example.com`:

```bash
cd frontend
REACT_APP_API_URL=https://api.example.com npm run build
npm run deploy
```

### API URL Detection Logic

The application uses the following priority:

1. **Environment Variable** (`REACT_APP_API_URL`) - Highest priority
2. **Auto-detection**:
   - `localhost` or `127.0.0.1` → `http://localhost:5000`
   - `github.io` domain → Uses relative URL (requires API on same domain or proxy)
   - Other domains → Uses relative URL (same origin)

### Important Notes

- ⚠️ **If your API is on a different domain**, you **MUST** set `REACT_APP_API_URL` during build
- ⚠️ The API URL is embedded in the build at compile time, not runtime
- ⚠️ After building, you cannot change the API URL without rebuilding
- ✅ For same-origin deployments, relative URLs are used automatically

### CORS Configuration

Ensure your backend API has CORS configured to allow requests from your frontend domain:

```javascript
// In your backend server.js or CORS configuration
const corsOrigins = [
  'https://vengeth.github.io',
  'http://localhost:3000'
];
```

### Troubleshooting

#### Issue: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Cause**: The frontend is trying to connect to `localhost:5000` in production.

**Solution**: 
1. Set `REACT_APP_API_URL` during build with your production API URL
2. Rebuild the frontend
3. Redeploy

#### Issue: "CORS error" in production

**Cause**: Backend CORS configuration doesn't include your frontend domain.

**Solution**: Update your backend CORS configuration to include your production frontend URL.

## Backend Deployment

### Environment Variables

Ensure all environment variables are set in your production environment:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
CORS_ORIGIN=https://vengeth.github.io
APP_URL=https://your-api-domain.com
FRONTEND_URL=https://vengeth.github.io/Traffic-Management-System
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT secrets (minimum 32 characters)
- [ ] Configure CORS to allow frontend domain
- [ ] Set `REACT_APP_API_URL` when building frontend
- [ ] Enable HTTPS (set `FORCE_HTTPS=true` if needed)
- [ ] Configure payment gateway credentials
- [ ] Set up email/SMS service credentials
- [ ] Configure proper logging and monitoring

