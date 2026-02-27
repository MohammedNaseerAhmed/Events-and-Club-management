import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Registration from '../models/Registration.js';

// GET /api/users/check-username?username=xxx — availability check (public)
export const checkUsername = async (req, res, next) => {
  try {
    const raw = req.query.username;
    const username = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    if (username.length < 4) {
      return res.json({ success: true, data: { available: false, reason: 'Username must be at least 4 characters' } });
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.json({ success: true, data: { available: false, reason: 'Only lowercase letters, numbers, and underscores' } });
    }
    const exists = await User.exists({ username });
    res.json({ success: true, data: { available: !exists } });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:username — enforce privacySettings.profileVisible
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash -notificationSettings')
      .populate('organizationsOwned', 'name shortName logoUrl type')
      .populate('followingOrgs', 'name shortName logoUrl');
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const profileVisible = user.privacySettings?.profileVisible;
    if (profileVisible === false) {
      const isSelf = req.user && req.user._id.toString() === user._id.toString();
      if (!isSelf) return res.status(403).json({ success: false, error: { message: 'Profile is not visible' } });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me  (personal details)
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'headline', 'profilePicUrl'];
    const update = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-passwordHash');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me/password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'currentPassword and newPassword required' } });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, error: { message: 'Current password is incorrect' } });

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me/privacy
export const updatePrivacy = async (req, res, next) => {
  try {
    const { profileVisible, activityVisible } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { privacySettings: { profileVisible: profileVisible ?? true, activityVisible: activityVisible ?? true } },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me/notifications
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const { email, push } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: { email: email ?? true, push: push ?? true } },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/me/follow-org/:orgId
export const followOrg = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { followingOrgs: orgId } });
    res.json({ success: true, data: { message: 'Following organization' } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me/follow-org/:orgId
export const unfollowOrg = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { followingOrgs: orgId } });
    res.json({ success: true, data: { message: 'Unfollowed organization' } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me  (delete account)
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, error: { message: 'Password incorrect' } });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/registrations
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