import mongoose from 'mongoose';

const clubAdminSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['club_admin'],
    default: 'club_admin'
  },
  
  // Club association
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  
  // Admin specific information
  adminId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Contact information
  phone: {
    type: String,
    trim: true
  },
  
  // Status and permissions
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Permissions (what this club admin can do)
  permissions: {
    manageEvents: {
      type: Boolean,
      default: true
    },
    manageClubDetails: {
      type: Boolean,
      default: true
    },
    recruitUsers: {
      type: Boolean,
      default: true
    },
    viewAnalytics: {
      type: Boolean,
      default: true
    }
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  
  // Profile information
  profile: {
    avatar: String,
    bio: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
clubAdminSchema.index({ email: 1 });
clubAdminSchema.index({ clubId: 1 });
clubAdminSchema.index({ adminId: 1 });
clubAdminSchema.index({ role: 1 });

// Virtual for full name
clubAdminSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if admin can perform action
clubAdminSchema.methods.canPerform = function(action) {
  return this.permissions[action] === true && this.isActive;
};

// Method to get club information
clubAdminSchema.methods.getClub = async function() {
  await this.populate('clubId');
  return this.clubId;
};

// Pre-save middleware to generate adminId
clubAdminSchema.pre('save', function(next) {
  if (this.isNew && !this.adminId) {
    // Generate unique admin ID (e.g., CA001, CA002, etc.)
    this.adminId = `CA${Date.now().toString().slice(-6)}`;
  }
  next();
});

// Static method to find by club
clubAdminSchema.statics.findByClub = function(clubId) {
  return this.find({ clubId, isActive: true });
};

// Static method to find active admins
clubAdminSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Transform JSON output
clubAdminSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('ClubAdmin', clubAdminSchema);
