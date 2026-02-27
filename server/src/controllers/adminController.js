import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import Registration from '../models/Registration.js';
import { emitToUser } from '../utils/notificationEmitter.js';
import { sendEventUpdateEmail } from '../utils/email.js';

const clientBaseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
const buildEventLink = (eventId) => `${clientBaseUrl}/events/${eventId}`;

// ---- Organizations ----

// POST /api/admin/organizations
export const createOrganization = async (req, res, next) => {
  try {
    const { name, shortName, fullForm, type, description, mission, vision, facultyCoordinator, heads } = req.body;
    const org = await Organization.create({
      name, shortName, fullForm, type, description, mission, vision, facultyCoordinator,
      heads: heads || [],
      createdBy: req.user._id,
      isActive: true,
    });

    // If heads assigned, update their roles/orgs
    if (heads && heads.length > 0) {
      await User.updateMany(
        { _id: { $in: heads } },
        { $set: { role: 'clubHead' }, $addToSet: { organizationsOwned: org._id } }
      );
    }

    await AuditLog.create({ action: 'CREATE_ORG', actorId: req.user._id, targetId: org._id, targetModel: 'Organization', meta: { name } });

    res.status(201).json({ success: true, data: { organization: org } });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/organizations
export const listOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find().populate('heads', 'name email username profilePicUrl').populate('createdBy', 'name email').sort({ name: 1 });
    res.json({ success: true, data: { organizations: orgs } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/organizations/:id
export const updateOrganization = async (req, res, next) => {
  try {
    const { heads, ...rest } = req.body;
    const org = await Organization.findByIdAndUpdate(req.params.id, rest, { new: true });
    if (!org) return res.status(404).json({ success: false, error: { message: 'Org not found' } });

    if (heads !== undefined) {
      // Remove from old heads
      await User.updateMany(
        { organizationsOwned: org._id },
        { $pull: { organizationsOwned: org._id } }
      );
      // Update org heads
      org.heads = heads;
      await org.save();
      // Add to new heads
      if (heads.length > 0) {
        await User.updateMany(
          { _id: { $in: heads } },
          { $set: { role: 'clubHead' }, $addToSet: { organizationsOwned: org._id } }
        );
      }
    }

    await AuditLog.create({ action: 'UPDATE_ORG', actorId: req.user._id, targetId: org._id, targetModel: 'Organization' });
    res.json({ success: true, data: { organization: await Organization.findById(org._id).populate('heads', 'name email username') } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/organizations/:id
export const deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: { message: 'Org not found' } });
    await User.updateMany({ organizationsOwned: org._id }, { $pull: { organizationsOwned: org._id } });
    await AuditLog.create({ action: 'DELETE_ORG', actorId: req.user._id, targetId: org._id, targetModel: 'Organization', meta: { name: org.name } });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/organizations/:id/assign-head
export const assignHead = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { heads: userId } },
      { new: true }
    );
    if (!org) return res.status(404).json({ success: false, error: { message: 'Org not found' } });
    await User.findByIdAndUpdate(userId, { $set: { role: 'clubHead' }, $addToSet: { organizationsOwned: org._id } });
    await AuditLog.create({ action: 'ASSIGN_HEAD', actorId: req.user._id, targetId: org._id, targetModel: 'Organization', meta: { userId } });
    res.json({ success: true, data: { organization: org } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/organizations/:id/remove-head
export const removeHead = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { $pull: { heads: userId } },
      { new: true }
    );
    if (!org) return res.status(404).json({ success: false, error: { message: 'Org not found' } });
    await User.findByIdAndUpdate(userId, { $pull: { organizationsOwned: org._id } });
    await AuditLog.create({ action: 'REMOVE_HEAD', actorId: req.user._id, targetId: org._id, targetModel: 'Organization', meta: { userId } });
    res.json({ success: true, data: { organization: org } });
  } catch (err) {
    next(err);
  }
};

// ---- Event Management (Admin) ----

// GET /api/admin/events/pending
export const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('clubId', 'name shortName')
      .populate('createdBy', 'name email username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { events } });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/events
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('clubId', 'name shortName')
      .populate('createdBy', 'name email username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { events } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/events/:eventId/approve
export const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('createdBy').populate('clubId');
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    if (event.status !== 'pending') return res.status(400).json({ success: false, error: { message: 'Event is not pending' } });

    event.status = 'approved';
    event.approvedBy = req.user._id;
    await event.save();

    // Notify the creator
    await Notification.create({
      userId: event.createdBy._id,
      type: 'event_approved',
      title: 'Event Approved!',
      body: `Your event "${event.title}" has been approved by admin.`,
      payload: { eventId: event._id },
      link: `/events/${event._id}`,
    });

    // Notify org followers
    const followers = await User.find({ followingOrgs: event.clubId._id }, '_id');
    const notifs = followers.map((f) => ({
      userId: f._id,
      type: 'announcement',
      title: `New Event: ${event.title}`,
      body: `${event.clubId.name} is hosting "${event.title}"`,
      payload: { eventId: event._id },
      link: `/events/${event._id}`,
    }));
    if (notifs.length > 0) await Notification.insertMany(notifs);

    await AuditLog.create({ action: 'APPROVE_EVENT', actorId: req.user._id, targetId: event._id, targetModel: 'Event' });

    emitToUser(event.createdBy._id, { type: 'event_approved', eventId: event._id, title: 'Event Approved!' });

    sendEventUpdateEmail({
      to: event.createdBy.email,
      name: event.createdBy.name,
      eventTitle: event.title,
      updateType: 'approved',
      details: `Your event "${event.title}" has been approved by admin.`,
      eventLink: buildEventLink(event._id),
    }).catch(() => {});

    res.json({ success: true, data: { event } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/events/:eventId/reject
export const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.eventId).populate('createdBy');
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });

    event.status = 'rejected';
    event.rejectionReason = reason || '';
    await event.save();

    await Notification.create({
      userId: event.createdBy._id,
      type: 'event_rejected',
      title: 'Event Rejected',
      body: `Your event "${event.title}" was rejected. ${reason ? 'Reason: ' + reason : ''}`,
      payload: { eventId: event._id },
    });

    emitToUser(event.createdBy._id, { type: 'event_rejected', eventId: event._id, title: 'Event Rejected' });

    sendEventUpdateEmail({
      to: event.createdBy.email,
      name: event.createdBy.name,
      eventTitle: event.title,
      updateType: 'rejected',
      details: reason ? `Your event was rejected. Reason: ${reason}` : 'Your event was rejected by admin.',
      eventLink: buildEventLink(event._id),
    }).catch(() => {});

    await AuditLog.create({ action: 'REJECT_EVENT', actorId: req.user._id, targetId: event._id, targetModel: 'Event', meta: { reason } });

    res.json({ success: true, data: { event } });
  } catch (err) {
    next(err);
  }
};

// ---- User Management ----

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').populate('organizationsOwned', 'name shortName').sort({ createdAt: -1 });
    res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email username')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalOrgs, totalEvents, pendingEvents, totalRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      Organization.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Registration.countDocuments(),
    ]);
    res.json({ success: true, data: { totalUsers, totalOrgs, totalEvents, pendingEvents, totalRegistrations } });
  } catch (err) {
    next(err);
  }
};
