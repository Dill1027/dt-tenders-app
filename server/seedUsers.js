const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const predefinedUsers = [
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
  }
];

async function seedUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_tenders_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create predefined users
    for (const userData of predefinedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username} (${userData.role})`);
    }

    console.log('\n=== USER CREDENTIALS ===');
    console.log('Project Team:');
    console.log('  Username: project');
    console.log('  Password: project@123');
    console.log('  Permission: Can edit Project Team sections only, can view all parts\n');
    
    console.log('Finance Team:');
    console.log('  Username: finance');
    console.log('  Password: finance@321');
    console.log('  Permission: Can edit Finance Team sections only, can view all parts\n');
    
    console.log('View Only (All Users):');
    console.log('  Username: deeptec');
    console.log('  Password: deeptec');
    console.log('  Permission: Can view all parts, cannot edit anything\n');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedUsers();
