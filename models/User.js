const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  joining_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  profile_photo_url: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  phone_verified: {
    type: Boolean,
    default: false,
  },
  preferred_verification: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email',
  },
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

// Compare passwords method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);
