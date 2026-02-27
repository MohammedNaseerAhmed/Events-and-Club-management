import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'event_approved',
        'event_rejected',
        'event_registration',
        'event_update',
        'message',
        'invite',
        'invite_accepted',
        'connection',
        'approval',
        'system',
        'announcement',
        'new_post',
      ],
      required: true,
    },
    title: { type: String },
    message: { type: String },
    body: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
