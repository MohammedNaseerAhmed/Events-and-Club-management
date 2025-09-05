import Notification from '../models/Notification.js';
import { ok } from '../utils/response.js';

// Create a new notification
export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    return ok(res, { notification }, 201);
  } catch (error) {
    next(error);
  }
};

// Update notification by ID
export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return ok(res, { notification });
  } catch (error) {
    next(error);
  }
};

// Delete notification by ID
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// Get single notification by ID
export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return ok(res, { notification });
  } catch (error) {
    next(error);
  }
};

// List notifications with pagination, filtering by type and search query
export const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, q = '' } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (q) filter.title = { $regex: String(q), $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(filter),
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

// Get recent notifications limited by query param or default to 10
export const recentNotifications = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 10);
    const items = await Notification.find({}).sort({ date: -1 }).limit(limit);
    return ok(res, { items });
  } catch (error) {
    next(error);
  }
};
