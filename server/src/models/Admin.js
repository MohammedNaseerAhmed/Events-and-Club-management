import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin', index: true },
    avatarUrl: { type: String },
    phone: { type: String },
    permissions: [{ type: String }], // Optional: list of permissions or roles for fine-grained control
  },
  { timestamps: true }
);

adminSchema.index({ email: 1 });

export default mongoose.model('Admin', adminSchema);
