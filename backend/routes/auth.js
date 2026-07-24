import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  googleAuth,
  signup, 
  login, 
  getMe, 
  updateMe, 
  updatePassword,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-signup-otp', authLimiter, sendSignupOtp);
router.post('/verify-signup-otp', authLimiter, verifySignupOtp);
router.post('/send-login-otp', authLimiter, sendLoginOtp);
router.post('/verify-login-otp', authLimiter, verifyLoginOtp);
router.post('/google', authLimiter, googleAuth);

// Legacy routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

router.get('/me', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.patch('/update-password', protect, updatePassword);

router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

export default router;
