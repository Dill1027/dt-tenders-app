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

    // Check if roles is an array or a single role string
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roleArray,
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
    
    // Helper function to send access denied response
    const denyAccess = (message) => {
      return res.status(403).json({ 
        message: message || 'Access denied. You do not have permission to edit this section.' 
      });
    };
    
    // Check for invalid section early
    if (!['part1', 'part2', 'part3', 'invoice_payment'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section specified.' });
    }
    
    // First check if user has explicit permissions
    if (user.permissions) {
      const permissionMap = {
        'part1': user.permissions.canEditPart1,
        'part2': user.permissions.canEditPart2,
        'part3': user.permissions.canEditPart3,
        'invoice_payment': user.permissions.canEditInvoicePayment
      };
      
      if (!permissionMap[section]) {
        return denyAccess();
      }
      
      // If they have permission, proceed
      return next();
    }
    
    // Fallback to role-based permissions if specific permissions not set
    const userRole = user.role;
    const isAdmin = userRole === 'admin';
    const isProjectTeam = userRole === 'project_team';
    const isFinanceTeam = userRole === 'finance_team';
    
    // Define access rules for each section
    const accessRules = {
      'part1': isAdmin || isProjectTeam,
      'part2': isAdmin || isFinanceTeam,
      'part3': isAdmin || isProjectTeam,
      'invoice_payment': isAdmin || isProjectTeam || isFinanceTeam
    };
    
    // Check if user has access
    if (!accessRules[section]) {
      // Custom error messages based on section
      const errorMessages = {
        'part1': 'Access denied. Only Project Team can edit this section.',
        'part2': 'Access denied. Only Finance Team can edit this section.',
        'part3': 'Access denied. Only Project Team can edit this section.',
        'invoice_payment': 'Access denied. Only Project Team and Finance Team can edit this section.'
      };
      
      return denyAccess(errorMessages[section]);
    }
    
    next();
  };
};

module.exports = {
  auth,
  authorize,
  canEditProject
};
