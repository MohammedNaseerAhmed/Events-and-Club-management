import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    venue: { type: String, trim: true },
    capacity: { type: Number },
    registrationCount: { type: Number, default: 0 },
    posterUrl: { type: String },
    attachments: [{ name: String, url: String }],
    visibility: { type: String, enum: ['public', 'members-only'], default: 'public' },
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ startDate: 1 });

export default mongoose.model('Event', eventSchema);
