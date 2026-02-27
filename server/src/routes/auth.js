import express from 'express';
import { register, login, me, logout, verifyEmailOtp, resendVerificationOtp } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginLockout } from '../middleware/loginLockout.js';
import { registerValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-otp', resendVerificationOtp);
router.post('/login', loginLockout, loginValidator, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
