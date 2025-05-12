const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User', // Foreign key to the User schema
  },
  leave_type_id: {
    type: String,
    required: true,
    ref: 'LeaveType', // Foreign key to the LeaveType schema
  },
  year: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => v >= 2000 && v <= 2100, // Valid year range
      message: 'Invalid year range',
    },
  },
  allocated: {
    type: mongoose.Decimal128,
    required: true,
    default: 0, // Default allocated leave days
  },
  used: {
    type: mongoose.Decimal128,
    required: true,
    default: 0, // Default used leave days
  },
  pending: {
    type: mongoose.Decimal128,
    required: true,
    default: 0, // Default pending leave days
  },
  adjustment: {
    type: mongoose.Decimal128,
    required: true,
    default: 0, // Default adjustment (positive or negative)
  },
  adjustment_reason: {
    type: String,
    required: false, // Optional reason for adjustment
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now, // Automatically set the creation timestamp
  },
  updated_at: {
    type: Date,
    default: Date.now, // Automatically set the updated timestamp
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create a unique index for (user_id, leave_type_id, year) combination
LeaveBalanceSchema.index({ user_id: 1, leave_type_id: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
