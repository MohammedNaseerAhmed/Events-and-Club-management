import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now, index: true },
    type: {
      type: String,
      enum: ['event', 'update', 'reminder'],
      default: 'update',
      index: true,
    },
    link: { type: String },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: true }
);

// Index to sort notifications by most recent
notificationSchema.index({ date: -1 });

export default mongoose.model('Notification', notificationSchema);
