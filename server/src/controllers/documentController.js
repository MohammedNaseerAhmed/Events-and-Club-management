import Document from '../models/Document.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// POST /api/documents
export const uploadDocument = async (req, res, next) => {
    try {
        const { title, orgId, eventId, visibility } = req.body;
        if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        if (!title) return res.status(400).json({ success: false, error: { message: 'title is required' } });
        if (orgId && !mongoose.isValidObjectId(orgId)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid organization id' } });
        }
        if (eventId && !mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid event id' } });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const doc = await Document.create({
            uploadedBy: req.user._id,
            orgId: orgId || null,
            eventId: eventId || null,
            title,
            fileUrl,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            visibility: visibility || 'public',
        });

        await doc.populate('uploadedBy', 'name username');
        res.status(201).json({ success: true, data: { document: doc } });
    } catch (err) {
        next(err);
    }
};

// GET /api/documents
export const listDocuments = async (req, res, next) => {
    try {
        const { orgId, eventId } = req.query;
        const filter = {};
        if (orgId) {
            if (!mongoose.isValidObjectId(orgId)) {
                return res.status(400).json({ success: false, error: { message: 'Invalid organization id' } });
            }
            filter.orgId = orgId;
        }
        if (eventId) {
            if (!mongoose.isValidObjectId(eventId)) {
                return res.status(400).json({ success: false, error: { message: 'Invalid event id' } });
            }
            filter.eventId = eventId;
        }

        const docs = await Document.find(filter)
            .populate('uploadedBy', 'name username profilePicUrl')
            .populate('orgId', 'name shortName')
            .populate('eventId', 'title')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: { documents: docs } });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res, next) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, error: { message: 'Document not found' } });
        if (req.user.role !== 'admin' && doc.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        }
        // Delete local file
        const filePath = path.join(process.cwd(), doc.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await doc.deleteOne();
        res.json({ success: true, data: { deleted: true } });
    } catch (err) {
        next(err);
    }
};
