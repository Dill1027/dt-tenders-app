# Vercel Deployment Guide for DT TENDERS

This guide explains how to deploy the DT TENDERS application (both client and server) to Vercel.

## Prerequisites

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

## Automated Deployment

We've created a script that automates the deployment process:

```bash
./deploy-vercel.sh
```

This script will:

1. Deploy the server to Vercel
2. Get the server's deployment URL
3. Deploy the client with the correct API URL environment variable
4. Update the server's CORS configuration with the client URL
5. Redeploy the server with the updated CORS settings

## Manual Deployment

If you prefer to deploy manually, follow these steps:

### 1. Deploy the Server

```bash
cd server
vercel --prod
```

Take note of the deployment URL (e.g., `https://dt-tenders-app-server.vercel.app`).

### 2. Deploy the Client

```bash
cd client
vercel --prod --build-env REACT_APP_API_URL="https://dt-tenders-app-server.vercel.app/api"
```

Take note of the client deployment URL.

### 3. Update Server CORS and Redeploy

1. Edit `server/index.js` and add your client URL to the `allowedOrigins` array.

2. Redeploy the server:

   ```bash
   cd server
   vercel --prod
   ```

## Post-Deployment Verification

After deployment, verify the following:

1. Visit the client URL and navigate to different routes to ensure routing works correctly
2. Access `https://your-server-url.vercel.app/api/health` to check if the API is running
3. Test login and other API functionality from the client application

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Check the Network tab in your browser's developer tools
2. Verify that the exact client origin is in the server's `allowedOrigins` array
3. Make sure you're using HTTPS for all URLs in production

### Environment Variables

If your API calls aren't working:

1. Verify that `REACT_APP_API_URL` is set correctly in the client's Vercel project settings
2. Check that the URL ends with `/api` (e.g., `https://your-server-url.vercel.app/api`)

### Routing Issues

If deep links aren't working on the client:

1. Ensure `vercel.json` is properly configured in the client directory
2. Verify that all routes include the catch-all route for SPA
