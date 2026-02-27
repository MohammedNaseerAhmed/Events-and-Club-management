import mongoose from 'mongoose';

const committeeMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    photoUrl: { type: String },
    contact: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, trim: true },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    shortName: { type: String, trim: true, lowercase: true },
    fullForm: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Professional Chapter', 'Society', 'Club', 'Council', 'Campus Event'],
      required: true,
      index: true,
    },
    description: { type: String, trim: true },
    mission: { type: String, trim: true },
    vision: { type: String, trim: true },
    history: { type: String, trim: true },
    impact: { type: String, trim: true },
    objectives: [{ type: String, trim: true }],
    facultyCoordinator: { type: String, trim: true },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    socialLinks: {
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      youtube: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    committee: [committeeMemberSchema],
    gallery: [galleryImageSchema],
    joinEnabled: { type: Boolean, default: true },
    heads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true, index: true },
    followersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

organizationSchema.index({ name: 1 });
organizationSchema.index({ type: 1, isActive: 1 });

export default mongoose.model('Organization', organizationSchema);
