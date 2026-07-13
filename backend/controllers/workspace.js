import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { workspaceSchema } from '../utils/validations.js';

export const createWorkspace = catchAsync(async (req, res, next) => {
  const validationResult = workspaceSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const workspace = await Workspace.create({
    name: validationResult.data.name,
    owner: req.user._id,
    members: [req.user._id]
  });

  res.status(201).json({
    success: true,
    data: {
      workspace
    }
  });
});

export const getWorkspaces = catchAsync(async (req, res, next) => {
  const workspaces = await Workspace.find({ members: req.user._id })
    .populate('owner', 'name email')
    .populate('members', 'name email');

  res.status(200).json({
    success: true,
    results: workspaces.length,
    data: {
      workspaces
    }
  });
});

export const getWorkspace = catchAsync(async (req, res, next) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, members: req.user._id })
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!workspace) {
    return next(new AppError('No workspace found with that ID or you are not a member', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      workspace
    }
  });
});

export const inviteMember = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Please provide an email to invite', 400));
  }

  const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user._id });

  if (!workspace) {
    return next(new AppError('No workspace found with that ID or you are not the owner', 404));
  }

  const userToInvite = await User.findOne({ email });

  if (!userToInvite) {
    return next(new AppError('No user found with that email', 404));
  }

  if (workspace.members.includes(userToInvite._id)) {
    return next(new AppError('User is already a member of this workspace', 400));
  }

  if (workspace.pendingMembers.includes(userToInvite._id)) {
    return next(new AppError('User has already been invited', 400));
  }

  workspace.pendingMembers.push(userToInvite._id);
  await workspace.save();

  res.status(200).json({
    success: true,
    message: 'Invite sent successfully',
    data: {
      workspace
    }
  });
});

export const getPendingInvites = catchAsync(async (req, res, next) => {
  const invites = await Workspace.find({ pendingMembers: req.user._id })
    .populate('owner', 'name email');

  res.status(200).json({
    success: true,
    data: {
      invites
    }
  });
});

export const acceptInvite = catchAsync(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace || !workspace.pendingMembers.includes(req.user._id)) {
    return next(new AppError('Invite not found or already processed', 404));
  }

  // Remove from pending, add to members
  workspace.pendingMembers = workspace.pendingMembers.filter(id => id.toString() !== req.user._id.toString());
  if (!workspace.members.includes(req.user._id)) {
    workspace.members.push(req.user._id);
  }
  await workspace.save();

  res.status(200).json({
    success: true,
    message: 'Invite accepted',
    data: { workspace }
  });
});

export const rejectInvite = catchAsync(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace || !workspace.pendingMembers.includes(req.user._id)) {
    return next(new AppError('Invite not found or already processed', 404));
  }

  // Remove from pending
  workspace.pendingMembers = workspace.pendingMembers.filter(id => id.toString() !== req.user._id.toString());
  await workspace.save();

  res.status(200).json({
    success: true,
    message: 'Invite rejected'
  });
});

export const deleteWorkspace = catchAsync(async (req, res, next) => {
  const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user._id });

  if (!workspace) {
    return next(new AppError('No workspace found with that ID or you are not the owner', 404));
  }

  // Delete all tasks associated with this workspace
  await Task.deleteMany({ workspace: workspace._id });

  await Workspace.findByIdAndDelete(workspace._id);

  res.status(204).json({
    success: true,
    data: null
  });
});
