# User Roles & Permissions Guide

## User Roles

The DT TENDERS application has the following user roles:

1. **Project Team** (username: project, password: project@123)
   - Primary responsibility for project creation and management
   - Can edit project team sections
   - Can view all parts of projects

2. **Finance Team** (username: finance, password: finance@321)
   - Primary responsibility for financial aspects of projects
   - Can edit finance team sections
   - Can view all parts of projects

3. **View Only User** (username: deeptec, password: deeptec)
   - Can view all parts of projects
   - Cannot edit any sections

4. **Administrator** (username: admin, password: admin@2023)
   - Full access to all parts of the application
   - Can edit all sections
   - Can view all projects

## Permissions Structure

Each user has specific permissions that control what they can do in the application:

```javascript
permissions: {
  canViewAll: true,         // Can view all parts of projects
  canEditPart1: true/false, // Can edit Project Creation section
  canEditPart2: true/false, // Can edit Finance section
  canEditPart3: true/false, // Can edit Project Team section
  canEditInvoicePayment: true/false // Can edit Invoice & Payment section
}
```

### Default Permissions by Role

#### Project Team
- canViewAll: true
- canEditPart1: true
- canEditPart2: false
- canEditPart3: true
- canEditInvoicePayment: true

#### Finance Team
- canViewAll: true
- canEditPart1: false
- canEditPart2: true
- canEditPart3: false
- canEditInvoicePayment: true

#### View Only User
- canViewAll: true
- canEditPart1: false
- canEditPart2: false
- canEditPart3: false
- canEditInvoicePayment: false

#### Administrator
- canViewAll: true
- canEditPart1: true
- canEditPart2: true
- canEditPart3: true
- canEditInvoicePayment: true

## Project Sections

The application divides projects into the following sections:

1. **Part 1: Project Creation**
   - Managed primarily by Project Team
   - Contains basic project information, tender details, and site information

2. **Part 2: Finance Section**
   - Managed primarily by Finance Team
   - Contains financial planning, purchasing notes, and budget information

3. **Part 3: Project Team Section**
   - Managed primarily by Project Team
   - Contains team assignments, timeline, and site installation notes

4. **Invoice & Payment**
   - Can be managed by both Project Team and Finance Team
   - Contains invoicing details and payment tracking

## Customizing Permissions

If you need to customize permissions beyond the default role-based settings, you can modify the `permissions` object for individual users in the database.

## Login Information

To log in to the application, use one of the following credential sets:

- **Project Team**
  - Username: project
  - Password: project@123

- **Finance Team**
  - Username: finance
  - Password: finance@321

- **View Only**
  - Username: deeptec
  - Password: deeptec

- **Administrator**
  - Username: admin
  - Password: admin@2023
