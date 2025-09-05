import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { ok } from '../utils/response.js';

// Create a new event
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    return ok(res, { event }, 201);
  } catch (error) {
    next(error);
  }
};

// Update event by ID
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return ok(res, { event });
  } catch (error) {
    next(error);
  }
};

// Delete event by ID
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// Get event by ID, including club name
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return ok(res, { event });
  } catch (error) {
    next(error);
  }
};

// List events with optional text search and filter by clubId with pagination
export const listEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q = '', clubId } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: String(q) };
    if (clubId && mongoose.isValidObjectId(clubId)) filter.clubId = clubId;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Event.find(filter).sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    return ok(res, {
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming events (events with date >= now) limited to 20
export const upcomingEvents = async (req, res, next) => {
  try {
    const now = new Date();
    const items = await Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(20);
    return ok(res, { items });
  } catch (error) {
    next(error);
  }
};

// Register the authenticated user for the event (adds user to attendees set)
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { attendees: req.user.id } },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return ok(res, { event });
  } catch (error) {
    next(error);
  }
};
