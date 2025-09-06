import mongoose from 'mongoose';
import Event from '../models/Event.js';

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
    return res.json({
      success: true,
      data: { event }
    });
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
    return res.json({
      success: true,
      data: { deleted: true }
    });
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
    return res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

// List events with optional text search and filter by clubId with pagination
export const listEvents = async (req, res, next) => {
  try {
    console.log('listEvents: Starting query...');
    const { page = 1, limit = 10, q = '', clubId } = req.query;
    console.log('listEvents: Query params:', { page, limit, q, clubId });
    
    const filter = {};
    if (q) filter.$text = { $search: String(q) };
    if (clubId && mongoose.isValidObjectId(clubId)) filter.clubId = clubId;

    const skip = (Number(page) - 1) * Number(limit);
    console.log('listEvents: Filter:', filter);

    const [items, total] = await Promise.all([
      Event.find(filter).sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    console.log('listEvents: Found', items.length, 'events, total:', total);

    return res.json({
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    console.error('listEvents: Error:', error);
    next(error);
  }
};

// Get upcoming events (events with date >= now) limited to 20
export const upcomingEvents = async (req, res, next) => {
  try {
    console.log('upcomingEvents: Starting query...');
    const now = new Date();
    console.log('upcomingEvents: Current date:', now);
    
    const items = await Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(20);
    console.log('upcomingEvents: Found', items.length, 'events');
    
    return res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    console.error('upcomingEvents: Error:', error);
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
    return res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};
