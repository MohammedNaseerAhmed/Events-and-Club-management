import Event from '../models/Event.js';
import { ok } from '../utils/response.js';

// Get events for a specific month and year
export const monthly = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month);
    const monthIndex = Number.isFinite(month) ? month : new Date().getMonth();

    // Start of the month
    const start = new Date(year, monthIndex, 1);
    // End of the month (including last millisecond)
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    // Fetch events within the date range, sorted by date ascending
    const events = await Event.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 });

    // Map events to desired response format
    const items = events.map((e) => ({
      id: e._id,
      date: e.date,
      title: e.title,
      link: `/events/${e._id}`,
    }));

    return ok(res, { items, year, month: monthIndex });
  } catch (error) {
    next(error);
  }
};
