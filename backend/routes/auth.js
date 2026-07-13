import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
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
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login/signup attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.patch('/update-password', protect, updatePassword);

router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

export default router;
