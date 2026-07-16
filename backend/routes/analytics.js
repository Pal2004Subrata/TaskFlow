import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:workspaceId', protect, getDashboardAnalytics);

export default router;
