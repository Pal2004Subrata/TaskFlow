import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
    required: function() {
      // Password is required only if googleId is not present
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: ''
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  if (!userPassword) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);
