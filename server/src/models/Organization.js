import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        shortName: { type: String, trim: true, lowercase: true },
        fullForm: { type: String, trim: true },
        type: {
            type: String,
            enum: ['Professional Chapter', 'Club', 'Council', 'Campus Event'],
            required: true,
        },
        description: { type: String, trim: true },
        facultyCoordinator: { type: String, trim: true },
        logoUrl: { type: String },
        heads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true, index: true },
        followersCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

organizationSchema.index({ name: 1 });

export default mongoose.model('Organization', organizationSchema);
