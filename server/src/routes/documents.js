import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, ensureRole } from '../middleware/auth.js';
import { uploadDocument, listDocuments, deleteDocument } from '../controllers/documentController.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `doc_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|mp4|zip/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        cb(null, allowed.test(ext));
    },
});

const router = express.Router();

router.post('/', authenticate, ensureRole('admin', 'clubHead'), upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.delete('/:id', authenticate, deleteDocument);

export default router;
