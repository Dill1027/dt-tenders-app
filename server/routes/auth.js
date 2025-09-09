const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Remove the register route - only login is allowed

// Login user
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Check if user exists and is active (search by username instead of email)
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dt_tenders_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET || 'dt_tenders_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available credentials (for development/testing)
router.get('/credentials', (req, res) => {
  res.json({
    message: 'Available login credentials',
    credentials: [
      {
        role: 'Project Team',
        username: 'project',
        password: 'project@123',
        permissions: 'Can edit Project Team sections only, can view all parts'
      },
      {
        role: 'Finance Team',
        username: 'finance',
        password: 'finance@321',
        permissions: 'Can edit Finance Team sections only, can view all parts'
      },
      {
        role: 'View Only (All Users)',
        username: 'deeptec',
        password: 'deeptec',
        permissions: 'Can view all parts, cannot edit anything'
      }
    ]
  });
});

// Change password endpoint
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get the user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Server error during password change',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('username').notEmpty().withMessage('Username is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username } = req.body;

    // Find the user
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      // For security reasons, don't reveal if the user exists or not
      return res.json({ message: 'If your account exists, a password reset code has been sent' });
    }

    // Generate a random reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the reset code
    const salt = await bcrypt.genSalt(10);
    const hashedResetCode = await bcrypt.hash(resetCode, salt);
    
    // Store the hashed code and expiration time on the user record
    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, you would send this code via email or SMS
    // For this demo, we'll just return it in the response
    if (process.env.NODE_ENV === 'development') {
      res.json({ 
        message: 'If your account exists, a password reset code has been sent',
        resetCode: resetCode // Only for development!
      });
    } else {
      res.json({ message: 'If your account exists, a password reset code has been sent' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// Reset password with code
router.post('/reset-password', [
  body('username').notEmpty().withMessage('Username is required'),
  body('resetCode').notEmpty().withMessage('Reset code is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, resetCode, newPassword } = req.body;

    // Find the user
    const user = await User.findOne({ 
      username, 
      isActive: true,
      passwordResetExpires: { $gt: Date.now() } 
    });

    if (!user || !user.passwordResetCode) {
      return res.status(400).json({ message: 'Password reset code is invalid or has expired' });
    }

    // Verify the reset code
    const isMatch = await bcrypt.compare(resetCode, user.passwordResetCode);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
