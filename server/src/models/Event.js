import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    posterUrl: { type: String },
    poster: { type: String }, // New field for uploaded poster filename
    date: { type: Date, required: true, index: true },
    time: { type: String },
    venue: { type: String },
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ClubAdmin', index: true },
  },
  { timestamps: true }
);

// Indexes to speed up queries based on date or text search
eventSchema.index({ date: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);
