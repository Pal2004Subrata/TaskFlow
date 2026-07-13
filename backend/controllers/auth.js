import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { signupSchema, loginSchema } from '../utils/validations.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const validationResult = signupSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { name, email, password } = validationResult.data;

  const newUser = await User.create({
    name,
    email,
    password
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { email, password } = validationResult.data;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('No account found with this email. Please create an account first.', 401));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // Prevent password updates here
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /update-password', 400));
  }

  const { name, email, avatar } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (avatar !== undefined) updateData.avatar = avatar;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser
    }
  });
});

export const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50); // Get last 50 notifications

  res.status(200).json({
    success: true,
    data: {
      notifications
    }
  });
});

export const markNotificationRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      notification
    }
  });
});

export const markAllNotificationsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  if (!req.body.password || req.body.password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, res);
});
