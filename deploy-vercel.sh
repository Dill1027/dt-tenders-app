#!/bin/bash

# Vercel deployment script for DT TENDERS app

echo "🚀 Starting deployment process for DT TENDERS app..."

# Step 1: Deploy the server first
echo "📦 Deploying server to Vercel..."
cd server
vercel --prod

# Capture server URL from deployment output
SERVER_URL=$(vercel --prod --confirm | grep -o 'https://.*\.vercel\.app')
echo "🔗 Server deployed to: $SERVER_URL"

# Step 2: Deploy the client with environment variables
echo "📦 Deploying client to Vercel..."
cd ../client
vercel --prod --build-env REACT_APP_API_URL="$SERVER_URL/api"

# Capture client URL from deployment output
CLIENT_URL=$(vercel --prod --confirm | grep -o 'https://.*\.vercel\.app')
echo "🔗 Client deployed to: $CLIENT_URL"

# Step 3: Update CORS in server and redeploy
echo "🔄 Updating server CORS configuration..."
cd ../server

# Find and update CORS configuration
sed -i "" "s|'https://dt-tenders-app.vercel.app'|'$CLIENT_URL'|g" index.js
sed -i "" "s|'https://dt-tenders-app-client.vercel.app'|'$CLIENT_URL'|g" index.js

# Redeploy server with updated CORS
echo "🔁 Redeploying server with updated CORS..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Server URL: $SERVER_URL"
echo "🌐 Client URL: $CLIENT_URL"
echo ""
echo "🔍 Post-deployment checks:"
echo "1. Visit $CLIENT_URL and navigate to different routes"
echo "2. Call $SERVER_URL/api/health to confirm API is working"
echo "3. Test login functionality from the client"
