import mongoose from 'mongoose';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import { ok } from '../utils/response.js';

// Create a new club
export const createClub = async (req, res, next) => {
  try {
    const club = await Club.create(req.body);
    return ok(res, { club }, 201);
  } catch (error) {
    next(error);
  }
};

// Update club by ID
export const updateClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    return ok(res, { club });
  } catch (error) {
    next(error);
  }
};

// Delete club by ID
export const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// Get club by ID
export const getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    return ok(res, { club });
  } catch (error) {
    next(error);
  }
};

// List clubs with pagination and optional name search query
export const listClubs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q = '' } = req.query;
    const filter = q ? { name: { $regex: String(q), $options: 'i' } } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Club.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Club.countDocuments(filter),
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

// List events associated with a specific club ID with pagination
export const clubEvents = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return ok(res, { items: [] });
    }
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Event.find({ clubId: req.params.id }).sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments({ clubId: req.params.id }),
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
