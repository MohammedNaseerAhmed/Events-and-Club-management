import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        status: {
            type: String,
            enum: ['registered', 'cancelled', 'attended'],
            default: 'registered',
        },
        registeredAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
