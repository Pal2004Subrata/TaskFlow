import mongoose from 'mongoose';
import { workflowQueue } from '../jobs/workflowQueue.js';
import ActivityLog from './ActivityLog.js';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A task must have a title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done', 'Blocked', 'Cancelled'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes or hours depending on frontend usage, let's assume minutes
  },
  assignee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  workspace: {
    type: mongoose.Schema.ObjectId,
    ref: 'Workspace',
    required: [true, 'Task must belong to a workspace']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to a creator']
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  }
}, { timestamps: true });

// Indexes for performance
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ title: 'text' });

// Middleware to capture previous state
taskSchema.pre('save', async function() {
  this._isNew = this.isNew;
  if (!this.isNew) {
    this._original = this.toObject(); // capture original
  }
});

// Middleware to trigger workflow and activity
taskSchema.post('save', async function(doc) {
  try {
    if (this._isNew) {
       // Activity Log
       await ActivityLog.create({
         action: 'TASK_CREATED',
         task: doc._id,
         workspace: doc.workspace,
         user: doc.createdBy,
         details: { title: doc.title }
       });
       
       // Workflow Queue
       workflowQueue.add('workflowJob', {
         eventType: 'TASK_CREATED',
         task: doc,
       });
    } else {
       const original = this._original;
       let eventType = 'TASK_UPDATED';
       const details = {};
       
       if (original && original.status !== doc.status) {
         eventType = 'STATUS_CHANGED';
         details.oldStatus = original.status;
         details.newStatus = doc.status;
       } else if (original && original.priority !== doc.priority) {
         eventType = 'PRIORITY_CHANGED';
       } else if (original && String(original.assignee) !== String(doc.assignee)) {
         eventType = 'TASK_ASSIGNED';
       }
       
       // Activity Log
       await ActivityLog.create({
         action: eventType,
         task: doc._id,
         workspace: doc.workspace,
         user: doc.assignee || doc.createdBy, // simplification
         details
       });
       
       // Workflow Queue
       workflowQueue.add('workflowJob', {
         eventType,
         task: doc,
         previousTaskState: original
       });
    }
  } catch (error) {
    console.error('Error in Task post-save hook:', error);
  }
});

export default mongoose.model('Task', taskSchema);
