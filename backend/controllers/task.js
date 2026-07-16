import Task from '../models/Task.js';
import Workspace from '../models/Workspace.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { taskSchema, taskUpdateSchema } from '../utils/validations.js';
import { parseSmartQuery } from '../utils/smartFeatures.js';

// Middleware to check if user belongs to workspace
export const checkWorkspaceAccess = catchAsync(async (req, res, next) => {
  const workspaceId = req.body?.workspace || req.query?.workspace;
  
  if (!workspaceId) {
    return next(new AppError('Workspace ID is required', 400));
  }

  const workspace = await Workspace.findOne({ _id: workspaceId, members: req.user._id });
  
  if (!workspace) {
    return next(new AppError('You do not have access to this workspace', 403));
  }
  
  req.workspace = workspace;
  next();
});

export const createTask = catchAsync(async (req, res, next) => {
  const validationResult = taskSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const taskData = { ...validationResult.data, createdBy: req.user._id };
  // If assignee is empty string, don't set it
  if (taskData.assignee === '') {
    delete taskData.assignee;
  }
  if (taskData.dueDate === '') {
    delete taskData.dueDate;
  }

  const task = await Task.create(taskData);

  // Notify assignee if someone else assigned it to them
  if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: task.assignee,
      title: 'New Task Assigned',
      message: `You have been assigned to a new task: "${task.title}"`,
      link: `/workspace/${task.workspace}`
    });
  }

  res.status(201).json({
    success: true,
    data: {
      task
    }
  });
});

export const getTasks = catchAsync(async (req, res, next) => {
  const { workspace, search, status, priority, assignee, page = 1, limit = 10 } = req.query;

  const query = { workspace };

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignee = assignee;

  const skip = (page - 1) * limit;

  const tasks = await Task.find(query)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Task.countDocuments(query);

  res.status(200).json({
    success: true,
    results: tasks.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: {
      tasks
    }
  });
});

export const getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('workspace', 'name');

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // Ensure user is in the workspace
  const workspace = await Workspace.findOne({ _id: task.workspace._id, members: req.user._id });
  if (!workspace) {
    return next(new AppError('You do not have access to this task', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      task
    }
  });
});

export const updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // Authorization: Only creator or current assignee can edit
  if (task.createdBy.toString() !== req.user._id.toString() && task.assignee?.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to edit this task', 403));
  }
  const validationResult = taskUpdateSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }
  
  // Permission checks
  const isCreator = task.createdBy.toString() === req.user._id.toString();
  const isAssignee = task.assignee?.toString() === req.user._id.toString();

  if (!isCreator && !isAssignee) {
    return next(new AppError('You do not have permission to edit this task', 403));
  }

  // If user is assignee but not creator, they can only update status
  if (isAssignee && !isCreator) {
    const allowedKeys = ['status'];
    const updateKeys = Object.keys(validationResult.data);
    
    // Check if they are trying to update anything other than status
    const hasForbiddenUpdates = updateKeys.some(key => !allowedKeys.includes(key) && validationResult.data[key] !== undefined && validationResult.data[key] !== task[key]);
    
    // We allow the request to pass but we strip out any forbidden updates
    // by explicitly overwriting the data with only the status
    const newStatus = validationResult.data.status;
    
    Object.keys(validationResult.data).forEach(key => delete validationResult.data[key]);
    if (newStatus) {
      validationResult.data.status = newStatus;
    }
  }

  // Prevent priority change on backend if non-creator is trying to change it
  if (validationResult.data.priority && validationResult.data.priority !== task.priority) {
    if (!isCreator) {
      // Revert the priority change
      validationResult.data.priority = task.priority;
    }
  } 

  const updateData = { ...validationResult.data };
  if (updateData.assignee === '') {
      updateData.$unset = { assignee: 1 };
      delete updateData.assignee;
  }
  if (updateData.dueDate === '') {
      updateData.$unset = { ...updateData.$unset, dueDate: 1 };
      delete updateData.dueDate;
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('assignee', 'name email').populate('createdBy', 'name email');

  // Notify assignee if the assignee was changed and it's not the user doing the updating
  if (
    updateData.assignee && 
    task.assignee?.toString() !== updateData.assignee.toString() &&
    updateData.assignee.toString() !== req.user._id.toString()
  ) {
    await Notification.create({
      user: updateData.assignee,
      title: 'Task Assigned',
      message: `You have been assigned to the task: "${updatedTask.title}"`,
      link: `/workspace/${updatedTask.workspace}`
    });
  }

  res.status(200).json({
    success: true,
    data: {
      task: updatedTask
    }
  });
});

export const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  // Authorization: Only creator can delete
  if (task.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the task creator can delete this task', 403));
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    data: null
  });
});

export const smartSearch = catchAsync(async (req, res, next) => {
  const { query, workspace } = req.query;
  if (!query || !workspace) {
     return next(new AppError('Query and workspace are required', 400));
  }
  
  const tasks = await parseSmartQuery(query, workspace);
  res.status(200).json({
    success: true,
    results: tasks.length,
    data: { tasks }
  });
});
