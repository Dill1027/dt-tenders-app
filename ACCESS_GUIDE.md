# Accessing the DT TENDERS Application

## Simplified Access Guide

The DT TENDERS application has been deployed to Vercel and is now accessible without any Vercel-specific authentication. Here's how to access and use the application:

### Direct Access URLs

- **Frontend Application:** [https://frontend-pi-wine-91.vercel.app](https://frontend-pi-wine-91.vercel.app)
- **Backend API:** [https://backend-rho-ten-64.vercel.app](https://backend-rho-ten-64.vercel.app)

Simply open the frontend URL in your browser to access the application.

### Application Authentication

While no Vercel authentication is required to access the application, you will still need to log in using the application's built-in authentication system:

1. Navigate to the frontend URL
2. You'll be presented with the login screen
3. Enter your username and password
4. After successful authentication, you'll have access to the application features based on your role

### Sharing with Users

To share access to the application with others:

1. Simply provide them with the frontend URL
2. They will be directed to the login page
3. If they don't have an account, they can register for one (if registration is enabled)
4. Once registered/logged in, they can use the application according to their assigned permissions

### API Access

If you need direct access to the API:

- The API is accessible at `https://backend-8e8si7hdk-dill1027s-projects.vercel.app/api/`
- All API endpoints require authentication via JWT (except for login/registration)
- To use the API, include the JWT token in the Authorization header: `Authorization: Bearer <token>`

## Custom Domain (Future Enhancement)

In the future, we may set up a custom domain for easier access. When that happens, this document will be updated with the new URLs.
