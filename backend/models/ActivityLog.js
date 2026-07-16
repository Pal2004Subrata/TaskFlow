import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_ASSIGNED',
      'COMMENT_ADDED',
      'STATUS_CHANGED',
      'DEADLINE_UPDATED',
      'PRIORITY_CHANGED'
    ],
    required: true
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  workspace: {
    type: mongoose.Schema.ObjectId,
    ref: 'Workspace',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true // the user who performed the action
  },
  details: {
    type: mongoose.Schema.Types.Mixed // e.g., { oldStatus: 'To Do', newStatus: 'In Progress' }
  }
}, { timestamps: true });

activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
