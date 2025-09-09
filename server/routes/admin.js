const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users with credentials for admin
router.get('/users-credentials', [auth, authorize('admin')], async (req, res) => {
  try {
    // Get users with their plaintext passwords
    const users = await User.find({ isActive: true })
      .select('username role plaintextPassword')
      .sort({ username: 1 });
    
    // Get the seed data to get the plaintext passwords for users that haven't changed passwords
    const seedUsers = [
      {
        username: 'project',
        password: 'project@123',
        role: 'project_team'
      },
      {
        username: 'finance',
        password: 'finance@321',
        role: 'finance_team'
      },
      {
        username: 'deeptec',
        password: 'deeptec',
        role: 'all_users'
      },
      {
        username: 'admin',
        password: 'admin@2023',
        role: 'admin'
      }
    ];
    
    // Combine the DB users with the passwords from seed data
    const usersWithCredentials = users.map(user => {
      // If there's a plaintext password stored, use that
      if (user.plaintextPassword) {
        return {
          username: user.username,
          password: user.plaintextPassword,
          role: user.role
        };
      }
      
      // Otherwise try to find from seed data
      const seedUser = seedUsers.find(seed => seed.username === user.username);
      return {
        username: user.username,
        password: seedUser ? seedUser.password : 'Password not available',
        role: user.role
      };
    });

    res.json(usersWithCredentials);
  } catch (error) {
    console.error('Get users credentials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
