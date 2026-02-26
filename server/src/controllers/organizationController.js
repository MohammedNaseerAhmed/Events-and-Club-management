import Organization from '../models/Organization.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitToUser } from '../utils/notificationEmitter.js';

// GET /api/organizations (public)
export const listPublicOrganizations = async (req, res, next) => {
    try {
        const { type, search } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const orgs = await Organization.find(filter)
            .populate('heads', 'name username profilePicUrl')
            .sort({ name: 1 });
        res.json({ success: true, data: { organizations: orgs } });
    } catch (err) {
        next(err);
    }
};

// GET /api/organizations/:id
export const getOrganization = async (req, res, next) => {
    try {
        const org = await Organization.findById(req.params.id)
            .populate('heads', 'name username profilePicUrl headline');
        if (!org) return res.status(404).json({ success: false, error: { message: 'Organization not found' } });
        res.json({ success: true, data: { organization: org } });
    } catch (err) {
        next(err);
    }
};

// POST /api/clubs/:clubId/events  (Club Head creates event)
export const createEvent = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const org = await Organization.findById(clubId);
        if (!org) return res.status(404).json({ success: false, error: { message: 'Organization not found' } });

        const { title, description, startDate, endDate, venue, capacity, visibility, tags } = req.body;
        if (!title || !startDate) {
            return res.status(400).json({ success: false, error: { message: 'title and startDate are required' } });
        }

        const event = await Event.create({
            title, description, startDate, endDate, venue, capacity,
            visibility: visibility || 'public',
            tags: tags || [],
            clubId,
            createdBy: req.user._id,
            status: 'pending',
        });

        res.status(201).json({ success: true, data: { event, status: 'pending' } });
    } catch (err) {
        next(err);
    }
};

// GET /api/clubs/:clubId/events  (list all events for a club — for club head/admin)
export const listClubEvents = async (req, res, next) => {
    try {
        const { clubId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;
        const filter = { clubId };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [events, total] = await Promise.all([
            Event.find(filter).populate('createdBy', 'name username').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Event.countDocuments(filter),
        ]);
        res.json({ success: true, data: { events, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/events/:eventId  (Club head updates event)
export const updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });

        // Only creator or admin can edit
        if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }

        // Club heads cannot change status to approved
        const allowedFields = ['title', 'description', 'startDate', 'endDate', 'venue', 'capacity', 'visibility', 'tags', 'posterUrl'];
        if (req.user.role !== 'admin') {
            const update = {};
            allowedFields.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
            Object.assign(event, update);
        } else {
            Object.assign(event, req.body);
        }

        if (event.status === 'approved') event.status = 'pending'; // Editing resets to pending if club head
        if (req.user.role !== 'admin' && event.status === 'approved') event.status = 'pending';

        await event.save();
        res.json({ success: true, data: { event } });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/events/:eventId  (Cancel event)
export const cancelEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
        if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        event.status = 'cancelled';
        await event.save();
        res.json({ success: true, data: { event } });
    } catch (err) {
        next(err);
    }
};

// GET /api/events  (Public — only approved)
export const listPublicEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, search = '', clubId, from, to } = req.query;
        const filter = { status: 'approved' };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (clubId) filter.clubId = clubId;
        if (from || to) {
            filter.startDate = {};
            if (from) filter.startDate.$gte = new Date(from);
            if (to) filter.startDate.$lte = new Date(to);
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [events, total] = await Promise.all([
            Event.find(filter).populate('clubId', 'name shortName logoUrl').sort({ startDate: 1 }).skip(skip).limit(Number(limit)),
            Event.countDocuments(filter),
        ]);
        res.json({ success: true, data: { events, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (err) {
        next(err);
    }
};

// GET /api/events/:eventId  (Public — approved only)
export const getPublicEvent = async (req, res, next) => {
    try {
        const event = await Event.findOne({ _id: req.params.eventId, status: 'approved' })
            .populate('clubId', 'name shortName logoUrl description')
            .populate('createdBy', 'name username profilePicUrl');
        if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found or not approved' } });
        res.json({ success: true, data: { event } });
    } catch (err) {
        next(err);
    }
};

// POST /api/events/:eventId/register
export const registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findOne({ _id: req.params.eventId, status: 'approved' });
        if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found or not open' } });

        if (event.capacity && event.registrationCount >= event.capacity) {
            return res.status(400).json({ success: false, error: { message: 'Event is at full capacity' } });
        }

        const existing = await Registration.findOne({ eventId: event._id, studentId: req.user._id });
        if (existing) {
            if (existing.status === 'cancelled') {
                // Re-register
                existing.status = 'registered';
                await existing.save();
                await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } });
                return res.json({ success: true, data: { registration: existing, message: 'Re-registered successfully' } });
            }
            return res.status(400).json({ success: false, error: { message: 'Already registered for this event' } });
        }

        const registration = await Registration.create({ eventId: event._id, studentId: req.user._id });
        await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } });

        // Notify event creator
        await Notification.create({
            userId: event.createdBy,
            type: 'event_registration',
            title: 'New Registration',
            body: `${req.user.name} registered for "${event.title}"`,
            payload: { eventId: event._id, studentId: req.user._id },
            link: `/events/${event._id}`,
        });
        emitToUser(event.createdBy, { type: 'event_registration', eventId: event._id, title: 'New Registration' });

        // Notify org heads (excluding creator if they are a head)
        const org = await Organization.findById(event.clubId).select('heads').lean();
        if (org?.heads?.length) {
            const headIds = org.heads.filter((id) => id.toString() !== event.createdBy.toString());
            for (const headId of headIds) {
                await Notification.create({
                    userId: headId,
                    type: 'event_registration',
                    title: 'New Registration',
                    body: `${req.user.name} registered for "${event.title}"`,
                    payload: { eventId: event._id, studentId: req.user._id },
                    link: `/events/${event._id}`,
                });
                emitToUser(headId, { type: 'event_registration', eventId: event._id, title: 'New Registration' });
            }
        }

        res.status(201).json({ success: true, data: { registration } });
    } catch (err) {
        next(err);
    }
};

