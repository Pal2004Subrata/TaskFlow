import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace must have a name'],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Workspace must belong to an owner']
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  pendingMembers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ members: 1 });

export default mongoose.model('Workspace', workspaceSchema);
