import mongoose from 'mongoose';

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
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
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
  }
}, { timestamps: true });

// Indexes for performance
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ title: 'text' });

export default mongoose.model('Task', taskSchema);
