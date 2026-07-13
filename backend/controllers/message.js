import Message from '../models/Message.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Workspace from '../models/Workspace.js';
import Notification from '../models/Notification.js';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  replyTo: z.string().optional().nullable(),
  mentions: z.array(z.string()).optional()
});

// Fetch messages for a workspace
export const getMessages = catchAsync(async (req, res, next) => {
  const { workspaceId } = req.params;

  // Verify access
  const workspace = await Workspace.findOne({ _id: workspaceId, members: req.user._id });
  if (!workspace) {
    return next(new AppError('You do not have access to this workspace', 403));
  }

  const messages = await Message.find({ workspace: workspaceId })
    .populate('sender', 'name avatar')
    .populate({
      path: 'replyTo',
      select: 'content sender',
      populate: { path: 'sender', select: 'name' }
    })
    .sort({ createdAt: 1 }); // Oldest first

  res.status(200).json({
    success: true,
    results: messages.length,
    data: {
      messages
    }
  });
});

// Send a new message
export const sendMessage = catchAsync(async (req, res, next) => {
  const { workspaceId } = req.params;

  // Verify access
  const workspace = await Workspace.findOne({ _id: workspaceId, members: req.user._id });
  if (!workspace) {
    return next(new AppError('You do not have access to this workspace', 403));
  }

  const validationResult = messageSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues[0].message, 400));
  }

  const message = await Message.create({
    workspace: workspaceId,
    sender: req.user._id,
    content: validationResult.data.content,
    replyTo: validationResult.data.replyTo || null,
    mentions: validationResult.data.mentions || []
  });

  // Populate sender and replyTo to return immediately to the client
  await message.populate([
    { path: 'sender', select: 'name avatar' },
    { 
      path: 'replyTo', 
      select: 'content sender',
      populate: { path: 'sender', select: 'name' } 
    }
  ]);

  // Create notifications for mentioned users
  if (validationResult.data.mentions && validationResult.data.mentions.length > 0) {
    const notifications = validationResult.data.mentions
      .filter(userId => userId.toString() !== req.user._id.toString())
      .map(userId => ({
        user: userId,
        title: 'You were mentioned',
        message: `${req.user.name} mentioned you in the Team Chat of "${workspace.name}"`,
        link: `/workspace/${workspaceId}`
      }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json({
    success: true,
    data: {
      message
    }
  });
});
