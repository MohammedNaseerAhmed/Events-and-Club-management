import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// GET /api/conversations
export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({ participantIds: req.user._id })
            .populate('participantIds', 'name username profilePicUrl')
            .sort({ lastMessageAt: -1 });
        res.json({ success: true, data: { conversations } });
    } catch (err) {
        next(err);
    }
};

// POST /api/conversations
export const createConversation = async (req, res, next) => {
    try {
        const { recipientId, isGroup, title, participantIds } = req.body;

        if (!isGroup) {
            // Find existing 1-1 conversation
            const existing = await Conversation.findOne({
                isGroup: false,
                participantIds: { $all: [req.user._id, recipientId], $size: 2 },
            }).populate('participantIds', 'name username profilePicUrl');
            if (existing) return res.json({ success: true, data: { conversation: existing } });

            const conversation = await Conversation.create({
                participantIds: [req.user._id, recipientId],
                isGroup: false,
                createdBy: req.user._id,
            });
            await conversation.populate('participantIds', 'name username profilePicUrl');
            return res.status(201).json({ success: true, data: { conversation } });
        } else {
            const allParticipants = [...new Set([req.user._id.toString(), ...(participantIds || [])])];
            const conversation = await Conversation.create({
                participantIds: allParticipants,
                isGroup: true,
                title: title || 'Group Chat',
                createdBy: req.user._id,
            });
            await conversation.populate('participantIds', 'name username profilePicUrl');
            return res.status(201).json({ success: true, data: { conversation } });
        }
    } catch (err) {
        next(err);
    }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const conversation = await Conversation.findOne({ _id: req.params.id, participantIds: req.user._id });
        if (!conversation) return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });

        const skip = (Number(page) - 1) * Number(limit);
        const [messages, total] = await Promise.all([
            Message.find({ conversationId: conversation._id })
                .populate('senderId', 'name username profilePicUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Message.countDocuments({ conversationId: conversation._id }),
        ]);

        res.json({ success: true, data: { messages: messages.reverse(), total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (err) {
        next(err);
    }
};

// POST /api/conversations/:id/messages  (REST fallback, main is via Socket.io)
export const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        const conversation = await Conversation.findOne({ _id: req.params.id, participantIds: req.user._id });
        if (!conversation) return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });

        const message = await Message.create({ conversationId: conversation._id, senderId: req.user._id, content });
        conversation.lastMessageAt = new Date();
        conversation.lastMessage = content.substring(0, 100);
        await conversation.save();

        await message.populate('senderId', 'name username profilePicUrl');
        res.status(201).json({ success: true, data: { message } });
    } catch (err) {
        next(err);
    }
};
