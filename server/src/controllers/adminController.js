import User from '../models/User.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/response.js';

// --- User Management ---

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    return ok(res, users);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// --- Club Management ---

export const listClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find();
    return ok(res, clubs);
  } catch (error) {
    next(error);
  }
};

export const updateClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) return fail(res, 'Club not found', 404);
    return ok(res, club);
  } catch (error) {
    next(error);
  }
};

export const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return fail(res, 'Club not found', 404);
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// --- Event Management ---

export const listEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('clubId', 'name category').sort({ createdAt: -1 });
    return ok(res, events);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return fail(res, 'Event not found', 404);
    return ok(res, event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return fail(res, 'Event not found', 404);
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// --- Notification Management ---

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find();
    return ok(res, notifications);
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) return fail(res, 'Notification not found', 404);
    return ok(res, notification);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return fail(res, 'Notification not found', 404);
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
