import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// All message routes require authentication
router.use(protect);

router
  .route('/')
  .get(getMessages)
  .post(sendMessage);

export default router;
