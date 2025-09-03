# CORS ISSUE RESOLUTION

This document describes how the CORS (Cross-Origin Resource Sharing) issue was resolved in the DT Tenders application.

## The Issue

The application was experiencing CORS errors when making requests from the frontend (running on port 3000) to the backend API:

```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## The Solution

Two key issues were identified and fixed:

1. **Incorrect API URL**: The frontend was attempting to connect to port 5000, but the server was running on port 5001.
   - Fixed by updating the API_BASE_URL in `client/src/services/api.ts`

2. **CORS Configuration**: The CORS middleware was not properly configured.
   - Fixed by:
     - Moving the CORS middleware before the Helmet middleware in `server/index.js`
     - Expanding the CORS configuration to explicitly allow necessary methods and headers
     - Configuring Helmet with `crossOriginResourcePolicy: { policy: "cross-origin" }`

## The Fixed Code

### Frontend API Configuration

```javascript
// client/src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### Backend CORS Configuration

```javascript
// server/index.js

// CORS configuration - Place it before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware with CORS-friendly configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

## Testing

After implementing these changes, the application should be able to successfully make API requests from the frontend to the backend without CORS errors.
