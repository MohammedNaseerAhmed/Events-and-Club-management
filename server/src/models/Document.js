import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
        title: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String },
        fileName: { type: String },
        fileSize: { type: Number },
        visibility: { type: String, enum: ['public', 'members-only'], default: 'public' },
    },
    { timestamps: true }
);

documentSchema.index({ orgId: 1 });
documentSchema.index({ eventId: 1 });

export default mongoose.model('Document', documentSchema);
