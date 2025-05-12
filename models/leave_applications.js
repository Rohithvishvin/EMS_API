const mongoose = require('mongoose');

const LeaveApplicationSchema = new mongoose.Schema({
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
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  duration: {
    type: mongoose.Decimal128,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending', // Default status is 'pending'
    required: true,
  },
  applied_on: {
    type: Date,
    default: Date.now,
    required: true,
  },
  approved_by: {
    type: String,
    ref: 'User', // Foreign key to the User schema (Admin who approved/rejected)
    required: false, // Optional, may not be set if the leave is not yet approved/rejected
  },
  approval_date: {
    type: Date,
    required: false, // Optional, will be set once the leave is approved/rejected
  },
  remarks: {
    type: String,
    required: false, // Optional remarks from the approver
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Index to ensure that there are no duplicate leave applications for the same user for overlapping dates
LeaveApplicationSchema.index({ user_id: 1, start_date: 1, end_date: 1 }, { unique: true });

module.exports = mongoose.model('LeaveApplication', LeaveApplicationSchema);
