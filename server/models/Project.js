const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Part 1 - Project Creation
  nameOfAwardedTender: {
    type: String,
    required: true,
    trim: true
  },
  performanceBondSubmission: {
    type: String,
    enum: ['Yes', 'No', 'N/A'],
    default: 'N/A'
  },
  agreementSigned: {
    type: String,
    enum: ['Yes', 'No', 'N/A'],
    default: 'N/A'
  },
  siteDetails: {
    type: String,
    required: true,
    trim: true
  },
  createProjectInDislio: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  noteForFinanceTeam_part1: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Part 2 - Finance Section
  checkWithStoreManager: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  readyOrNot: {
    type: Boolean,
    default: false
  },
  purchasingNote: {
    type: String,
    trim: true,
    default: ''
  },
  noteForFinanceTeam_part2: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Part 3 - Project Team Section
  selectTeam: {
    type: String,
    enum: ['Company', 'Subcontractor'],
    default: 'Company'
  },
  structurePanel: {
    type: String,
    trim: true,
    default: ''
  },
  timeline: {
    type: String,
    trim: true,
    default: ''
  },
  siteInstallationNote: {
    type: String,
    trim: true,
    default: ''
  },
  noteForFinanceTeam_part3: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Invoice & Payment (Read-Only for most users)
  invoiceCreate: {
    type: String,
    enum: ['Done', 'Not Yet'],
    default: 'Not Yet'
  },
  paymentStatus: {
    type: String,
    enum: ['Done', 'Half', 'None', '80%', '20%'],
    default: 'None'
  },
  
  // Project metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Tracking which parts are completed
  part1Completed: {
    type: Boolean,
    default: false
  },
  part2Completed: {
    type: Boolean,
    default: false
  },
  part3Completed: {
    type: Boolean,
    default: false
  },
  
  // Part completion timestamps
  part1CompletedAt: {
    type: Date
  },
  part2CompletedAt: {
    type: Date
  },
  part3CompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ nameOfAwardedTender: 'text', siteDetails: 'text' });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  if (this.part1Completed) completed++;
  if (this.part2Completed) completed++;
  if (this.part3Completed) completed++;
  return Math.round((completed / 3) * 100);
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
