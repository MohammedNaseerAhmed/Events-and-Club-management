import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'clubHead', 'admin'], default: 'student', index: true },
    profilePicUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    headline: { type: String, default: '', maxlength: 200 },
    followingOrgs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    organizationsOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisible: { type: Boolean, default: true },
      activityVisible: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
