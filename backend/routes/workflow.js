import express from 'express';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from '../controllers/workflow.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.route('/:workspaceId')
  .get(protect, getWorkflows)
  .post(protect, createWorkflow);

router.route('/:workspaceId/:workflowId')
  .put(protect, updateWorkflow)
  .delete(protect, deleteWorkflow);

export default router;
