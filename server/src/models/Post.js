import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
    {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        authorType: { type: String, enum: ['user', 'organization'], default: 'user' },
        content: { type: String, required: true, trim: true, maxlength: 5000 },
        media: [{ url: String, type: { type: String, enum: ['image', 'video', 'document'] } }],
        targetOrgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
        postType: {
            type: String,
            enum: ['post', 'announcement', 'event_share'],
            default: 'post',
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [commentSchema],
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
