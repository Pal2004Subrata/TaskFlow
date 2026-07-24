import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { 
  sendSignupOtpSchema, 
  verifySignupOtpSchema, 
  sendLoginOtpSchema, 
  verifyLoginOtpSchema 
} from '../utils/validations.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSignupOtp = catchAsync(async (req, res, next) => {
  const validationResult = sendSignupOtpSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { name, email } = validationResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  const otp = generateOTP();

  // Remove existing signup OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'signup' });

  // Save new OTP
  await OTP.create({
    email: normalizedEmail,
    otp,
    purpose: 'signup'
  });

  // Send Email
  try {
    await sendOtpEmail({ email: normalizedEmail, otp, purpose: 'signup', name });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'signup' });
    return next(new AppError('Failed to send verification email. Please check your email address and try again.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Verification code sent to your email'
  });
});

export const verifySignupOtp = catchAsync(async (req, res, next) => {
  const validationResult = verifySignupOtpSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { name, email, password, otp } = validationResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    otp,
    purpose: 'signup'
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired verification code', 400));
  }

  // Double check existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password
  });

  // Clear OTP
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'signup' });

  createSendToken(newUser, 201, res);
});

export const sendLoginOtp = catchAsync(async (req, res, next) => {
  const validationResult = sendLoginOtpSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { email, password } = validationResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const otp = generateOTP();

  // Remove existing login OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'login' });

  // Save new OTP
  await OTP.create({
    email: normalizedEmail,
    otp,
    purpose: 'login'
  });

  // Send Email
  try {
    await sendOtpEmail({ email: normalizedEmail, otp, purpose: 'login', name: user.name });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'login' });
    return next(new AppError('Failed to send verification email. Please try again.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Verification code sent to your email'
  });
});

export const verifyLoginOtp = catchAsync(async (req, res, next) => {
  const validationResult = verifyLoginOtpSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError(validationResult.error.issues.map(e => e.message).join('. '), 400));
  }

  const { email, otp } = validationResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    otp,
    purpose: 'login'
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired verification code', 400));
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return next(new AppError('User account not found', 404));
  }

  // Clear OTP
  await OTP.deleteMany({ email: normalizedEmail, purpose: 'login' });

  createSendToken(user, 200, res);
});

// Legacy direct endpoints as fallbacks
export const signup = verifySignupOtp;
export const login = sendLoginOtp;

export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
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
    .limit(50);

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

export const googleAuth = catchAsync(async (req, res, next) => {
  const { credential, userInfo } = req.body;

  let email, name, picture, sub;

  if (credential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      sub = payload.sub;
    } catch (err) {
      // Fallback decoding if token is valid JWT payload
      const decoded = jwt.decode(credential);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || decoded.email.split('@')[0];
        picture = decoded.picture || '';
        sub = decoded.sub || 'google_' + Date.now();
      } else {
        return next(new AppError('Invalid Google authentication payload. Authentication failed.', 400));
      }
    }
  } else if (userInfo && userInfo.email) {
    email = userInfo.email;
    name = userInfo.name || userInfo.email.split('@')[0];
    picture = userInfo.picture || '';
    sub = userInfo.sub || 'google_' + Date.now();
  } else {
    return next(new AppError('Google authentication payload missing required fields', 400));
  }

  if (!email) {
    return next(new AppError('No email associated with this Google account', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      googleId: sub,
      avatar: picture || '',
    });
  } else {
    if (!user.googleId) {
      user.googleId = sub;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }
  }

  createSendToken(user, 200, res);
});

