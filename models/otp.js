const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 }, // auto-delete after 3 mins
});

module.exports = mongoose.model('Otp', otpSchema);

