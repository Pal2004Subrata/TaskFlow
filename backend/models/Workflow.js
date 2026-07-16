import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow must have a name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  workspace: {
    type: mongoose.Schema.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workflow must belong to a workspace']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Workflow must belong to a creator']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trigger: {
    type: String,
    enum: ['TASK_CREATED', 'TASK_UPDATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'DEADLINE_APPROACHING', 'TASK_OVERDUE'],
    required: true
  },
  conditions: [{
    field: String, // e.g., 'status', 'priority', 'assignee'
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'becomes']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  actions: [{
    actionType: {
      type: String,
      enum: ['ASSIGN_USER', 'CHANGE_STATUS', 'CHANGE_PRIORITY', 'SEND_NOTIFICATION', 'CREATE_TASK']
    },
    payload: mongoose.Schema.Types.Mixed // Depends on actionType e.g., { userId: '123' }, { priority: 'High' }
  }],
  executionCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

workflowSchema.index({ workspace: 1, isActive: 1, trigger: 1 });

export default mongoose.model('Workflow', workflowSchema);
