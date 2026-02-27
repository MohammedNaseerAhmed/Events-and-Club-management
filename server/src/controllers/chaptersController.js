import Organization from '../models/Organization.js';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';

const CATEGORY_MAP = {
  chapter: 'Professional Chapter',
  society: 'Society',
  club: 'Club',
  celebration: 'Campus Event',
};

function parseCategory(queryCategory) {
  if (!queryCategory) return null;
  const c = String(queryCategory).toLowerCase();
  return CATEGORY_MAP[c] || (CATEGORY_MAP.hasOwnProperty(c) ? null : null);
}

export const listChapters = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 24 } = req.query;
    const filter = { isActive: true };
    const typeFilter = parseCategory(category);
    if (typeFilter) filter.type = typeFilter;
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { shortName: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate('heads', 'name username profilePicUrl')
        .select('name shortName description type logoUrl bannerUrl heads joinEnabled')
        .sort({ type: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Organization.countDocuments(filter),
    ]);
    const now = new Date();
    const orgIds = organizations.map((o) => o._id);
    const [eventCounts, memberCounts] = await Promise.all([
      Event.aggregate([
        { $match: { clubId: { $in: orgIds }, status: 'approved', startDate: { $gte: now } } },
        { $group: { _id: '$clubId', count: { $sum: 1 } } },
      ]),
      JoinRequest.aggregate([
        { $match: { organizationId: { $in: orgIds }, status: 'approved' } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
    ]);
    const upcomingByOrg = Object.fromEntries(eventCounts.map((e) => [e._id.toString(), e.count]));
    const membersByOrg = Object.fromEntries(memberCounts.map((m) => [m._id.toString(), m.count]));
    const list = organizations.map((org) => ({
      ...org,
      upcomingEventsCount: upcomingByOrg[org._id.toString()] || 0,
      activeMembersCount: membersByOrg[org._id.toString()] || 0,
    }));
    res.json({
      success: true,
      data: {
        items: list,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ _id: req.params.id, isActive: true })
      .populate('heads', 'name username profilePicUrl headline')
      .lean();
    if (!org) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    const now = new Date();
    const [upcomingEvents, pastEventsCount, approvedMembers] = await Promise.all([
      Event.find({ clubId: org._id, status: 'approved', startDate: { $gte: now } })
        .sort({ startDate: 1 })
        .limit(10)
        .populate('createdBy', 'name username')
        .lean(),
      Event.countDocuments({ clubId: org._id, status: 'approved', startDate: { $lt: now } }),
      JoinRequest.countDocuments({ organizationId: org._id, status: 'approved' }),
    ]);
    res.json({
      success: true,
      data: {
        chapter: org,
        upcomingEvents,
        pastEventsCount,
        activeMembersCount: approvedMembers,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    const allowed = [
      'description', 'mission', 'vision', 'history', 'impact', 'objectives',
      'bannerUrl', 'socialLinks', 'committee', 'gallery', 'joinEnabled',
    ];
    const update = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    Object.assign(org, update);
    await org.save();
    const updated = await Organization.findById(org._id).populate('heads', 'name username profilePicUrl').lean();
    res.json({ success: true, data: { organization: updated } });
  } catch (err) {
    next(err);
  }
};

export const submitJoinRequest = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ _id: req.params.id, isActive: true });
    if (!org) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    if (!org.joinEnabled) return res.status(400).json({ success: false, error: { message: 'Join requests are not open' } });
    const { name, rollNumber, email, phone, branch, year, whyJoin } = req.body;
    const existing = await JoinRequest.findOne({ organizationId: org._id, email, status: 'pending' });
    if (existing) return res.status(400).json({ success: false, error: { message: 'A pending request with this email already exists' } });
    const joinRequest = await JoinRequest.create({
      organizationId: org._id,
      userId: req.user?._id || undefined,
      name,
      rollNumber: rollNumber || undefined,
      email,
      phone: phone || undefined,
      branch: branch || undefined,
      year: year || undefined,
      whyJoin: whyJoin || undefined,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: { joinRequest, message: 'Request submitted successfully' } });
  } catch (err) {
    next(err);
  }
};

export const listJoinRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { organizationId: req.params.id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      JoinRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      JoinRequest.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: { requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

export const reviewJoinRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, remarks } = req.body || {};
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'status must be approved or rejected' } });
    }
    const joinRequest = await JoinRequest.findOne({ _id: requestId, organizationId: req.params.id });
    if (!joinRequest) return res.status(404).json({ success: false, error: { message: 'Request not found' } });
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: { message: 'Request already reviewed' } });
    }
    joinRequest.status = status;
    joinRequest.remarks = remarks !== undefined ? remarks : joinRequest.remarks;
    joinRequest.reviewedBy = req.user._id;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();
    res.json({ success: true, data: { joinRequest } });
  } catch (err) {
    next(err);
  }
};

export const addGalleryImage = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    const { url, caption } = req.body || {};
    if (!url || typeof url !== 'string' || !url.trim()) return res.status(400).json({ success: false, error: { message: 'url is required' } });
    org.gallery = org.gallery || [];
    org.gallery.push({ url: url.trim(), caption: (caption && typeof caption === 'string') ? caption.trim() : '' });
    await org.save();
    res.status(201).json({ success: true, data: { gallery: org.gallery } });
  } catch (err) {
    next(err);
  }
};

export const dashboardStats = async (req, res, next) => {
  try {
    const [totalClubs, totalSocieties, pendingJoinRequests, upcomingCelebrations, activeOrg] = await Promise.all([
      Organization.countDocuments({ isActive: true, type: 'Club' }),
      Organization.countDocuments({ isActive: true, type: 'Society' }),
      JoinRequest.countDocuments({ status: 'pending' }),
      Event.countDocuments({
        status: 'approved',
        startDate: { $gte: new Date() },
        clubId: { $in: await Organization.find({ type: 'Campus Event', isActive: true }).distinct('_id') },
      }),
      Organization.findOne({ isActive: true })
        .sort({ followersCount: -1 })
        .select('name shortName logoUrl type')
        .lean(),
    ]);
    const chaptersCount = await Organization.countDocuments({ isActive: true, type: 'Professional Chapter' });
    res.json({
      success: true,
      data: {
        totalClubs,
        totalSocieties,
        totalChapters: chaptersCount,
        pendingJoinRequests,
        upcomingCelebrations,
        mostActiveClub: activeOrg,
      },
    });
  } catch (err) {
    next(err);
  }
};
