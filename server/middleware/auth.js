const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dt_tenders_secret_key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Project editing permissions middleware
const canEditProject = (section) => {
  return (req, res, next) => {
    const user = req.user;
    
    // First check if user has explicit permissions
    if (user.permissions) {
      switch (section) {
        case 'part1':
          if (!user.permissions.canEditPart1) {
            return res.status(403).json({ 
              message: 'Access denied. You do not have permission to edit this section.' 
            });
          }
          break;
        case 'part2':
          if (!user.permissions.canEditPart2) {
            return res.status(403).json({ 
              message: 'Access denied. You do not have permission to edit this section.' 
            });
          }
          break;
        case 'part3':
          if (!user.permissions.canEditPart3) {
            return res.status(403).json({ 
              message: 'Access denied. You do not have permission to edit this section.' 
            });
          }
          break;
        case 'invoice_payment':
          if (!user.permissions.canEditInvoicePayment) {
            return res.status(403).json({ 
              message: 'Access denied. You do not have permission to edit this section.' 
            });
          }
          break;
        default:
          return res.status(400).json({ message: 'Invalid section specified.' });
      }
      
      next();
      return;
    }
    
    // Fallback to role-based permissions if specific permissions not set
    const userRole = user.role;
    
    switch (section) {
      case 'part1':
        // Only project team can create/edit part 1 (project creation)
        if (userRole !== 'project_team' && userRole !== 'admin') {
          return res.status(403).json({ 
            message: 'Access denied. Only Project Team can edit this section.' 
          });
        }
        break;
      case 'part2':
        // Only finance team can edit part 2
        if (userRole !== 'finance_team' && userRole !== 'admin') {
          return res.status(403).json({ 
            message: 'Access denied. Only Finance Team can edit this section.' 
          });
        }
        break;
      case 'part3':
        // Only project team can edit part 3
        if (userRole !== 'project_team' && userRole !== 'admin') {
          return res.status(403).json({ 
            message: 'Access denied. Only Project Team can edit this section.' 
          });
        }
        break;
      case 'invoice_payment':
        // Both project team and finance team can edit invoice & payment
        if (userRole !== 'finance_team' && userRole !== 'project_team' && userRole !== 'admin') {
          return res.status(403).json({ 
            message: 'Access denied. Only Project Team and Finance Team can edit this section.' 
          });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid section specified.' });
    }
    
    next();
  };
};

module.exports = {
  auth,
  authorize,
  canEditProject
};
