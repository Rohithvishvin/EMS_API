const mongoose = require('mongoose');

const OtpCodeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'phone_verification', 'login', 'password_reset'],
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
  },
  is_used: {
    type: Boolean,
    default: false,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  used_at: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

OtpCodeSchema.index({ user_id: 1, type: 1, channel: 1 }); // Optional for performance

module.exports = mongoose.model('OtpCode', OtpCodeSchema);
