const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
require('dotenv').config();

async function fixProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the project user to reassign projects
    const projectUser = await User.findOne({ username: 'project' });
    if (!projectUser) {
      console.log('Project user not found');
      process.exit(1);
    }
    
    console.log('Found project user:', projectUser.username, projectUser._id);
    
    // Update all projects to have valid user references
    const result = await Project.updateMany(
      {},
      { 
        createdBy: projectUser._id,
        lastModifiedBy: projectUser._id 
      }
    );
    
    console.log('Updated', result.modifiedCount, 'projects');
    
    // Verify the fix
    const projects = await Project.find({}).populate('createdBy');
    console.log('\nVerification:');
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1}: ${project.nameOfAwardedTender}`);
      console.log('  CreatedBy:', project.createdBy ? project.createdBy.username : 'null');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixProjects();
