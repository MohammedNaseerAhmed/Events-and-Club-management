import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: String, trim: true },
    whyJoin: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

joinRequestSchema.index({ organizationId: 1, status: 1 });
joinRequestSchema.index({ organizationId: 1, email: 1 });

export default mongoose.model('JoinRequest', joinRequestSchema);
