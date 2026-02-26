import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        isGroup: { type: Boolean, default: false },
        title: { type: String, trim: true },
        lastMessageAt: { type: Date, default: Date.now },
        lastMessage: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
