import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'workshop', 'organization'],
      required: true,
    },
    members: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    achievements: [{ type: String }],
    contact: { type: String },
    instagram: { type: String },
    icon: { type: String },
    gradient: { type: String },
  },
  { timestamps: true }
);

// Compound index to optimize search by name
clubSchema.index({ name: 1 });

export default mongoose.model('Club', clubSchema);
