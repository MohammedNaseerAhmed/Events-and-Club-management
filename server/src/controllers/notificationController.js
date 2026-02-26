import Notification from '../models/Notification.js';

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments({ userId: req.user._id }),
      Notification.countDocuments({ userId: req.user._id, read: false }),
    ]);

    res.json({ success: true, data: { notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/mark-read
export const markRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: req.user._id },
        { $set: { read: true } }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    }
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) {
    next(err);
  }
};
