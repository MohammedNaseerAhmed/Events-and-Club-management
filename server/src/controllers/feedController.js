import Post from '../models/Post.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

// GET /api/feed
export const getFeed = async (req, res, next) => {
    try {
        const { page = 1, limit = 15 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // Get approved events as feed items
        const approvedEvents = await Event.find({ status: 'approved' })
            .populate('clubId', 'name shortName logoUrl')
            .sort({ createdAt: -1 })
            .limit(30);

        // Get posts (announcements, user posts), then filter by author activityVisible
        const postsRaw = await Post.find({ isPublic: true })
            .populate('authorId', 'name username profilePicUrl headline privacySettings')
            .populate('targetOrgId', 'name shortName')
            .populate('eventId', 'title startDate')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const posts = postsRaw.filter((p) => {
            const author = p.authorId;
            if (!author) return false;
            const activityVisible = author.privacySettings?.activityVisible;
            return activityVisible !== false;
        }).slice(0, 30);

        // Merge and sort by createdAt
        const feedItems = [
            ...approvedEvents.map((e) => ({ ...e.toObject(), _feedType: 'event' })),
            ...posts.map((p) => ({ ...p.toObject(), _feedType: 'post' })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const paginatedItems = feedItems.slice(skip, skip + Number(limit));

        res.json({
            success: true,
            data: { items: paginatedItems, total: feedItems.length, page: Number(page), pages: Math.ceil(feedItems.length / Number(limit)) },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/posts
export const createPost = async (req, res, next) => {
    try {
        const { content, media, targetOrgId, eventId, postType } = req.body;
        if (!content) return res.status(400).json({ success: false, error: { message: 'content is required' } });

        const post = await Post.create({
            authorId: req.user._id,
            authorType: 'user',
            content, media, targetOrgId, eventId,
            postType: postType || 'post',
        });

        await post.populate('authorId', 'name username profilePicUrl headline');

        res.status(201).json({ success: true, data: { post } });
    } catch (err) {
        next(err);
    }
};

// POST /api/posts/:id/like
export const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

        const userId = req.user._id;
        const liked = post.likes.some((id) => id.toString() === userId.toString());

        if (liked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ success: true, data: { liked: !liked, likesCount: post.likes.length } });
    } catch (err) {
        next(err);
    }
};

// POST /api/posts/:id/comment
export const commentOnPost = async (req, res, next) => {
    try {
        const { comment } = req.body;
        if (!comment) return res.status(400).json({ success: false, error: { message: 'comment is required' } });

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { userId: req.user._id, comment, createdAt: new Date() } } },
            { new: true }
        ).populate('comments.userId', 'name username profilePicUrl');

        if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        res.json({ success: true, data: { comments: post.comments } });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });
        if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        await post.deleteOne();
        res.json({ success: true, data: { deleted: true } });
    } catch (err) {
        next(err);
    }
};
