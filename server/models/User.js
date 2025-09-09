const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['project_team', 'finance_team', 'all_users', 'admin'],
    required: true
  },
  permissions: {
    canViewAll: {
      type: Boolean,
      default: true
    },
    canEditPart1: {
      type: Boolean,
      default: false
    },
    canEditPart2: {
      type: Boolean,
      default: false
    },
    canEditPart3: {
      type: Boolean,
      default: false
    },
    canEditInvoicePayment: {
      type: Boolean,
      default: false
    }
  },
  passwordResetCode: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  plaintextPassword: {
    type: String,
    select: false // This ensures the field isn't returned in normal queries
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Store the plaintext password for admin access
    this.plaintextPassword = this.password;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
