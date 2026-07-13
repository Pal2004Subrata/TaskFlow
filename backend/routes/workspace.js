import express from 'express';
import { createWorkspace, getWorkspaces, getWorkspace, inviteMember, deleteWorkspace, getPendingInvites, acceptInvite, rejectInvite } from '../controllers/workspace.js';
import { protect } from '../middlewares/auth.js';
import messageRouter from './message.js';

const router = express.Router();

router.use(protect);

// Nest message router
router.use('/:workspaceId/messages', messageRouter);

router.route('/')
  .post(createWorkspace)
  .get(getWorkspaces);

router.get('/invites', getPendingInvites);

router.route('/:id')
  .get(getWorkspace)
  .delete(deleteWorkspace);

router.post('/:id/invite', inviteMember);
router.post('/:id/invites/accept', acceptInvite);
router.post('/:id/invites/reject', rejectInvite);

export default router;
