import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { postCreateValidator, commentValidator } from '../middleware/validators.js';
import { getFeed, createPost, likePost, commentOnPost, deletePost } from '../controllers/feedController.js';

const router = express.Router();

router.get('/', authenticate, getFeed);
router.post('/posts', authenticate, postCreateValidator, createPost);
router.post('/posts/:id/like', authenticate, likePost);
router.post('/posts/:id/comment', authenticate, commentValidator, commentOnPost);
router.delete('/posts/:id', authenticate, deletePost);

export default router;
