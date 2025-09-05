import express from 'express';
import { monthly } from '../controllers/calendarController.js';

const router = express.Router();

router.get('/monthly', monthly);

export default router;