// POST /api/events/:eventId/unregister
export const unregisterFromEvent = async (req, res, next) => {
    try {
        const registration = await Registration.findOne({ eventId: req.params.eventId, studentId: req.user._id });
        if (!registration) return res.status(404).json({ success: false, error: { message: 'Not registered' } });

        const wasRegistered = registration.status === 'registered';
        registration.status = 'cancelled';
        await registration.save();

        // Decrement count only if they were actually registered; prevent negative count
        if (wasRegistered) {
            await Event.updateOne(
                { _id: req.params.eventId },
                [{ $set: { registrationCount: { $max: [0, { $subtract: ['$registrationCount', 1] }] } } }]
            );
        }

        res.json({ success: true, data: { message: 'Unregistered successfully' } });
    } catch (err) {
        next(err);
    }
};

// GET /api/events/:eventId/attendees  (Admin or head of this event's org only)
export const getAttendees = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('clubId', 'heads').lean();
        if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });

        if (req.user.role !== 'admin') {
            const headIds = (event.clubId?.heads || []).map((h) => h?.toString?.() || h);
            const isHead = headIds.includes(req.user._id.toString());
            if (!isHead) return res.status(403).json({ success: false, error: { message: 'Forbidden: not a head of this event\'s organization' } });
        }

        const registrations = await Registration.find({ eventId: req.params.eventId, status: { $ne: 'cancelled' } })
            .populate('studentId', 'name username email profilePicUrl')
            .sort({ registeredAt: -1 });
        res.json({ success: true, data: { registrations } });
    } catch (err) {
        next(err);
    }
};

// GET /api/events/:eventId/my-registration
export const getMyRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findOne({ eventId: req.params.eventId, studentId: req.user._id });
        res.json({ success: true, data: { registration: registration || null } });
    } catch (err) {
        next(err);
    }
};

// GET /api/events/my-registrations (student's registered events)
export const getMyRegistrations = async (req, res, next) => {
    try {
        const regs = await Registration.find({ studentId: req.user._id, status: 'registered' })
            .populate({ path: 'eventId', populate: { path: 'clubId', select: 'name shortName' } })
            .sort({ registeredAt: -1 });
        res.json({ success: true, data: { registrations: regs } });
    } catch (err) {
        next(err);
    }
};
