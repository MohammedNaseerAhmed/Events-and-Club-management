import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../utils/notificationEmitter.js';

// POST /api/network/invite
export const sendInvite = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) return res.status(400).json({ success: false, error: { message: 'recipientId required' } });
        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({ success: false, error: { message: 'Cannot connect with yourself' } });
        }

        const existing = await Connection.findOne({
            $or: [
                { requester: req.user._id, recipient: recipientId },
                { requester: recipientId, recipient: req.user._id },
            ],
        });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Connection already exists or pending' } });

        const connection = await Connection.create({ requester: req.user._id, recipient: recipientId });

        await Notification.create({
            userId: recipientId,
            type: 'invite',
            title: 'New Connection Request',
            body: `${req.user.name} sent you a connection request`,
            payload: { connectionId: connection._id, requesterId: req.user._id },
            link: '/network/invitations',
        });
        emitToUser(recipientId, { type: 'invite', connectionId: connection._id, title: 'New Connection Request' });

        res.status(201).json({ success: true, data: { connection } });
    } catch (err) {
        next(err);
    }
};

// GET /api/network/invitations
export const getInvitations = async (req, res, next) => {
    try {
        const invitations = await Connection.find({ recipient: req.user._id, status: 'pending' })
            .populate('requester', 'name username profilePicUrl headline')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: { invitations } });
    } catch (err) {
        next(err);
    }
};

// GET /api/network/connections
export const getConnections = async (req, res, next) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: req.user._id }, { recipient: req.user._id }],
            status: 'accepted',
        }).populate('requester', 'name username profilePicUrl headline').populate('recipient', 'name username profilePicUrl headline');
        res.json({ success: true, data: { connections } });
    } catch (err) {
        next(err);
    }
};

// POST /api/network/invitations/:id/accept
export const acceptInvitation = async (req, res, next) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
        if (connection.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        connection.status = 'accepted';
        await connection.save();

        // Add to each other's connections
        await User.findByIdAndUpdate(connection.requester, { $addToSet: { connections: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { connections: connection.requester } });

        await Notification.create({
            userId: connection.requester,
            type: 'invite_accepted',
            title: 'Connection Accepted',
            body: `${req.user.name} accepted your connection request`,
            payload: { connectionId: connection._id },
            link: `/${req.user.username}`,
        });
        emitToUser(connection.requester, { type: 'invite_accepted', connectionId: connection._id, title: 'Connection Accepted' });

        res.json({ success: true, data: { connection } });
    } catch (err) {
        next(err);
    }
};

// POST /api/network/invitations/:id/reject
export const rejectInvitation = async (req, res, next) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ success: false, error: { message: 'Invitation not found' } });
        if (connection.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        connection.status = 'rejected';
        await connection.save();
        res.json({ success: true, data: { message: 'Invitation rejected' } });
    } catch (err) {
        next(err);
    }
};

// GET /api/network/suggestions — exclude self, already connected, and pending (both directions)
export const getSuggestions = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const connections = await Connection.find({
            $or: [{ requester: myId }, { recipient: myId }],
        }).lean();

        const excludeIds = new Set([myId.toString()]);
        for (const c of connections) {
            excludeIds.add(c.requester.toString());
            excludeIds.add(c.recipient.toString());
        }

        const users = await User.find({
            _id: { $nin: Array.from(excludeIds) },
        })
            .select('name username profilePicUrl headline bio')
            .limit(10);
        res.json({ success: true, data: { users } });
    } catch (err) {
        next(err);
    }
};
