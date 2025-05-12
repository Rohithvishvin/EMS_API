const mongoose = require('mongoose');

const AuthenticationTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  device_info: {
    type: String,
    default: '',
  },
  expires_at: {
    type: Date,
    required: true,
  },
  last_used_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('AuthenticationToken', AuthenticationTokenSchema);
