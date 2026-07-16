import mongoose from 'mongoose';
import { getIO } from '../socket.js';

export const executeWorkflowAction = async (action, taskContext) => {
  const { actionType, payload } = action;

  try {
    const io = getIO();
    const Task = mongoose.model('Task');
    const ActivityLog = mongoose.model('ActivityLog');

    switch (actionType) {
      case 'ASSIGN_USER':
        await Task.findByIdAndUpdate(taskContext._id, { assignee: payload.userId });
        
        await ActivityLog.create({
          action: 'TASK_ASSIGNED',
          task: taskContext._id,
          workspace: taskContext.workspace,
          user: taskContext.createdBy, // Fallback to creator or system
          details: { assignee: payload.userId, note: 'Assigned via Automation' }
        });
        
        // Emit socket event
        if (io) {
           io.to(taskContext.workspace.toString()).emit('task_updated', { taskId: taskContext._id, workspaceId: taskContext.workspace });
        }
        break;

      case 'CHANGE_STATUS':
        await Task.findByIdAndUpdate(taskContext._id, { status: payload.status });
        if (io) {
           io.to(taskContext.workspace.toString()).emit('task_updated', { taskId: taskContext._id, workspaceId: taskContext.workspace });
        }
        break;

      case 'CHANGE_PRIORITY':
        await Task.findByIdAndUpdate(taskContext._id, { priority: payload.priority });
        if (io) {
           io.to(taskContext.workspace.toString()).emit('task_updated', { taskId: taskContext._id, workspaceId: taskContext.workspace });
        }
        break;

      case 'SEND_NOTIFICATION':
        // A simple socket.io notification or in-app notification system
        if (io) {
           io.to(taskContext.workspace.toString()).emit('notification', {
              message: payload.message || `Automated message regarding task: ${taskContext.title}`,
              workspaceId: taskContext.workspace
           });
        }
        break;

      case 'CREATE_TASK':
        const newTask = await Task.create({
          title: payload.title || `Follow-up to ${taskContext.title}`,
          description: payload.description || '',
          workspace: taskContext.workspace,
          createdBy: taskContext.createdBy,
          priority: payload.priority || 'Medium',
          status: 'To Do'
        });
        if (io) {
           io.to(taskContext.workspace.toString()).emit('task_created', { task: newTask });
        }
        break;

      default:
        console.warn(`Unknown workflow action type: ${actionType}`);
    }
  } catch (error) {
    console.error(`Error executing workflow action ${actionType}:`, error);
  }
};
