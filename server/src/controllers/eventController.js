import mongoose from 'mongoose';
import Event from '../models/Event.js';

// Create a new event
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, status: req.body.status || 'approved' });
    return res.status(201).json({
      success: true,
      data: { event }
    });
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
    const event = await Event.findOne({
      _id: req.params.id,
      $or: [{ status: 'approved' }, { status: 'completed' }, { status: { $exists: false } }],
    }).populate('clubId', 'name');
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

// List events with optional text search, category, date filters and filter by clubId with pagination
export const listEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', date = '', clubId } = req.query;
    const conditions = [
      { $or: [{ status: 'approved' }, { status: 'completed' }, { status: { $exists: false } }] },
    ];

    // Text search on title and description
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } }
        ],
      });
    }
    
    // Category filter - since events don't have category, we'll filter by club category
    if (category) {
      // We need to populate clubs to filter by category
      // For now, we'll skip this filter since events don't have direct category
    }
    
    // Date filter
    if (date) {
      const now = new Date();
      switch (date) {
        case 'today':
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          conditions.push({ date: { $gte: startOfDay, $lt: endOfDay } });
          break;
        case 'week':
          const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
          conditions.push({ date: { $gte: startOfWeek, $lt: endOfWeek } });
          break;
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          conditions.push({ date: { $gte: startOfMonth, $lt: endOfMonth } });
          break;
      }
    }

    if (clubId && mongoose.isValidObjectId(clubId)) conditions.push({ clubId });

    const filter = conditions.length > 1 ? { $and: conditions } : conditions[0];

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Event.find(filter).populate('clubId', 'name category').sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    // If category filter is applied, filter results by club category
    let filteredItems = items;
    if (category && items.length > 0) {
      filteredItems = items.filter(event => event.clubId && event.clubId.category === category);
    }

    return res.json({
      success: true,
      data: {
        items: filteredItems,
        total: category ? filteredItems.length : total,
        page: Number(page),
        pages: Math.ceil((category ? filteredItems.length : total) / Number(limit)),
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming events (events with date >= now) limited to 20
export const upcomingEvents = async (req, res, next) => {
  try {
    const now = new Date();
    
    const items = await Event.find({
      date: { $gte: now },
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    }).sort({ date: 1 }).limit(20);
    
    return res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    next(error);
  }
};

// Register the authenticated user for the event (adds user to attendees set)
export const registerForEvent = async (req, res, next) => {
  try {
    const existing = await Event.findOne({
      _id: req.params.id,
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    });
    if (!existing) {
      return res.status(404).json({ message: 'Event not found or not open for registration' });
    }

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
