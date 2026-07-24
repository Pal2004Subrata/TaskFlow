import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', 'login'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes TTL
  },
});

export default mongoose.model('OTP', otpSchema);
