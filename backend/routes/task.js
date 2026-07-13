import express from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, checkWorkspaceAccess } from '../controllers/task.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(checkWorkspaceAccess, createTask)
  .get(checkWorkspaceAccess, getTasks);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
