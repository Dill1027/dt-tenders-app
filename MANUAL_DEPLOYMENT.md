# Manual Deployment Guide for DT TENDERS

This guide provides step-by-step instructions for manually deploying the DT TENDERS application to Vercel.

## Backend Deployment

1. **Navigate to the server directory**:

   ```bash
   cd /path/to/dt-tenders-app/server
   ```

2. **Deploy to Vercel**:

   ```bash
   vercel --prod
   ```
   
   During the deployment process, you'll be asked a few questions:
   - Set up and deploy? Answer `yes`
   - Which scope? Select your personal account or organization
   - Link to existing project? If you've deployed before, select `yes` and choose the project, otherwise `no`
   - What's your project name? Enter `backend` or your preferred name
   - In which directory is your code located? Enter `./` (current directory)

3. **Get the deployment URL**:
   After deployment completes, note the URL that looks like:

   ```text
   https://backend-xxxxxx.vercel.app
   ```
   
   This is your backend API URL which you'll need when deploying the frontend.

4. **Set up a custom domain alias** (optional):

   ```bash
   vercel alias set your-deployment-url.vercel.app your-custom-name.vercel.app
   ```
   
   For example:

   ```bash
   vercel alias set backend-1kksv9yxc-dill1027s-projects.vercel.app backend-rho-ten-64.vercel.app
   ```

5. **Disable Protection in Vercel Dashboard**:
   - Go to the [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your backend project
   - Go to Settings → Security
   - In the 'Authentication' section, toggle off 'Protection'
   - Save the changes

## Frontend Deployment

1. **Navigate to the client directory**:

   ```bash
   cd /path/to/dt-tenders-app/client
   ```

2. **Deploy to Vercel with environment variables**:

   ```bash
   vercel --prod --build-env REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```

   For example:

   ```bash
   vercel --prod --build-env REACT_APP_API_URL=https://backend-rho-ten-64.vercel.app/api
   ```
   
   Answer the setup questions similar to the backend deployment.

3. **Get the deployment URL**:
   After deployment completes, note the URL that looks like:

   ```text
   https://frontend-xxxxxx.vercel.app
   ```

4. **Set up a custom domain alias** (optional):

   ```bash
   vercel alias set your-frontend-url.vercel.app your-custom-frontend-name.vercel.app
   ```
   
   For example:

   ```bash
   vercel alias set frontend-r74p6ly5p-dill1027s-projects.vercel.app frontend-pi-wine-91.vercel.app
   ```## Update CORS Configuration (If Needed)

If you're experiencing CORS issues:

1. Update the `allowedOrigins` array in `server/index.js` to include your frontend URL
2. Commit and push the changes
3. Redeploy the backend:

   ```bash
   cd /path/to/dt-tenders-app/server
   vercel --prod
   ```

## Verify Deployment

1. Visit your frontend URL in a browser
2. Try to log in to the application
3. If you encounter any issues, check the browser console for error messages

## Current Deployment URLs

- **Frontend**: [https://frontend-pi-wine-91.vercel.app](https://frontend-pi-wine-91.vercel.app)
- **Backend**: [https://backend-rho-ten-64.vercel.app](https://backend-rho-ten-64.vercel.app)

## Troubleshooting

### Common Issues

1. **Authentication Error on Backend**:
   - Make sure you've disabled Protection in the Vercel dashboard

2. **API Connection Issues**:
   - Verify the REACT_APP_API_URL is set correctly
   - Check that the backend URL is accessible
   - Ensure CORS is properly configured

3. **Missing Static Assets**:
   - Check that the deployment configuration file in the client directory has the correct routes configuration

4. **Deployment Failed**:
   - Check the build logs in the Vercel dashboard
   - Ensure all dependencies are correctly listed in package.json
