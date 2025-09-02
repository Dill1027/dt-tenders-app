# DT TENDERS - Project Management System

A comprehensive MERN stack web application for managing tenders and project workflows with role-based permissions.

## Features

### User Management & Authentication
- **User Registration & Login** with JWT authentication
- **Role-based Access Control** with three user types:
  - **Project Team**: Can edit Project Team sections and view all parts
  - **Finance Team**: Can edit Finance sections and view all parts  
  - **General Users**: Can view all parts but cannot edit anything

### Project Workflow Management

#### Part 1 - Project Creation (All Users)
- Name of Awarded Tender (Required)
- Performance Bond Submission (Yes/No/N/A)
- Agreement Signed (Yes/No/N/A)
- Site Details (Required)
- Create Project in Dislio (Yes/No) (Required)
- Note for Finance Team (Optional)

#### Part 2 - Finance Section (Finance Team Only)
- Check with Store Manager (Yes/No)
- Ready or Not (Checkbox)
- Purchasing Note (Text field)
- Note for Finance Team (Optional)

#### Part 3 - Project Team Section (Project Team Only)
- Select Team (Company/Subcontractor)
- Structure Panel (Text field)
- Timeline (Text field)
- Site Installation Note (Text field)
- Note for Finance Team (Optional)

#### Invoice & Payment (Project & Finance Teams Only)
- Invoice Create (Done/Not Yet)
- Payment Status (Done/Half/None/80%/20%)

### Dashboard Features
- **Project Overview** with status badges and completion tracking
- **Search & Filter** by tender name, site details, and status
- **Pagination** for large datasets
- **Role-based Action Buttons** showing only permitted actions
- **Project Statistics** and progress indicators

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** enabled for cross-origin requests
- **Rate limiting** and security headers

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for navigation
- **React Bootstrap** for UI components
- **React Hook Form** for form management
- **React Toastify** for notifications
- **Axios** for API communication
- **Context API** for state management

## Project Structure

```
dt-tenders/
├── server/                 # Backend Node.js application
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & validation middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── client/                # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context providers
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main application component
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

### Environment Configuration

#### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_tenders_app
JWT_SECRET=dt_tenders_secret_key_change_in_production
CLIENT_URL=http://localhost:3000
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=DT TENDERS
REACT_APP_VERSION=1.0.0
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dt-tenders
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Projects
- `GET /api/projects` - Get all projects (with pagination/search)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (Part 1)
- `PUT /api/projects/:id/part2` - Update Part 2 (Finance Section)
- `PUT /api/projects/:id/part3` - Update Part 3 (Project Team Section)
- `PUT /api/projects/:id/invoice-payment` - Update Invoice & Payment
- `DELETE /api/projects/:id` - Delete project

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/stats/overview` - Get user statistics

## User Roles & Permissions

| Section | Project Team | Finance Team | General Users |
|---------|-------------|-------------|---------------|
| Part 1 - Project Creation | ✅ Edit | ✅ View | ✅ View |
| Part 2 - Finance Section | ✅ View | ✅ Edit | ✅ View |
| Part 3 - Project Team Section | ✅ Edit | ✅ View | ✅ View |
| Invoice & Payment | ✅ Edit | ✅ Edit | ✅ View (Read-only) |

## Development Guidelines

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent error handling
- Input validation on both client and server
- Responsive design with Bootstrap

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input sanitization and validation
- Protected routes with role-based access

### Performance
- Database indexing for optimized queries
- Pagination for large datasets
- Efficient state management
- Optimized build for production

## Deployment

### Production Build
```bash
# Build client for production
cd client
npm run build

# Start server in production mode
cd ../server
NODE_ENV=production npm start
```

### Environment Variables (Production)
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure proper `MONGODB_URI`
- Set appropriate `CLIENT_URL`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.

---

**DT TENDERS** - Streamlining tender management and project workflows with modern web technologies.
