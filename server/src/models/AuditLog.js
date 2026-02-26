import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        targetId: { type: mongoose.Schema.Types.ObjectId },
        targetModel: { type: String },
        meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
